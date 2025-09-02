import { ValueObserver } from "./value-observer.js";

/**
 * A disposable ValueObserver that automatically updates its value when AbortSignals are triggered.
 *
 * This class extends ValueObserver to provide automatic value updates based on abort signals,
 * making it ideal for tracking cancellation states in async operations. It supports monitoring
 * multiple abort signals simultaneously and implements the Disposable pattern for automatic
 * cleanup when used with the `using` declaration.
 *
 * Key features:
 * - Monitors multiple AbortSignals simultaneously
 * - Automatically updates value when any monitored signal is aborted
 * - Supports dynamic addition of new signals via `addSignal()`
 * - Implements Symbol.dispose for automatic resource cleanup
 * - Inherits all ValueObserver functionality (subscribe, listen, etc.)
 *
 * @template T - The type of the observed value (can be any type, not limited to boolean)
 *
 * @example
 * Basic usage with single abort signal:
 * ```typescript
 * const controller = new AbortController();
 *
 * using activeState = new AbortableValueObserver(
 *   true,                    // Initial value: active
 *   () => false,            // Value when aborted: inactive
 *   [controller.signal]     // Signals to monitor
 * );
 *
 * console.log(activeState.get()); // true
 * controller.abort();
 * console.log(activeState.get()); // false
 * // Cleanup happens automatically when leaving scope
 * ```
 *
 * @example
 * Multiple abort signals with dynamic addition:
 * ```typescript
 * const controller1 = new AbortController();
 * const controller2 = new AbortController();
 *
 * using observer = new AbortableValueObserver(
 *   "active",
 *   () => "cancelled",
 *   [controller1.signal]
 * );
 *
 * // Add another signal dynamically
 * observer.addSignal(controller2.signal);
 *
 * // Value becomes "cancelled" when ANY signal is aborted
 * controller2.abort(); // observer.get() === "cancelled"
 * ```
 *
 * @example
 * Using with subscriptions:
 * ```typescript
 * const controller = new AbortController();
 *
 * using statusObserver = new AbortableValueObserver(
 *   { status: "running", progress: 0 },
 *   () => ({ status: "cancelled", progress: 0 }),
 *   [controller.signal]
 * );
 *
 * const unsubscribe = statusObserver.subscribe(value => {
 *   console.log("Status changed:", value.status);
 * });
 *
 * controller.abort(); // Logs: "Status changed: cancelled"
 * ```
 */
export class AbortableValueObserver<T> extends ValueObserver<T> {
  /** Array of AbortSignals being monitored for abort events */
  #signals: AbortSignal[];
  /** Function that returns the new value when any signal is aborted */
  #abortValueFactory: () => T;

  /**
   * Creates a new AbortableValueObserver that monitors the provided abort signals.
   *
   * The observer will automatically call the `abortValueFactory` function and update
   * its value whenever any of the monitored signals is aborted. The signals array
   * is copied internally to prevent external modifications.
   *
   * @param initialValue - The initial value for the observer
   * @param abortValueFactory - Function that returns the value to set when any signal is aborted.
   *                           This function is called each time an abort occurs, allowing for
   *                           dynamic values based on the current state.
   * @param signals - Optional array of AbortSignals to monitor for abort events.
   *                 Can be empty or undefined, and new signals can be added later via `addSignal()`.
   *
   * @example
   * ```typescript
   * // With immediate signals
   * const observer = new AbortableValueObserver(
   *   "processing",
   *   () => "aborted",
   *   [signal1, signal2]
   * );
   *
   * // Without initial signals (add them later)
   * const observer = new AbortableValueObserver(
   *   { active: true },
   *   () => ({ active: false, reason: "aborted" })
   * );
   * observer.addSignal(mySignal);
   * ```
   */
  constructor(
    initialValue: T,
    abortValueFactory: () => T,
    signals?: AbortSignal[],
  ) {
    super(initialValue);
    this.#signals = [...(signals || [])]; // Create a copy to avoid external modifications
    this.#abortValueFactory = abortValueFactory;

    // Register abort listeners for all provided signals
    for (const signal of this.#signals) {
      this.#addSignalListener(signal);
    }
  }

