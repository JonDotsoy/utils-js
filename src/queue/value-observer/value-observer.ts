/**
 * A reactive observer pattern implementation for watching value changes.
 *
 * The ValueObserver class allows monitoring changes to a value and notifying
 * registered callbacks whenever the value is updated. In the queue system,
 * it's used to track queue state and message acknowledgment status.
 *
 * @template T - The type of the observed value
 *
 * @example
 * ```typescript
 * const observer = new ValueObserver(42);
 * const unsubscribe = observer.subscribe(value => console.log(value));
 * observer.set(100); // Logs: 100
 * unsubscribe();
 * ```
 */
export class ValueObserver<T> {
  #value: T;
  #callbacks = new Set<(value: T) => void>();

  /**
   * Creates a new ValueObserver with an initial value.
   * @param value - The initial value to observe
   */
  constructor(value: T) {
    this.#value = value;
  }

  /**
   * Gets the current value.
   * @returns The current observed value
   */
  get(): T {
    return this.#value;
  }

  /**
   * Sets a new value and notifies all registered callbacks.
   * @param value - The new value to set
   */
  set(value: T) {
    const diff = this.#value !== value;
    this.#value = value;
    if (diff) {
      this.propagateChange();
    }
  }

  /**
   * Notifies all registered callbacks of the current value.
   * @private
   */
  private propagateChange() {
    for (const callback of this.#callbacks) {
      callback(this.#value);
    }
  }

  /**
   * Registers a callback to be called when the value changes.
   * @param callback - Function to call when the value changes
   * @returns Function to unregister the callback
   */
  listen(callback: (value: T) => void) {
    this.#callbacks.add(callback);
    return () => this.#callbacks.delete(callback);
  }

  /**
   * Registers a callback and immediately calls it with the current value.
   * @param callback - Function to call when the value changes
   * @returns Function to unregister the callback
   */
  subscribe(callback: (value: T) => void) {
    const unsub = this.listen(callback);
    callback(this.#value);
    return unsub;
  }

  /**
   * Creates an {@link AbortSignal} that is automatically aborted when the observed value becomes falsy.
   *
   * If the current value is already falsy, the signal is immediately aborted.
   * If the current value is truthy, the method subscribes to value changes and aborts
   * the signal when the value transitions to a falsy state.
   *
   * @returns An object containing:
   *   - `signal`: An {@link AbortSignal} that will be aborted when the value becomes falsy
   *   - `[Symbol.dispose]`: A cleanup function that unsubscribes from value changes
   *
   * @example
   * ```typescript
   * const observer = new ValueObserver(true);
   * const { signal, [Symbol.dispose]: dispose } = observer.createAbortSignal();
   *
   * // Signal is not aborted initially since value is truthy
   * console.log(signal.aborted); // false
   *
   * // Change value to falsy - signal will be aborted
   * observer.set(false);
   * console.log(signal.aborted); // true
   *
   * // Clean up subscription
   * dispose();
   * ```
   */
  createAbortSignal(): { [Symbol.dispose]: () => void; signal: AbortSignal } {
    /**
     * Determines whether the current value retrieved by `get()` is falsy.
     *
     * @returns {boolean} `true` if the value returned by `get()` is falsy; otherwise, `false`.
     */
    const isFalsy = (): boolean => !this.get();
    const controller = new AbortController();
    const falsy = isFalsy();
    let unsubscribe: (() => void) | null = null;

    if (falsy) {
      controller.abort();
    }

    if (!falsy) {
      unsubscribe = this.subscribe(() => {
        if (isFalsy()) {
          controller.abort();
          unsubscribe?.();
        }
      });
    }

    return {
      [Symbol.dispose]: () => {
        unsubscribe?.();
      },
      signal: controller.signal,
    };
  }
}
