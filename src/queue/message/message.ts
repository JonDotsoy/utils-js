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
