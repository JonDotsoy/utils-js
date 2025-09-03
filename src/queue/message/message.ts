/**
 * Type definition for the complete message data structure.
 *
 * This interface represents all the properties that define a message,
 * including its unique identifier, payload data, lifecycle timestamps,
 * and optional TTL (Time-to-Live) for automatic expiration.
 *
 * @template T - The type of the message payload data
 */
type MessageData<T> = {
  /** Unique identifier for the message */
  id: string;
  /** The payload data contained in the message */
  data: T;
  /** Timestamp when the message was created (in milliseconds) */
  createdAt: number;
  /** Timestamp when the message was acknowledged, or null if never acknowledged */
  acknowledgedAt?: null | number;
  /** Time-to-live (TTL) timestamp in milliseconds since Unix epoch - when null/undefined, message never expires */
  ttl?: null | number;
};

/**
 * Represents a message in the queue system with lifecycle management and TTL (Time-to-Live) capabilities.
 *
 * Each message contains:
 * - A unique identifier (auto-generated UUID by default)
 * - Arbitrary payload data
 * - Creation timestamp
 * - Acknowledgment timestamp (for tracking processing state)
 * - Optional TTL (Time-to-Live) for automatic expiration
 *
 * Messages support acknowledgment to track when they've been processed,
 * which is essential for implementing reliable message processing patterns
 * and preventing duplicate processing in distributed systems.
 *
 * **TTL Support**: Messages can optionally specify a TTL (Time-to-Live) value
 * that determines when the message should expire. Store implementations may
 * automatically clean up expired messages or reject already-expired messages
 * when they are added to the queue.
 *
 * @template T - The type of the payload data (must extend object)
 *
 * @example
 * ```typescript
 * // Basic message creation
 * const message = new Message({ task: "process-data", priority: 1 });
 * console.log(message.id); // Auto-generated UUID
 *
 * // Message with TTL (expires in 5 minutes)
 * const ttlMessage = new Message(
 *   { content: "Temporary notification" },
 *   {
 *     ttl: Date.now() + (5 * 60 * 1000) // 5 minutes from now
 *   }
 * );
 *
 * // Message with custom metadata
 * const customMessage = new Message(
 *   { content: "Hello World" },
 *   {
 *     id: "custom-id-123",
 *     createdAt: Date.now() - 1000 // 1 second ago
 *   }
 * );
 *
 * // Acknowledge a message after processing
 * await processMessage(message.data);
 * message.acknowledge();
 * console.log(message.acknowledgedAt); // Current timestamp
 *
 * // Check if message has been acknowledged
 * if (message.acknowledgedAt !== null) {
 *   console.log('Message was processed');
 * }
 * ```
 */
export class Message<T extends object = any> {
  /**
   * Unique identifier for the message.
   *
   * Automatically generated using crypto.randomUUID() if not provided in constructor.
   * This ensures each message has a globally unique identifier for tracking purposes.
   */
  id: string = crypto.randomUUID();

  /**
   * Timestamp when the message was created, in milliseconds since Unix epoch.
   *
   * Automatically set to Date.now() when the message is instantiated,
   * unless explicitly provided in the constructor options.
   */
  createdAt: number;

  /**
   * Timestamp when the message was last acknowledged, in milliseconds since Unix epoch.
   *
   * - `null` indicates the message has never been acknowledged
   * - A number indicates when the message was last acknowledged/processed
   *
   * This field is used by queue implementations to track message processing
   * state and implement acknowledgment timeouts for reliable delivery.
   */
  acknowledgedAt: null | number = null;

  /**
   * The payload data for this message.
   *
   * Can be any object type and contains the actual information or task
   * that this message represents in the queue system.
   */
  data: T;

  /**
   * Time-to-live (TTL) for the message, in milliseconds since Unix epoch.
   *
   * When set, this field defines an absolute timestamp when the message expires.
   * Messages with TTL values in the past are considered expired and may be:
   * - Automatically rejected when added to stores (like MemoryStore)
   * - Periodically cleaned up by store implementations
   * - Filtered out during message retrieval operations
   *
   * @remarks
   * - Use `Date.now() + durationMs` to set TTL relative to current time
   * - Store implementations may handle TTL differently
   * - A `null` or `undefined` value means the message never expires
   *
   * @example
   * ```typescript
   * // Message that expires in 1 hour
   * const message = new Message(
   *   { task: "cleanup" },
   *   { ttl: Date.now() + (60 * 60 * 1000) }
   * );
   *
   * // Check if message is expired
   * const isExpired = message.ttl && message.ttl < Date.now();
   * ```
   */
  ttl?: null | number;

