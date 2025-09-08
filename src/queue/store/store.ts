import type { Message } from "../message/message.js";

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
   * This operation should be implemented atomically to handle concurrent access safely,
   * ensuring that multiple workers don't claim the same message simultaneously.
   *
   * @param acknowledgeTimeoutMs - Timeout in milliseconds for considering messages unacknowledged
   * @param now - Current timestamp to compare against
   * @param abort - Optional AbortSignal to cancel the claim operation
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

  /**
   * Closes the store and performs any necessary cleanup operations.
   *
   * This method should be called when the store is no longer needed to ensure
   * proper resource cleanup. The specific cleanup operations depend on the
   * store implementation (e.g., closing database connections, clearing timers,
   * releasing file handles, etc.).
   *
   * @returns A promise that resolves when the cleanup is complete
   */
  abstract close(): Promise<void>;
}
