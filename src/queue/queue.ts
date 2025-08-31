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
class ValueObserver<T> {
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
}

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
class AbortableValueObserver<T> extends ValueObserver<T> {
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

/**
 * Represents a message in the queue system.
 *
 * Each message contains data, a unique identifier, timestamps for creation
 * and acknowledgment, and methods for managing its lifecycle.
 *
 * @example
 * ```typescript
 * const message = new Message({ task: "process-data", priority: 1 });
 * console.log(message.id); // Auto-generated UUID
 * message.acknowledge(); // Marks message as acknowledged
 * ```
 */
export class Message<T extends object = any> {
  /** Unique identifier for the message */
  id: string = crypto.randomUUID();
  /** Timestamp when the message was created */
  createdAt: number;
  /** Timestamp when the message was last acknowledged, null if never acknowledged */
  acknowledgedAt: null | number = null;

  /**
   * Creates a new message with the provided data.
   * @param data - The payload data for this message
   */
  constructor(
    public data: T,
    createdAt?: number,
  ) {
    this.createdAt = createdAt ?? Date.now();
  }

  /**
   * Marks the message as acknowledged with the current timestamp.
   * This is used to track when the message was last processed or claimed.
   */
  acknowledge() {
    this.acknowledgedAt = Date.now();
  }
}

/**
 * Abstract base class representing a message store for a queue system.
 *
 * Implementations of this class are responsible for persisting, retrieving,
 * acknowledging, deleting, and claiming messages within a queue. This abstraction
 * allows for different storage backends (memory, database, file system, etc.).
 *
 * @remarks
 * - All methods are async to support various storage implementations
 * - The `claimMessage` method is atomic and should handle concurrent access safely
 * - Implementations should ensure message consistency and prevent data loss
 *
 * @example
 * ```typescript
 * class DatabaseStore extends Store {
 *   async addMessage(message: Message): Promise<void> {
 *     // Implementation for database storage
 *   }
 *   // ... other method implementations
 * }
 * ```
 */
export abstract class Store {
  /**
   * Adds a new message to the store.
   * @param message - The message to add to the store
   */
  abstract addMessage(message: Message): Promise<void>;

  /**
   * Retrieves a message by its ID.
   * @param messageId - The unique identifier of the message
   * @returns The message if found, null otherwise
   */
  abstract getMessage(messageId: string): Promise<Message | null>;

  /**
   * Acknowledges a message by updating its acknowledgedAt timestamp.
   * @param messageId - The unique identifier of the message to acknowledge
   */
  abstract acknowledgeMessage(messageId: string): Promise<void>;

  /**
   * Permanently deletes a message from the store.
   * @param messageId - The unique identifier of the message to delete
   */
  abstract deleteMessage(messageId: string): Promise<void>;

  /**
   * Atomically finds an unacknowledged message and claims it by acknowledging it.
   *
   * A message is considered unacknowledged if:
   * - It has never been acknowledged (acknowledgedAt is null), OR
   * - Its last acknowledgment was older than the timeout period
   *
   * @param acknowledgeTimeoutMs - Timeout in milliseconds for considering messages unacknowledged
   * @param now - Current timestamp to compare against
   * @returns The claimed message if found, null if no unacknowledged messages exist
   */
  abstract claimMessage(
    acknowledgeTimeoutMs: number,
    now: number,
    abort?: AbortSignal,
  ): Promise<Message | null>;

  /**
   * Gets the total number of messages currently in the store.
   * @returns The count of messages in the store
   */
  abstract getSize(): Promise<number>;
}

/**
 * In-memory implementation of the Store abstract class.
 *
 * This store keeps all messages in memory using a simple array. It's suitable
 * for development, testing, or applications where message persistence across
 * restarts is not required.
 *
 * @remarks
 * - All messages are lost when the application restarts
 * - Not suitable for production use where message durability is important
 * - Good for testing and development environments
 *
 * @example
 * ```typescript
 * const store = new MemoryStore();
 * const queue = new Queue({ store });
 * ```
 */
export class MemoryStore extends Store {
  /** Array containing all messages currently stored in memory */
  messages: Message[] = [];
  /** Observer tracking the current size of the queue */
  queueSize = new ValueObserver(0);
  lastMessageId = new ValueObserver<string | null>(null);