  /**
   * Creates a new message instance with the provided data and optional metadata.
   *
   * The constructor allows for flexible message creation:
   * - Basic usage: just provide the payload data
   * - Advanced usage: override default id, createdAt, acknowledgedAt, or ttl values
   *
   * @param data - The payload data for this message (must be an object)
   * @param message - Optional metadata to override default values
   * @param message.id - Custom message ID (defaults to auto-generated UUID)
   * @param message.createdAt - Custom creation timestamp (defaults to Date.now())
   * @param message.acknowledgedAt - Custom acknowledgment timestamp (defaults to null)
   * @param message.ttl - Time-to-live timestamp in milliseconds since Unix epoch (defaults to null)
   *
   * @example
   * ```typescript
   * // Simple message with auto-generated metadata
   * const msg1 = new Message({ action: 'send-email', to: 'user@example.com' });
   *
   * // Message with TTL (expires in 30 minutes)
   * const msg2 = new Message(
   *   { task: 'temporary-job' },
   *   {
   *     ttl: Date.now() + (30 * 60 * 1000)
   *   }
   * );
   *
   * // Message with custom ID and creation time
   * const msg3 = new Message(
   *   { task: 'process-order' },
   *   {
   *     id: 'order-123',
   *     createdAt: Date.now() - 5000 // 5 seconds ago
   *   }
   * );
   *
   * // Message already acknowledged (e.g., when reconstructing from storage)
   * const msg4 = new Message(
   *   { result: 'completed' },
   *   {
   *     id: 'task-456',
   *     createdAt: 1630000000000,
   *     acknowledgedAt: 1630000005000,
   *     ttl: 1630000300000 // Expires at specific time
   *   }
   * );
   * ```
   */
  constructor(data: T, message?: Partial<Omit<MessageData<T>, "data">>) {
    this.id = message?.id ?? this.id;
    this.data = data;
    this.createdAt = message?.createdAt ?? Date.now();
    this.acknowledgedAt = message?.acknowledgedAt ?? null;
    this.ttl = message?.ttl;
  }

  /**
   * Marks the message as acknowledged with the current timestamp.
   *
   * This method sets the `acknowledgedAt` property to the current time,
   * indicating that the message has been processed or claimed by a consumer.
   *
   * In queue systems, acknowledgment is used to:
   * - Track message processing state
   * - Implement reliable delivery patterns
   * - Prevent duplicate processing
   * - Enable acknowledgment timeouts for failed processors
   *
   * @example
   * ```typescript
   * const message = new Message({ task: 'send-notification' });
   *
   * // Process the message
   * await sendNotification(message.data);
   *
   * // Acknowledge successful processing
   * message.acknowledge();
   *
   * console.log(`Message acknowledged at: ${message.acknowledgedAt}`);
   * // Output: Message acknowledged at: 1693737600000
   * ```
   */
  acknowledge() {
    this.acknowledgedAt = Date.now();
  }

  /**
   * Creates a Message instance from a MessageData object.
   *
   * This static factory method is useful for reconstructing Message instances
   * from serialized data, such as when loading messages from persistent storage
   * or receiving them over a network.
   *
   * Unlike the constructor, this method takes a complete MessageData object
   * and creates a Message instance with all properties already set, including
   * TTL information if present.
   *
   * @template T - The type of the message payload data
   * @param message - Complete message data object with all required properties
   * @returns A new Message instance with the provided data
   *
   * @example
   * ```typescript
   * // Reconstruct message from storage
   * const storedData: MessageData<{task: string}> = {
   *   id: 'msg-123',
   *   data: { task: 'process-order' },
   *   createdAt: 1693737600000,
   *   acknowledgedAt: null,
   *   ttl: 1693737900000 // Expires 5 minutes after creation
   * };
   *
   * const message = Message.from(storedData);
   * console.log(message.id); // 'msg-123'
   * console.log(message.data.task); // 'process-order'
   * console.log(message.ttl); // 1693737900000
   *
   * // Check if reconstructed message is expired
   * const isExpired = message.ttl && message.ttl < Date.now();
   *
   * // Useful when loading from IndexedDB or other storage
   * const messages = await loadMessagesFromDB();
   * const messageInstances = messages
   *   .map(data => Message.from(data))
   *   .filter(msg => !msg.ttl || msg.ttl > Date.now()); // Filter expired
   * ```
   */
  static from<T extends object = any>(message: MessageData<T>) {
    return new Message(message.data, {
      id: message.id,
      createdAt: message.createdAt,
      acknowledgedAt: message.acknowledgedAt,
      ttl: message.ttl,
    });
  }
}