  /**
   * Adds a new AbortSignal to be monitored and immediately registers its abort event listener.
   *
   * Once added, the signal will trigger the abort value factory function if it becomes aborted.
   * This method is useful for dynamically adding signals after the observer has been created,
   * such as when new operations are started that should cancel the current state.
   *
   * @param signal - The AbortSignal to add to the monitoring list. If the signal is already
   *                aborted when added, the abort handler will not be triggered immediately.
   *
   * @example
   * Dynamic signal management:
   * ```typescript
   * const observer = new AbortableValueObserver(
   *   { tasks: [], status: "idle" },
   *   () => ({ tasks: [], status: "cancelled" }),
   *   []
   * );
   *
   * // Start a new task
   * const taskController = new AbortController();
   * observer.addSignal(taskController.signal);
   *
   * // Start another task
   * const anotherController = new AbortController();
   * observer.addSignal(anotherController.signal);
   *
   * // Either controller aborting will trigger the observer update
   * ```
   *
   * @example
   * Adding timeout signals:
   * ```typescript
   * const observer = new AbortableValueObserver(
   *   true,
   *   () => false,
   *   [userController.signal]
   * );
   *
   * // Add a timeout signal
   * const timeoutController = new AbortController();
   * setTimeout(() => timeoutController.abort(), 5000);
   * observer.addSignal(timeoutController.signal);
   * ```
   */
  addSignal(signal: AbortSignal) {
    this.#signals.push(signal);
    this.#addSignalListener(signal);
  }

  /**
   * Adds an abort event listener to the specified signal.
   *
   * This method registers the internal abort handler to be called when the signal
   * is aborted. The handler is bound to maintain the correct `this` context.
   *
   * @param signal - The AbortSignal to attach the event listener to
   * @private
   */
  #addSignalListener(signal: AbortSignal) {
    if (signal.aborted) {
      this.#handleAbort();
      return;
    }
    signal.addEventListener("abort", this.#handleAbort);
  }

  /**
   * Handles the abort event by updating the observed value using the abort value factory.
   *
   * This method is automatically called when any monitored AbortSignal is aborted.
   * It calls the `abortValueFactory` function provided in the constructor to get the
   * new value and updates the observer, which will notify all subscribers.
   *
   * This method is implemented as an arrow function to maintain the correct `this` context
   * when used as an event listener callback.
   *
   * @private
   */
  #handleAbort = () => {
    this.set(this.#abortValueFactory());
  };

  /**
   * Disposes of the observer by removing all abort event listeners.
   *
   * This method implements the Disposable pattern and is automatically called when using
   * the `using` declaration. It ensures that all event listeners are properly cleaned up
   * to prevent memory leaks, especially important when working with long-lived AbortSignals.
   *
   * @remarks
   * After disposal, the observer will no longer respond to abort signals, but it will
   * continue to function as a regular ValueObserver for manual value updates via `set()`.
   * The observer's current value is preserved after disposal.
   *
   * @example
   * Manual disposal:
   * ```typescript
   * const observer = new AbortableValueObserver(true, () => false, [signal]);
   *
   * // Manual cleanup
   * observer[Symbol.dispose]();
   *
   * // Observer still works for manual updates
   * observer.set(false); // Still works
   * // But signal abort won't trigger updates anymore
   * ```
   *
   * @example
   * Automatic disposal with `using`:
   * ```typescript
   * {
   *   using observer = new AbortableValueObserver(true, () => false, [signal]);
   *   // Use observer...
   * } // Automatic cleanup happens here
   * ```
   */
  [Symbol.dispose]() {
    for (const signal of this.#signals) {
      signal.removeEventListener("abort", this.#handleAbort);
    }
  }
}