  /**
   * Adds a message to the in-memory array.
   * @param message - The message to add
   */
  async addMessage(message: Message) {
    this.messages.push(message);
    this.queueSize.set(this.messages.length);
    this.lastMessageId.set(message.id);
  }

  /**
   * Finds a message by ID in the messages array.
   * @param messageId - The unique identifier of the message
   * @returns The message if found, null otherwise
   */
  async getMessage(messageId: string): Promise<Message | null> {
    return this.messages.find((message) => message.id === messageId) ?? null;
  }

  /**
   * Acknowledges a message by updating its acknowledgedAt timestamp.
   * @param messageId - The unique identifier of the message to acknowledge
   */
  async acknowledgeMessage(messageId: string) {
    const message = await this.getMessage(messageId);
    message?.acknowledge();
  }

  /**
   * Removes a message from the messages array.
   * @param messageId - The unique identifier of the message to delete
   */
  async deleteMessage(messageId: string) {
    this.messages = this.messages.filter((message) => message.id !== messageId);
    this.queueSize.set(this.messages.length);
  }

  /**
   * Finds the first unacknowledged message and claims it by acknowledging it.
   *
   * This implementation is not truly atomic in a concurrent environment,
   * but is sufficient for single-threaded applications.
   *
   * @param acknowledgeTimeoutMs - Timeout for considering messages unacknowledged
   * @param now - Current timestamp
   * @returns The claimed message if found, null otherwise
   */
  async claimMessage(
    acknowledgeTimeoutMs: number,
    now: number,
    signal?: AbortSignal,
  ): Promise<Message | null> {
    const timeStart = Date.now();
    const claimActive = new AbortableValueObserver(true, () => false);
    if (signal) claimActive.addSignal(signal);

    while (claimActive.get()) {
      const message =
        this.messages.find((message) => {
          const acknowledgedAt = message.acknowledgedAt;
          const a = Date.now() - timeStart + now;
          return (
            acknowledgedAt === null || acknowledgedAt < a - acknowledgeTimeoutMs
          );
        }) ?? null;
      if (!message) {
        await new Promise((r) => setTimeout(r, 50));
        continue;
      }
      message?.acknowledge();
      return message;
    }

    return null;
  }

  /**
   * Returns the number of messages in the array.
   * @returns The count of messages
   */
  async getSize(): Promise<number> {
    return this.messages.length;
  }
}

/**
 * Configuration options for creating a Queue instance.
 */
type QueueOptions = {
  /** Time in milliseconds before a message is considered unacknowledged and can be reclaimed. Default: 100ms */
  messageTimeoutMs?: number;
  /** Interval in milliseconds for sending keep-alive acknowledgments while processing a message. Default: 100ms */
  ackIntervalMs?: number;
  /** Custom store implementation for message persistence. Default: new MemoryStore() */
  store?: Store;
};

/**
 * Represents a persistent, asynchronous message queue with support for message acknowledgment,
 * polling, and manual message confirmation.
 *
 * The `Queue` class provides a robust message queue implementation with features like:
 * - Asynchronous message consumption using async iterators
 * - Manual message acknowledgment to prevent message loss
 * - Configurable polling and timeout behavior
 * - Pluggable storage backends via the Store interface
 * - Keep-alive mechanism to prevent message timeout during processing
 * - At-least-once delivery semantics
 *
 * @example
 * Basic usage:
 * ```typescript
 * const queue = new Queue();
 *
 * // Add messages
 * await queue.add({ task: "process-data", userId: 123 });
 * await queue.add({ task: "send-email", to: "user@example.com" });
 *
 * // Consume messages with manual acknowledgment
 * for await (const message of queue) {
 *   try {
 *     console.log("Processing:", message);
 *     // Process the message...
 *     await processMessage(message);
 *
 *     // Acknowledge successful processing
 *     queue.ack(message);
 *   } catch (error) {
 *     // Don't acknowledge - message will be reclaimed
 *     console.error("Processing failed:", error);
 *   }
 * }
 * ```
 *
 * @example
 * With custom configuration:
 * ```typescript
 * const queue = new Queue({
 *   pollingIntervalMs: 1000,    // Poll every second
 *   messageTimeoutMs: 30000,    // 30 second timeout
 *   ackIntervalMs: 5000,        // Keep-alive every 5 seconds
 *   store: new DatabaseStore()  // Custom storage backend
 * });
 * ```
 *
 * @remarks
 * - Messages are acknowledged periodically while being processed to prevent re-delivery
 * - The keep-alive mechanism ensures long-running message processing doesn't timeout
 * - Messages are **only deleted** when explicitly acknowledged with ack() or acknowledgeMessage()
 * - Failed or unacknowledged messages are automatically reclaimed after timeout
 */
export class Queue {
  /** Timeout for considering messages as unacknowledged (ms) */
  #messageTimeoutMs: number;
  /** Interval for acknowledgment process */
  #ackIntervalMs: number;
  /** Store for persisting messages */
  #store: Store;

