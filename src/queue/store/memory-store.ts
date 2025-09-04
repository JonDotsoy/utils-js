import type { Message } from "../message/message";
import { Store } from "./store";
import { AbortableValueObserver } from "../value-observer/abortable-value-observer";
import { ValueObserver } from "../value-observer/value-observer";

const MemoryStorePerformance = {
  cleanupIntervalMilliseconds: 1000,
};

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
  static defaultPerformance = MemoryStorePerformance;

  /** Array containing all messages currently stored in memory */
  messages: Message[] = [];
  /** Observer tracking the current size of the queue */
  queueSize = new ValueObserver(0);
  lastMessageId = new ValueObserver<string | null>(null);
  /** Observer tracking whether the store is active (not closed) */
  #storeIsActive = new ValueObserver<boolean>(true);

  #cleanupInterval = setInterval(() => {
    const now = Date.now();
    this.messages = this.messages.filter((message) => {
      return !message.isExpired(now);
    });
    this.queueSize.set(this.messages.length);
  }, MemoryStore.defaultPerformance.cleanupIntervalMilliseconds);

  /**
   * Adds a message to the in-memory array.
   * @param message - The message to add
   */
  async addMessage(message: Message) {
    const now = Date.now();
    if (message.isExpired(now)) return;
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
   * This implementation includes polling behavior and supports abortion via AbortSignal.
   * It continuously searches for unacknowledged messages until one is found or the operation
   * is aborted. The method is not truly atomic in a concurrent environment, but is sufficient
   * for single-threaded applications.
   *
   * @param acknowledgeTimeoutMs - Timeout for considering messages unacknowledged
   * @param now - Current timestamp
   * @param signal - Optional AbortSignal to cancel the claiming operation
   * @returns The claimed message if found, null if no unacknowledged messages exist or operation was aborted
   */
  async claimMessage(
    acknowledgeTimeoutMs: number,
    now: number,
    signal?: AbortSignal,
  ): Promise<Message | null> {
    const timeStart = Date.now();
    const claimActive = new AbortableValueObserver(true, () => false);

    using abortSignalInstance = this.#storeIsActive.createAbortSignal();
    // Add the store's active state to the abort observer
    claimActive.addSignal(abortSignalInstance.signal);

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

  /**
   * Closes the memory store and clears all stored messages.
   *
   * This method performs cleanup by clearing the messages array and resetting
   * the queue size observer. Since this is an in-memory store, all messages
   * will be permanently lost when this method is called.
   *
   * **Important**: This method also stops any active `claimMessage` operations
   * by setting the store's active state to false, which will cause them to
   * terminate gracefully.
   *
   * @example
   * ```typescript
   * const store = new MemoryStore();
   * // ... use the store
   * await store.close(); // Clear all messages and stop all operations
   * ```
   */
  async close(): Promise<void> {
    // First, mark the store as inactive to stop any ongoing operations
    this.#storeIsActive.set(false);

    // Then clear all data
    this.messages = [];
    this.queueSize.set(0);
    this.lastMessageId.set(null);

    clearInterval(this.#cleanupInterval);
  }
}
