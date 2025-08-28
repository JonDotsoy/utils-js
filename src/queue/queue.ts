/**
 * Read-only interface for value observers.
 *
 * This interface provides a contract for objects that can provide a value
 * without allowing direct modification. It's useful for creating immutable
 * value references or for dependency injection scenarios.
 *
 * @template T - The type of the observed value
 *
 * @example
 * ```typescript
 * const readOnlyValue: ReadOnlyValueObserver<number> = { get: () => 42 };
 * console.log(readOnlyValue.get()); // 42
 * ```
 */
export interface ReadOnlyValueObserver<T> {
  /**
   * Gets the current value.
   * @returns The current value
   */
  get(): T;
}

/**
 * A reactive observer pattern implementation for watching value changes.
 *
 * The ValueObserver class allows monitoring changes to a value and notifying
 * registered callbacks whenever the value is updated.
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
    this.#value = value;
    this.propagateChange();
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
   * Type guard to check if a value implements the ReadOnlyValueObserver interface.
   *
   * This method checks if the provided value has the required structure to be
   * considered a ReadOnlyValueObserver (an object with a 'get' method).
   *
   * @template T - The type of the value being observed
   * @param value - The value to check
   * @returns True if the value implements ReadOnlyValueObserver, false otherwise
   *
   * @example
   * ```typescript
   * const maybeObserver = { get: () => 42 };
   * if (ValueObserver.isReadOnlyValueObserver(maybeObserver)) {
   *   console.log(maybeObserver.get()); // TypeScript knows this is safe
   * }
   * ```
   */
  static isReadOnlyValueObserver<T>(
    value: any,
  ): value is ReadOnlyValueObserver<T> {
    return (
      typeof value === "object" &&
      value !== null &&
      "get" in value &&
      typeof value.get === "function"
    );
  }

  /**
   * Normalizes a value or ReadOnlyValueObserver into a ReadOnlyValueObserver.
   *
   * If the input is already a ReadOnlyValueObserver, it returns it unchanged.
   * If the input is a regular value, it wraps it in a ReadOnlyValueObserver.
   * This is useful for APIs that can accept either static values or observable values.
   *
   * @template T - The type of the value being observed
   * @param value - Either a direct value or a ReadOnlyValueObserver
   * @returns A ReadOnlyValueObserver that provides the value
   *
   * @example
   * ```typescript
   * // With a static value
   * const staticObserver = ValueObserver.readOnlyValueObserver(42);
   * console.log(staticObserver.get()); // 42
   *
   * // With an existing observer
   * const existingObserver = { get: () => 100 };
   * const normalizedObserver = ValueObserver.readOnlyValueObserver(existingObserver);
   * console.log(normalizedObserver.get()); // 100
   * console.log(normalizedObserver === existingObserver); // true
   * ```
   */
  static readOnlyValueObserver<T>(
    value: T | ReadOnlyValueObserver<T>,
  ): ReadOnlyValueObserver<T> {
    if (this.isReadOnlyValueObserver(value)) {
      return value;
    }
    return {
      get: () => value,
    };
  }

  /**
   * Creates a ReadOnlyValueObserver that tracks the aborted state of an AbortSignal.
   *
   * The observer initially returns `false` and switches to `true` when the AbortSignal
   * is aborted. This is useful for creating cancellation-aware operations that can
   * respond to abort signals in a reactive way.
   *
   * @param signal - The AbortSignal to observe
   * @returns A ReadOnlyValueObserver that reflects the signal's aborted state
   *
   * @example
   * ```typescript
   * const controller = new AbortController();
   * const abortObserver = ValueObserver.readOnlyValueObserverFromAbortSignal(controller.signal);
   *
   * console.log(abortObserver.get()); // false
   *
   * controller.abort();
   * console.log(abortObserver.get()); // true
   * ```
   *
   * @example
   * Using with queue consumption:
   * ```typescript
   * const controller = new AbortController();
   *
   * // Start consuming with abort signal
   * const consumePromise = (async () => {
   *   for await (const message of queue.consume(controller.signal)) {
   *     console.log("Processing:", message);
   *   }
   * })();
   *
   * // Later, abort the operation
   * setTimeout(() => controller.abort(), 5000);
   * ```
   */
  static readOnlyValueObserverFromAbortSignal(
    signal: AbortSignal,
  ): ReadOnlyValueObserver<boolean> {
    const valueObserver = new ValueObserver(false);
    const abortSignalCallback = () => {
      valueObserver.set(true);
      signal.removeEventListener("abort", abortSignalCallback);
    };
    signal.addEventListener("abort", abortSignalCallback);
    return valueObserver;
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
export class Message {
  /** Unique identifier for the message */
  id: string = crypto.randomUUID();
  /** Timestamp when the message was created */
  createdAt: number = Date.now();
  /** Timestamp when the message was last acknowledged, null if never acknowledged */
  acknowledgedAt: null | number = null;

  /**
   * Creates a new message with the provided data.
   * @param data - The payload data for this message
   */
  constructor(public data: any) {}

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
  /** Array containing all messages in the store */
  messages: Message[] = [];
  queueSize = new ValueObserver(0);

  /**
   * Adds a message to the in-memory array.
   * @param message - The message to add
   */
  async addMessage(message: Message) {
    this.messages.push(message);
    this.queueSize.set(this.messages.length);
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
  ): Promise<Message | null> {
    const message =
      this.messages.find((message) => {
        const acknowledgedAt = message.acknowledgedAt;
        return (
          acknowledgedAt === null || acknowledgedAt < now - acknowledgeTimeoutMs
        );
      }) ?? null;
    message?.acknowledge();
    return message;
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
  /** Time in milliseconds to wait between polling attempts when no messages are available. Default: 50ms */
  pollingIntervalMs?: number;
  /** Time in milliseconds before a message is considered unacknowledged and can be reclaimed. Default: 100ms */
  messageTimeoutMs?: number;
  /** Interval in milliseconds for sending keep-alive acknowledgments while processing a message. Default: 100ms */
  ackIntervalMs?: number;
  /** Custom store implementation for message persistence. Default: new MemoryStore() */
  store?: Store;
};

/**
 * Represents a persistent, asynchronous message queue with support for message acknowledgment,
 * polling, and blocking behavior when empty.
 *
 * The `Queue` class provides a robust message queue implementation with features like:
 * - Asynchronous message consumption using async iterators
 * - Automatic message acknowledgment to prevent message loss
 * - Configurable polling and timeout behavior
 * - Pluggable storage backends via the Store interface
 * - Keep-alive mechanism to prevent message timeout during processing
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
 * // Consume messages
 * for await (const message of queue) {
 *   console.log("Processing:", message);
 *   // Process the message...
 *   // Message is automatically acknowledged and deleted
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
 * - Messages are automatically deleted after successful processing
 * - Use the waitForMessages parameter in consume() to control exit behavior when queue is empty
 */
export class Queue {
  /** Time to wait between polling attempts */
  #pollingIntervalMs: number;
  /** Timeout for considering messages as unacknowledged (ms) */
  #messageTimeoutMs: number;
  /** Interval for acknowledgment process */
  #ackIntervalMs: number;
  /** Store for persisting messages */
  #store: Store;

  /**
   * Creates a new Queue instance with optional configuration.
   *
   * @param options - Configuration options for the queue behavior and storage
   */
  constructor(options?: QueueOptions) {
    this.#pollingIntervalMs = options?.pollingIntervalMs ?? 50;
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
  async add(data: any) {
    const message = new Message(data);
    await this.#store.addMessage(message);
  }

  /**
   * Creates a keep-alive process for a message to prevent timeout during processing.
   *
   * This process periodically acknowledges the message while it's being processed
   * to prevent it from being considered unacknowledged and reclaimed by another consumer.
   *
   * @param message - The message to keep alive
   * @param activated - Observer to track when the process should stop
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
   * Consumes messages from the queue as an async generator.
   *
   * This method continuously polls the store for unacknowledged messages,
   * processes them with keep-alive acknowledgments, yields the message data,
   * and then deletes the message upon completion.
   *
   * The consumer will:
   * 1. Claim an unacknowledged message from the store
   * 2. Start a keep-alive process to prevent timeout
   * 3. Yield the message data for processing
   * 4. Delete the message from the store
   * 5. Stop the keep-alive process
   * 6. Repeat until no more messages or waitForMessages condition is met
   *
   * @param waitForMessages - Controls whether to continue polling when no messages are available.
   *                         If false (default), exits when queue is empty.
   *                         If true, continues polling indefinitely.
   *                         Can also accept a ReadOnlyValueObserver<boolean> for dynamic control.
   *                         Can also accept an AbortSignal to stop polling when aborted.
   * @yields The data payload of each message in the queue
   *
   * @example
   * Basic usage (exit when empty):
   * ```typescript
   * for await (const messageData of queue.consume()) {
   *   console.log("Processing message:", messageData);
   *   // Your message processing logic here
   * }
   * ```
   *
   * @example
   * Continuous polling:
   * ```typescript
   * for await (const messageData of queue.consume(true)) {
   *   console.log("Processing message:", messageData);
   *   // Will keep polling even when queue is empty
   * }
   * ```
   *
   * @example
   * Dynamic control with observer:
   * ```typescript
   * const shouldWait = new ValueObserver(false);
   * // Start consuming, will exit when empty initially
   * const consumePromise = (async () => {
   *   for await (const messageData of queue.consume(shouldWait)) {
   *     console.log("Processing:", messageData);
   *   }
   * })();
   *
   * // Later, change to continuous polling
   * shouldWait.set(true);
   * ```
   *
   * @example
   * Using AbortSignal for cancellation:
   * ```typescript
   * const controller = new AbortController();
   *
   * // Start consuming with abort signal
   * const consumePromise = (async () => {
   *   try {
   *     for await (const messageData of queue.consume(controller.signal)) {
   *       console.log("Processing:", messageData);
   *       // Long-running processing...
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
  async *consume(
    waitForMessages:
      | AbortSignal
      | boolean
      | ReadOnlyValueObserver<boolean> = false,
  ) {
    const waitForMessagesObserver =
      waitForMessages instanceof AbortSignal
        ? ValueObserver.readOnlyValueObserverFromAbortSignal(waitForMessages)
        : ValueObserver.readOnlyValueObserver(waitForMessages);

    while (true) {
      const message = await this.#store.claimMessage(
        this.#messageTimeoutMs,
        Date.now(),
      );
      if (!message) {
        const exitLoopIfNoMessages = !waitForMessagesObserver.get();
        if (exitLoopIfNoMessages) {
          const size = await this.#store.getSize();
          if (size === 0) break;
        }
        await new Promise((r) => setTimeout(r, this.#pollingIntervalMs));
      }
      if (message) {
        const activated = new ValueObserver(true);
        const keepAliveProcess = this.createKeepAliveProcess(
          message,
          activated,
        );
        try {
          yield message.data;
          await this.#store.deleteMessage(message.id);
        } finally {
          activated.set(false);
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
   * @returns An async iterator that yields message data
   *
   * @example
   * ```typescript
   * // These are equivalent:
   * for await (const message of queue) { ... }
   * for await (const message of queue.consume()) { ... }
   * ```
   */
  get [Symbol.asyncIterator]() {
    return () => this.consume();
  }
}