  /** Observer that tracks whether the queue is actively processing messages */
  #queueIsActive = new ValueObserver<boolean>(true);

  /** WeakMap tracking acknowledgment state for each message being processed */
  #messageAcknowledgments = new WeakMap<WeakKey, ValueObserver<boolean>>();

  /**
   * Creates a new Queue instance with optional configuration.
   *
   * @param options - Configuration options for the queue behavior and storage
   */
  constructor(options?: QueueOptions) {
    this.#messageTimeoutMs = options?.messageTimeoutMs ?? 100;
    this.#ackIntervalMs = options?.ackIntervalMs ?? 100;
    this.#store = options?.store ?? new MemoryStore();
  }

  /**
   * Adds a new message to the queue.
   *
   * The message will be wrapped in a Message instance with auto-generated ID
   * and timestamp before being stored.
   *
   * @param data - The data payload for the message
   *
   * @example
   * ```typescript
   * await queue.add({ userId: 123, action: "process" });
   * await queue.add("simple string message");
   * await queue.add({ complex: { nested: "object" } });
   * ```
   */
  async add<T extends object>(data: T) {
    const message = new Message(data);
    await this.#store.addMessage(message);
  }

  /**
   * Creates a keep-alive process for a message to prevent timeout during processing.
   *
   * This process periodically acknowledges the message while it's being processed
   * to prevent it from being considered unacknowledged and reclaimed by another consumer.
   *
   * @param message - The message to keep alive during processing
   * @param activated - Observer that controls when the keep-alive process should stop
   * @returns Object with a promise that resolves when the keep-alive process ends
   * @private
   */
  private createKeepAliveProcess(
    message: Message,
    activated: ValueObserver<boolean>,
  ) {
    const promise = Promise.withResolvers<void>();
    const interval = setInterval(async () => {
      await this.#store.acknowledgeMessage(message.id);
    }, this.#ackIntervalMs);
    const unsubscribe = activated.subscribe((value) => {
      if (!value) {
        clearInterval(interval);
        promise.resolve();
        unsubscribe();
      }
    });
    return { promise };
  }

  /**
   * Marks a message as successfully processed for deletion from the queue.
   *
   * This method signals that the message has been successfully processed and should
   * be deleted from the store. Only acknowledged messages are deleted; unacknowledged
   * messages will be reclaimed by other workers after the timeout period.
   *
   * @param messageRef - The message data (payload) that was yielded by consume()
   *
   * @example
   * ```typescript
   * for await (const messageData of queue.consume()) {
   *   try {
   *     await processMessage(messageData);
   *     queue.acknowledgeMessage(messageData); // Mark as processed
   *   } catch (error) {
   *     // Don't acknowledge - message will be reclaimed
   *     console.error("Processing failed:", error);
   *   }
   * }
   * ```
   */
  acknowledgeMessage(messageRef: any) {
    const consumed = this.#messageAcknowledgments.get(messageRef);
    consumed?.set(true);
  }

  /**
   * Marks a message as successfully processed for deletion from the queue.
   *
   * This is a convenience method that calls `acknowledgeMessage()`. Use this method
   * to signal that a message has been successfully processed and should be deleted.
   *
   * @param messageRef - The message data (payload) that was yielded by consume()
   *
   * @example
   * ```typescript
   * for await (const messageData of queue.consume()) {
   *   try {
   *     await processMessage(messageData);
   *     queue.ack(messageData); // Mark as processed
   *   } catch (error) {
   *     // Don't acknowledge - message will be reclaimed
   *     console.error("Processing failed:", error);
   *   }
   * }
   * ```
   */
  ack(messageRef: any) {
    this.acknowledgeMessage(messageRef);
  }

  /**
   * Consumes messages from the queue as an async generator.
   *
   * This method continuously polls the store for unacknowledged messages,
   * processes them with keep-alive acknowledgments, yields the message data,
   * and then deletes the message **only if** it has been explicitly acknowledged.
   *
   * The consumer will:
   * 1. Claim an unacknowledged message from the store
   * 2. Start a keep-alive process to prevent timeout
   * 3. Yield the message data for processing
   * 4. Check if message was acknowledged with ack() or acknowledgeMessage()
   * 5. Delete the message from the store only if acknowledged
   * 6. Stop the keep-alive process
   * 7. Repeat while queue is active
   *
   * @param signal - Optional AbortSignal for cancellation (currently not implemented)
   * @yields The data payload of each message in the queue
   *
   * @example
   * Basic usage with manual acknowledgment:
   * ```typescript
   * for await (const messageData of queue.consume()) {
   *   try {
   *     console.log("Processing message:", messageData);
   *     // Your message processing logic here
   *     await processMessage(messageData);
   *
   *     // Acknowledge successful processing
   *     queue.ack(messageData);
   *   } catch (error) {
   *     // Don't acknowledge - message will be reclaimed
   *     console.error("Processing failed:", error);
   *   }
   * }
   * ```
   *
   * @example
   * Using with AbortSignal (when implemented):
   * ```typescript
   * const controller = new AbortController();
   *
   * const consumePromise = (async () => {
   *   try {
   *     for await (const messageData of queue.consume(controller.signal)) {
   *       console.log("Processing:", messageData);
   *       await processMessage(messageData);
   *       queue.ack(messageData);
   *     }
   *   } catch (error) {
   *     console.log("Queue consumption stopped");
   *   }
   * })();
   *
   * // Stop consumption after 10 seconds
   * setTimeout(() => controller.abort(), 10000);
   * ```
   */
  async *consume(signal?: AbortSignal) {
    using consumeIsActive = new AbortableValueObserver(
      true,
      () => false,
      signal ? [signal] : [],
    );
    while (consumeIsActive.get()) {
      const message = await this.#store.claimMessage(
        this.#messageTimeoutMs,
        Date.now(),
        signal,
      );
      if (message) {
        const consumed = new ValueObserver(false);
        const activated = new ValueObserver(true);
        const keepAliveProcess = this.createKeepAliveProcess(
          message,
          activated,
        );
        this.#messageAcknowledgments.set(message.data, consumed);
        try {
          yield message.data;
        } finally {
          activated.set(false);
          if (consumed.get()) {
            await this.#store.deleteMessage(message.id);
          }
          await keepAliveProcess.promise;
        }
      }
    }
  }

  /**
   * Makes the Queue instance async iterable.
   *
   * This allows using the queue directly in `for await...of` loops,
   * providing a clean and intuitive API for message consumption.
   *
   * **Important:** Messages must be manually acknowledged with `ack()` or
   * `acknowledgeMessage()` to be deleted from the queue.
   *
   * @returns An async iterator that yields message data
   *
   * @example
   * ```typescript
   * // These are equivalent:
   * for await (const message of queue) {
   *   await processMessage(message);
   *   queue.ack(message); // Required for message deletion
   * }
   *
   * for await (const message of queue.consume()) {
   *   await processMessage(message);
   *   queue.ack(message); // Required for message deletion
   * }
   * ```
   */
  get [Symbol.asyncIterator]() {
    return () => this.consume();
  }
}
