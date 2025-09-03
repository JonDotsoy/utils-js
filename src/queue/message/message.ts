/**
 * Type definition for the complete message data structure.
 *
 * This interface represents all the properties that define a message,
 * including its unique identifier, payload data, and lifecycle timestamps.
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
  acknowledgedAt: null | number;
};

/**
 * Represents a message in the queue system with lifecycle management capabilities.
 *
 * Each message contains:
 * - A unique identifier (auto-generated UUID by default)
 * - Arbitrary payload data
 * - Creation timestamp
 * - Acknowledgment timestamp (for tracking processing state)
 *
 * Messages support acknowledgment to track when they've been processed,
 * which is essential for implementing reliable message processing patterns
 * and preventing duplicate processing in distributed systems.
 *
 * @template T - The type of the payload data (must extend object)
 *
 * @example
 * ```typescript
 * // Basic message creation
 * const message = new Message({ task: "process-data", priority: 1 });
 * console.log(message.id); // Auto-generated UUID
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
   * Creates a new message instance with the provided data and optional metadata.
   *
   * The constructor allows for flexible message creation:
   * - Basic usage: just provide the payload data
   * - Advanced usage: override default id, createdAt, or acknowledgedAt values
   *
   * @param data - The payload data for this message (must be an object)
   * @param message - Optional metadata to override default values
   * @param message.id - Custom message ID (defaults to auto-generated UUID)
   * @param message.createdAt - Custom creation timestamp (defaults to Date.now())
   * @param message.acknowledgedAt - Custom acknowledgment timestamp (defaults to null)
   *
   * @example
   * ```typescript
   * // Simple message with auto-generated metadata
   * const msg1 = new Message({ action: 'send-email', to: 'user@example.com' });
   *
   * // Message with custom ID and creation time
   * const msg2 = new Message(
   *   { task: 'process-order' },
   *   {
   *     id: 'order-123',
   *     createdAt: Date.now() - 5000 // 5 seconds ago
   *   }
   * );
   *
   * // Message already acknowledged (e.g., when reconstructing from storage)
   * const msg3 = new Message(
   *   { result: 'completed' },
   *   {
   *     id: 'task-456',
   *     createdAt: 1630000000000,
   *     acknowledgedAt: 1630000005000
   *   }
   * );
   * ```
   */
  constructor(data: T, message?: Partial<Omit<MessageData<T>, "data">>) {
    this.id = message?.id ?? this.id;
    this.data = data;
    this.createdAt = message?.createdAt ?? Date.now();
    this.acknowledgedAt = message?.acknowledgedAt ?? null;
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
   * and creates a Message instance with all properties already set.
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
   *   acknowledgedAt: null
   * };
   *
   * const message = Message.from(storedData);
   * console.log(message.id); // 'msg-123'
   * console.log(message.data.task); // 'process-order'
   *
   * // Useful when loading from IndexedDB or other storage
   * const messages = await loadMessagesFromDB();
   * const messageInstances = messages.map(data => Message.from(data));
   * ```
   */
  static from<T extends object = any>(message: MessageData<T>) {
    return new Message(message.data, {
      id: message.id,
      createdAt: message.createdAt,
      acknowledgedAt: message.acknowledgedAt,
    });
  }
}
