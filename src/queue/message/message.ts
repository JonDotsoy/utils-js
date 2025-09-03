type MessageData<T> = {
  id: string;
  data: T;
  createdAt: number;
  acknowledgedAt: null | number;
};

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
  /** The payload data for this message */
  data: T;

  /**
   * Creates a new message with the provided data.
   * @param data - The payload data for this message
   */
  constructor(data: T, message?: Partial<Omit<MessageData<T>, "data">>) {
    this.id = message?.id ?? this.id;
    this.data = data;
    this.createdAt = message?.createdAt ?? Date.now();
    this.acknowledgedAt = message?.acknowledgedAt ?? null;
  }

  /**
   * Marks the message as acknowledged with the current timestamp.
   * This is used to track when the message was last processed or claimed.
   */
  acknowledge() {
    this.acknowledgedAt = Date.now();
  }

  static from<T extends object = any>(message: MessageData<T>) {
    return new Message(message.data, {
      id: message.id,
      createdAt: message.createdAt,
      acknowledgedAt: message.acknowledgedAt,
    });
  }
}
