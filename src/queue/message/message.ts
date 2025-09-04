/**
 * Type definition for the complete message data structure.
 *
 * This interface represents all the properties that define a message,
 * including its unique identifier, payload data, lifecycle timestamps,
 * and optional TTL (Time-to-Live) for automatic expiration.
 *
 * @template T - The type of the message payload data (must extend object)
 *
 * @public
 */
type MessageData<T extends object = any> = {
  /**
   * Unique identifier for the message.
   *
   * @remarks Auto-generated UUID when not explicitly provided
   */
  id: string;

  /**
   * The payload data contained in the message.
   *
   * @remarks Must be an object type containing the actual message content
   */
  data: T;

  /**
   * Timestamp when the message was created (in milliseconds since Unix epoch).
   *
   * @remarks Automatically set to Date.now() during message creation
   */
  createdAt: number;

  /**
   * Timestamp when the message was acknowledged (in milliseconds since Unix epoch).
   *
   * @remarks
   * - `null` indicates the message has never been acknowledged
   * - A number indicates when the message was last processed
   * - Optional field that may be undefined in some contexts
   */
  acknowledgedAt?: null | number;

  /**
   * Time-to-live duration in seconds (relative to createdAt).
   *
   * @remarks
   * - Specifies how long the message should remain valid after creation
   * - `null` means the message never expires
   * - Used to calculate absolute expiration time: `createdAt + (ttl * 1000)`
   * - Store implementations may automatically clean up expired messages
   */
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
 * in seconds that determines how long the message remains valid after creation.
 * Store implementations may automatically clean up expired messages or reject
 * already-expired messages when they are added to the queue.
 *
 * @template T - The type of the payload data (must extend object)
 *
 * @public
 */
export class Message<T extends object = any> {
  /**
   * Unique identifier for the message.
   *
   * Automatically generated using crypto.randomUUID() if not provided in constructor.
   * This ensures each message has a globally unique identifier for tracking purposes.
   *
   * @readonly
   */
  id: string = crypto.randomUUID();

  /**
   * Timestamp when the message was created, in milliseconds since Unix epoch.
   *
   * Automatically set to Date.now() when the message is instantiated,
   * unless explicitly provided in the constructor options.
   *
   * @readonly
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
   *
   * @readonly
   */
  data: T;

  /**
   * Time-to-live (TTL) for the message, specified as a duration in seconds.
   *
   * When set, this field defines how long the message remains valid after creation.
   * The actual expiration time is calculated as: `createdAt + (ttl * 1000)`.
   * Messages that have exceeded their TTL are considered expired and may be:
   * - Automatically rejected when added to stores (like MemoryStore)
   * - Periodically cleaned up by store implementations
   * - Filtered out during message retrieval operations
   *
   * @remarks
   * - Specify TTL as duration in seconds (e.g., 300 for 5 minutes)
   * - Store implementations may handle TTL differently
   * - A `null` value means the message never expires
   * - Use {@link isExpired} method to check if a message has expired
   */
  ttl: null | number;

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
   * @param message.createdAt - Custom creation timestamp in ms (defaults to Date.now())
   * @param message.acknowledgedAt - Custom acknowledgment timestamp in ms (defaults to null)
   * @param message.ttl - Time-to-live duration in seconds (defaults to null for no expiration)
   *
   * @throws {Error} When data parameter is not an object
   */
  constructor(data: T, message?: Partial<Omit<MessageData<T>, "data">>) {
    this.id = message?.id ?? this.id;
    this.data = data;
    this.createdAt = message?.createdAt ?? Date.now();
    this.acknowledgedAt = message?.acknowledgedAt ?? null;
    this.ttl = message?.ttl ?? null;
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
   */
  acknowledge(): void {
    this.acknowledgedAt = Date.now();
  }

  /**
   * Checks if the message has expired based on its TTL (Time-to-Live) setting.
   *
   * This method calculates whether the message has exceeded its time-to-live
   * by comparing the current time with the computed expiration timestamp.
   * The expiration is calculated as: `createdAt + (ttl * 1000)`.
   *
   * @param now - Current timestamp in milliseconds since Unix epoch (typically Date.now())
   * @returns `true` if the message has expired, `false` if it's still valid or has no TTL
   */
  isExpired(now: number): boolean {
    // format epoch-ms
    const createdAt = this.createdAt;
    // relative seconds
    const ttl = this.ttl;
    if (!ttl) return false;
    const expirationAt = createdAt + ttl * 1000;
    return expirationAt <= now;
  }

  /**
   * Serializes the message instance to a plain JavaScript object.
   *
   * This method converts the Message instance into a MessageData object
   * that can be safely serialized to JSON, stored in databases, or transmitted
   * over networks. It includes all message properties: id, data, timestamps,
   * and TTL information.
   *
   * The returned object is compatible with the {@link MessageData} interface
   * and can be used with the {@link Message.from} static method to reconstruct
   * the message instance later.
   *
   * @returns A plain object containing all message data suitable for serialization
   */
  toJSON(): MessageData<object> {
    return {
      id: this.id,
      data: this.data,
      createdAt: this.createdAt,
      acknowledgedAt: this.acknowledgedAt,
      ttl: this.ttl,
    };
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
   * @throws {Error} When the message parameter is invalid or missing required fields
   *
   * @static
   */
  static from<T extends object = any>(message: MessageData<T>): Message<T> {
    return new Message(message.data, {
      id: message.id,
      createdAt: message.createdAt,
      acknowledgedAt: message.acknowledgedAt,
      ttl: message.ttl,
    });
  }
}
