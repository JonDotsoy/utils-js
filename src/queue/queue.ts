import { MemoryStore } from "./store/memory-store.js";
import { Message } from "./message/message.js";
import { Store } from "./store/store.js";
import { AbortableValueObserver } from "./value-observer/abortable-value-observer.js";
import { ValueObserver } from "./value-observer/value-observer.js";
export { Store, MemoryStore } from "./store/store.js";
export { Message } from "./message/message.js";

/**
 * Configuration options for creating a Queue instance.
 *
 * These options control the behavior of message processing, timeouts, and storage.
 * All options are optional and have sensible defaults for most use cases.
 *
 * @example
 * ```typescript
 * // Use defaults (suitable for development/testing)
 * const queue = new Queue();
 *
 * // Custom configuration for production
 * const queue = new Queue({
 *   messageTimeoutMs: 30000,    // 30 seconds before reclaim
 *   ackIntervalMs: 5000,        // Keep-alive every 5 seconds
 *   store: new DatabaseStore()  // Persistent storage
 * });
 * ```
 */
type QueueOptions = {
  /**
   * Time in milliseconds before a message is considered unacknowledged and can be reclaimed.
   * This prevents messages from being lost if a worker crashes during processing.
   * @default 100
   */
  messageTimeoutMs?: number;
  /**
   * Interval in milliseconds for sending keep-alive acknowledgments while processing a message.
   * This ensures long-running message processing doesn't timeout and get reclaimed.
   * @default 100
   */
  ackIntervalMs?: number;
  /**
   * Custom store implementation for message persistence.
   * Use MemoryStore for development/testing or implement a custom Store for production persistence.
   * @default new MemoryStore()
   */
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
   * Gracefully shuts down the queue and stops all message consumption operations.
   *
   * This method initiates a graceful shutdown process by setting the internal queue state to inactive.
   * Once called, all active message consumption operations (such as `consume()` and async iterators)
   * will complete their current message processing and then terminate cleanly.
   *
   * **Shutdown Behavior:**
   * - **Immediate Effect**: No new messages will be claimed from the store
   * - **Graceful Termination**: Currently processing messages will complete normally
   * - **Resource Cleanup**: All abort subscriptions and consumers will be notified to stop
   * - **Irreversible**: Once closed, the queue cannot be reopened
   *
   * **What Happens When Queue is Closed:**
   * 1. Internal `#queueIsActive` state is set to `false`
   * 2. All abort subscriptions created by `#createAbortSubscription()` are triggered
   * 3. Active `consume()` generators stop claiming new messages
   * 4. Current message processing completes with proper cleanup
   * 5. Keep-alive processes for active messages continue until acknowledgment
   *
   * **Safe Shutdown Pattern:**
   * The queue implements a safe shutdown mechanism where:
   * - Messages being processed are not interrupted
   * - Acknowledgments and deletions complete normally
   * - Resources are properly disposed of
   * - No messages are lost during shutdown
   *
   * @example
   * Basic shutdown:
   * ```typescript
   * const queue = new Queue();
   *
   * // Start consuming messages
   * const consumeTask = (async () => {
   *   for await (const message of queue) {
   *     await processMessage(message);
   *     queue.ack(message);
   *   }
   *   console.log("Queue consumption ended gracefully");
   * })();
   *
   * // Shutdown after some time
   * setTimeout(() => {
   *   console.log("Shutting down queue...");
   *   queue.close(); // Graceful shutdown
   * }, 30000);
   *
   * await consumeTask; // Wait for graceful completion
   * ```
   *
   * @example
   * Shutdown with multiple consumers:
   * ```typescript
   * const queue = new Queue();
   *
   * // Multiple consumers
   * const consumers = Array.from({ length: 3 }, async (_, i) => {
   *   console.log(`Consumer ${i} starting...`);
   *   for await (const message of queue) {
   *     await processMessage(message, i);
   *     queue.ack(message);
   *   }
   *   console.log(`Consumer ${i} stopped gracefully`);
   * });
   *
   * // Shutdown all consumers
   * setTimeout(() => {
   *   queue.close(); // All consumers will stop gracefully
   * }, 60000);
   *
   * await Promise.all(consumers);
   * console.log("All consumers stopped");
   * ```
   *
   * @example
   * Shutdown with error handling:
   * ```typescript
   * const queue = new Queue();
   * let isShuttingDown = false;
   *
   * const consumer = (async () => {
   *   try {
   *     for await (const message of queue) {
   *       if (isShuttingDown) {
   *         console.log("Shutdown in progress, completing current message...");
   *       }
   *       await processMessage(message);
   *       queue.ack(message);
   *     }
   *   } catch (error) {
   *     console.error("Consumer error:", error);
   *   } finally {
   *     console.log("Consumer cleanup completed");
   *   }
   * })();
   *
   * // Graceful shutdown with notification
   * const shutdown = async () => {
   *   isShuttingDown = true;
   *   console.log("Initiating graceful shutdown...");
   *   queue.close();
   *   await consumer;
   *   console.log("Shutdown complete");
   * };
   *
   * process.on('SIGTERM', shutdown);
   * process.on('SIGINT', shutdown);
   * ```
   *
   * @remarks
   * - This method is synchronous and returns immediately
   * - The actual shutdown process is asynchronous and happens in the background
   * - Messages being processed when `close()` is called will complete normally
   * - New message consumption attempts will terminate immediately
   * - The queue instance becomes unusable after calling `close()`
   */
  close() {
    this.#queueIsActive.set(false);
    this.#store.close();
  }

  /**
   * Disposes the queue by calling {@link close}.
   *
   * This method implements the Disposable pattern, allowing the queue to be used
   * with the `using` declaration for automatic resource cleanup when the queue
   * goes out of scope.
   *
   * @example
   * ```typescript
   * {
   *   using queue = new Queue();
   *   // Use queue...
   * } // Queue is automatically closed here
   * ```
   */
  [Symbol.dispose]() {
    this.close();
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
   * Consumes messages from the queue as an async generator with automatic resource management and robust error handling.
   *
   * This method implements a production-ready message consumption pattern that continuously polls the store
   * for unacknowledged messages, establishes keep-alive mechanisms to prevent timeout during processing,
   * and ensures proper cleanup regardless of how processing completes. It provides at-least-once delivery
   * semantics with automatic message recovery and graceful shutdown capabilities.
   *
   * **Message Processing Flow:**
   * 1. **Initialize**: Creates an AbortableValueObserver to coordinate shutdown signals
   * 2. **Poll**: Continuously checks the store for available unacknowledged messages
   * 3. **Claim**: Atomically claims an unacknowledged message from the store
   * 4. **Setup**: Establishes keep-alive process and acknowledgment tracking
   * 5. **Yield**: Provides the message data payload to the consumer for processing
   * 6. **Monitor**: Tracks acknowledgment state during consumer processing
   * 7. **Cleanup**: Deletes acknowledged messages; retains unacknowledged for reprocessing
   * 8. **Repeat**: Continues the cycle until queue closure or abort signal
   *
   * **Key Features:**
   * - **At-least-once delivery**: Messages are only deleted after explicit acknowledgment
   * - **Automatic retry**: Unacknowledged messages are reclaimed after timeout for retry
   * - **Keep-alive mechanism**: Prevents message timeout during long-running processing
   * - **Resource cleanup**: Uses disposable resources (`using` declarations) for automatic cleanup
   * - **Graceful shutdown**: Respects queue closure and abort signals with proper cleanup
   * - **Concurrent safety**: Handles multiple consumers safely through atomic message claiming
   * - **Memory management**: Automatically disposes resources and cleans up event listeners
   *
   * **Message Acknowledgment Behavior:**
   * - **Acknowledged messages**: Automatically deleted from the store after processing
   * - **Unacknowledged messages**: Remain in the store and become available for reclaim after timeout
   * - **Failed processing**: Messages not acknowledged due to errors will be retried
   * - **Keep-alive updates**: Periodic acknowledgments prevent timeout during long-running operations
   *
   * **Shutdown and Cancellation:**
   * - **Queue closure**: When `queue.close()` is called, all active consumers stop gracefully
   * - **AbortSignal**: External abort signals immediately terminate message consumption
   * - **Resource disposal**: All resources are properly cleaned up regardless of termination reason
   * - **Current messages**: Messages being processed during shutdown complete normally
   *
   * **Performance Characteristics:**
   * - **Polling interval**: Configurable through store implementation (MemoryStore uses 50ms)
   * - **Keep-alive frequency**: Controlled by `ackIntervalMs` queue option (default: 100ms)
   * - **Memory efficiency**: Uses WeakMap for message tracking to prevent memory leaks
   * - **Concurrent consumers**: Multiple consumers can safely process messages concurrently
   *
   * @param signal - Optional AbortSignal to cancel message consumption. When aborted,
   *                the generator will immediately stop yielding new messages and perform
   *                complete resource cleanup. Existing messages being processed will
   *                complete normally before termination.
   * @yields The data payload of each claimed message from the queue. Each yielded value
   *         represents a message that needs processing and must be explicitly acknowledged
   *         with `ack()` or `acknowledgeMessage()` for deletion.
   * @throws {Error} When the store encounters an unrecoverable error during message operations
   *
   * @example
   * Basic message processing with comprehensive error handling:
   * ```typescript
   * const queue = new Queue({
   *   messageTimeoutMs: 30000,  // 30 seconds before reclaim
   *   ackIntervalMs: 5000       // Keep-alive every 5 seconds
   * });
   *
   * for await (const messageData of queue.consume()) {
   *   try {
   *     console.log("Processing message:", messageData);
   *
   *     // Simulate long-running processing
   *     await processMessage(messageData);
   *
   *     // Critical: Acknowledge successful processing
   *     queue.ack(messageData);
   *     console.log("Message processed successfully");
   *   } catch (error) {
   *     console.error("Processing failed:", error);
   *     // Don't acknowledge - message will be reclaimed for retry
   *     // Consider implementing retry limits or dead letter queue
   *   }
   * }
   * ```
   *
   * @example
   * Graceful shutdown with signal coordination:
   * ```typescript
   * const controller = new AbortController();
   * let processedCount = 0;
   *
   * // Start consuming messages with graceful shutdown handling
   * const consumeTask = (async () => {
   *   try {
   *     for await (const messageData of queue.consume(controller.signal)) {
   *       console.log(`Processing message ${++processedCount}`);
   *       await processMessage(messageData);
   *       queue.ack(messageData);
   *     }
   *     console.log(`Queue consumption completed gracefully. Processed ${processedCount} messages.`);
   *   } catch (error) {
   *     if (error.name === 'AbortError') {
   *       console.log(`Queue consumption was cancelled after processing ${processedCount} messages`);
   *     } else {
   *       console.error("Unexpected error during consumption:", error);
   *     }
   *   }
   * })();
   *
   * // Set up graceful shutdown on system signals
   * process.on('SIGTERM', () => {
   *   console.log("Received SIGTERM, initiating graceful shutdown...");
   *   controller.abort();
   * });
   *
   * // Trigger shutdown after processing time limit
   * setTimeout(() => {
   *   console.log("Time limit reached, initiating graceful shutdown...");
   *   controller.abort();
   * }, 300000); // 5 minutes
   *
   * await consumeTask;
   * ```
   *
   * @example
   * Advanced message acknowledgment with retry logic and dead letter handling:
   * ```typescript
   * const maxRetries = 3;
   * const retryTracker = new Map();
   *
   * for await (const messageData of queue.consume()) {
   *   const messageId = JSON.stringify(messageData); // Simple message ID
   *   const attempts = (retryTracker.get(messageId) || 0) + 1;
   *
   *   try {
   *     console.log(`Processing message (attempt ${attempts}):`, messageData);
   *     const result = await processMessage(messageData);
   *
   *     if (result.success) {
   *       queue.ack(messageData); // Delete successful messages
   *       retryTracker.delete(messageId);
   *       console.log("Message processed successfully");
   *     } else if (result.retryable && attempts < maxRetries) {
   *       // Don't acknowledge - will retry after timeout
   *       retryTracker.set(messageId, attempts);
   *       console.log(`Message will be retried (attempt ${attempts}/${maxRetries})`);
   *     } else {
   *       // Max retries reached or non-retryable error
   *       console.error("Moving message to dead letter queue:", result.error);
   *       await deadLetterQueue.add({
   *         originalMessage: messageData,
   *         error: result.error,
   *         attempts: attempts,
   *         failedAt: new Date().toISOString()
   *       });
   *       queue.ack(messageData); // Acknowledge to prevent infinite retries
   *       retryTracker.delete(messageId);
   *     }
   *   } catch (error) {
   *     console.error(`Unexpected error (attempt ${attempts}):`, error);
   *     if (attempts >= maxRetries) {
   *       console.error("Max retries exceeded, acknowledging message to prevent infinite loop");
   *       queue.ack(messageData);
   *       retryTracker.delete(messageId);
   *     } else {
   *       retryTracker.set(messageId, attempts);
   *     }
   *   }
   * }
   * ```
   *
   * @example
   * Multiple concurrent consumers with load balancing:
   * ```typescript
   * const queue = new Queue({
   *   messageTimeoutMs: 60000,  // 1 minute timeout
   *   ackIntervalMs: 10000      // Keep-alive every 10 seconds
   * });
   *
   * // Create multiple concurrent consumers
   * const createConsumer = (consumerId: string) => async () => {
   *   console.log(`Consumer ${consumerId} starting...`);
   *   let messagesProcessed = 0;
   *
   *   for await (const messageData of queue.consume()) {
   *     try {
   *       console.log(`Consumer ${consumerId} processing message ${++messagesProcessed}`);
   *       await processMessage(messageData, consumerId);
   *       queue.ack(messageData);
   *     } catch (error) {
   *       console.error(`Consumer ${consumerId} failed to process message:`, error);
   *       // Message will be retried by this or another consumer
   *     }
   *   }
   *
   *   console.log(`Consumer ${consumerId} stopped after processing ${messagesProcessed} messages`);
   * };
   *
   * // Start multiple consumers
   * const consumers = await Promise.allSettled([
   *   createConsumer('worker-1')(),
   *   createConsumer('worker-2')(),
   *   createConsumer('worker-3')()
   * ]);
   *
   * console.log("All consumers completed:", consumers);
   * ```
   *
   * @remarks
   * - This method is the core of the queue's message processing system
   * - The generator pattern allows for clean resource management and cancellation
   * - Keep-alive acknowledgments ensure messages don't timeout during legitimate processing
   * - The method handles all edge cases including queue closure, abort signals, and store errors
   * - Multiple consumers can safely process messages concurrently from the same queue
   * - Proper error handling and acknowledgment patterns are critical for reliable message processing
   */
  async *consume(signal?: AbortSignal) {
    using consumeIsActive = new AbortableValueObserver(true, () => false);
    if (signal) consumeIsActive.addSignal(signal);
    using abortSignalInstance = this.#queueIsActive.createAbortSignal();
    consumeIsActive.addSignal(abortSignalInstance.signal);
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
