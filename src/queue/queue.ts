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
  createdAt: number = Date.now();
  /** Timestamp when the message was last acknowledged, null if never acknowledged */
  acknowledgedAt: null | number = null;

  /**
   * Creates a new message with the provided data.
   * @param data - The payload data for this message
   */
  constructor(public data: T) {}

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
  /** Time to wait between polling attempts */
  #pollingIntervalMs: number;
  /** Timeout for considering messages as unacknowledged (ms) */
  #messageTimeoutMs: number;
  /** Interval for acknowledgment process */
  #ackIntervalMs: number;
  /** Store for persisting messages */
  #store: Store;

  /** */
  #queueIsActive = new ValueObserver<boolean>(true);

  /** WeakMap tracking acknowledgment state for each message being processed */
  #messageAcknowledgments = new WeakMap<WeakKey, ValueObserver<boolean>>();

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
   * @param signal - Optional AbortSignal for cancellation (not yet implemented)
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
    while (this.#queueIsActive.get()) {
      const message = await this.#store.claimMessage(
        this.#messageTimeoutMs,
        Date.now(),
      );
      if (!message) {
        await new Promise((r) => setTimeout(r, this.#pollingIntervalMs));
      }
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
