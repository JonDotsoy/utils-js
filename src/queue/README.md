# Queue API

High–level, lightweight asynchronous message queue with periodic acknowledgments, cooperative workers and pluggable storage.

> This module exports: `Queue`, `MemoryStore`, `Store` (abstract base), and `Message`. `IndexedDBStore` is available separately via `@jondotsoy/utils-js/queue/store/indexeddb-store`. `WorkerStore` is available separately via `@jondotsoy/utils-js/queue/store/worker-store`.

## Features

- Async iterator consumption (`for await ... of queue`)
- **Graceful shutdown** with `close()` method and Disposable pattern support
- Periodic acknowledgement keep‑alive while a message is being processed
- Automatic deletion after successful processing (in `finally` block safety)
- Reclaim (re-deliver) messages whose acknowledgement timeout elapsed
- Pluggable storage through the `Store` abstraction (in‑memory and IndexedDB implementations included)
- **Persistent storage** with IndexedDB for browser environments
- Zero external dependencies

## Installation

Installed as part of your workspace package (example with bun / npm):

```bash
bun add @jondotsoy/utils-js
# or
npm install @jondotsoy/utils-js
```

## TTL (Time-to-Live) Usage

Messages can optionally include a TTL (Time-to-Live) timestamp to automatically expire after a certain time. This is useful for implementing message expiration, cleanup tasks, and preventing stale message processing.

### Basic TTL Usage

```ts
import { Queue, MemoryStore, Message } from "@jondotsoy/utils-js/queue";

const queue = new Queue({ store: new MemoryStore() });

// Create a message with TTL directly (expires in 5 minutes)
const message = new Message(
  { task: "send-notification", userId: "123" },
  { ttl: Temporal.Duration.from({ minutes: 5 }).total("seconds") },
);
await queue.add(message);

// Or create a message with TTL for urgent tasks (expires in 2 minutes)
const urgentMessage = new Message(
  { task: "urgent-cleanup", priority: "high" },
  { ttl: Temporal.Duration.from({ minutes: 2 }).total("seconds") },
);
```

### TTL Behavior by Store

**MemoryStore:**

- Automatically cleans up expired messages every 1 second (configurable)
- Rejects messages that are already expired when added
- Cleanup interval can be tuned: `MemoryStore.defaultPerformance.cleanupIntervalMilliseconds = 500`

**IndexedDBStore:**

- Full TTL support with automatic cleanup every minute
- Expired messages are filtered out during all database operations
- Manual cleanup available with `cleanupExpiredMessages()` method
- Rejects messages that are already expired when added

### TTL Best Practices

```ts
// For time-sensitive notifications (expire in 1 hour)
const notification = new Message(
  { type: "user-notification", content: "Your session expires soon" },
  { ttl: Temporal.Duration.from({ hours: 1 }).total("seconds") },
);

// For cleanup tasks (expire in 24 hours)
const cleanupTask = new Message(
  { type: "cleanup", resource: "/tmp/uploads" },
  { ttl: Temporal.Duration.from({ hours: 24 }).total("seconds") },
);

// For testing with quick expiration (expires in 0.5 seconds)
MemoryStore.defaultPerformance.cleanupIntervalMilliseconds = 100;
const testMessage = new Message(
  { test: true },
  { ttl: Temporal.Duration.from({ milliseconds: 500 }).total("seconds") },
);
```

## Quick Start

```ts
import { Queue, MemoryStore } from "@jondotsoy/utils-js/queue"; // adjust path per bundler setup

const queue = new Queue({ store: new MemoryStore() });

await queue.add({ task: "send-email", to: "user@example.com" });

for await (const job of queue) {
  // Process the job
  console.log("Processing", job);

  // Acknowledge successful processing
  queue.ack(job);
}
```

### With Persistent Storage (IndexedDB)

```ts
import { Queue } from "@jondotsoy/utils-js/queue";
import { IndexedDBStore } from "@jondotsoy/utils-js/queue/store/indexeddb-store";

// Messages persist across browser sessions
const queue = new Queue({
  store: new IndexedDBStore("my-app-queue"),
});

await queue.add({ task: "process-order", orderId: "123" });

for await (const job of queue) {
  console.log("Processing", job);
  // Messages are automatically persisted
  queue.ack(job);
}
```

### With Worker-based Storage

```ts
import { Queue } from "@jondotsoy/utils-js/queue";
import { WorkerStore } from "@jondotsoy/utils-js/queue/store/worker-store";

// Create a worker that handles the storage backend
const worker = new Worker("/path/to/worker-store-backend.js");
const queue = new Queue({
  store: new WorkerStore(worker),
});

await queue.add({ task: "cpu-intensive-work", data: largeDataset });

for await (const job of queue) {
  console.log("Processing", job);
  // Storage operations happen in the worker thread
  queue.ack(job);
}
```

## Concepts

| Concept                | Description                                                                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Message                | Wrapper carrying `data`, `id`, timestamps `createdAt`, `acknowledgedAt`, and optional `ttl` (Time-to-Live).                                                       |
| Acknowledge keep‑alive | Timer re‑acknowledging the message every `ackIntervalMs` until processing finishes.                                                                               |
| Manual acknowledgment  | Messages must be explicitly acknowledged with `ack()` or `acknowledgeMessage()` to be deleted from the queue.                                                     |
| Reclaim                | If a message's last `acknowledgedAt` is older than `now - messageTimeoutMs`, it is eligible to be claimed by another worker.                                      |
| TTL (Time-to-Live)     | Optional expiration duration in seconds. Messages automatically expire after `createdAt + (ttl * 1000)` milliseconds and are cleaned up by store implementations. |
| Graceful shutdown      | Queue can be closed with `close()` to stop all message consumption gracefully without interrupting current processing.                                            |
| Store                  | Abstraction for persistence; must implement methods to add / get / acknowledge / delete / claim / count / close.                                                  |
| MemoryStore            | Simple array based store (dev / tests). Not durable. Includes automatic TTL cleanup every 1 second (configurable).                                                |
| IndexedDBStore         | Browser-based persistent store using IndexedDB. Messages survive page reloads and browser restarts. Includes automatic TTL cleanup every minute.                  |
| WorkerStore            | Web Worker-based store that offloads storage operations to a worker thread. Provides better performance for heavy workloads by avoiding main thread blocking.     |

## Message Lifecycle

1. `add(data)` creates a `Message` with `acknowledgedAt = null`.
2. Worker claims an unacknowledged / expired message (sets `acknowledgedAt = now`).
3. Keep‑alive acknowledges again every `ackIntervalMs` while processing.
4. Worker yields `message.data` to caller code.
5. **Manual step**: Caller must call `ack(data)` or `acknowledgeMessage(data)` to mark message as processed.
6. Message is deleted from the queue **only if** it was explicitly acknowledged.
7. If worker crashes / stalls or doesn't acknowledge, another worker can reclaim after `messageTimeoutMs`.

## API Reference

### Queue

```ts
class Queue {
  constructor(options?: QueueOptions);
  add(data: any): Promise<void>;
  ack(messageRef: any): void;
  acknowledgeMessage(messageRef: any): void;
  consume(signal?: AbortSignal): AsyncGenerator<any>;
  close(): void;
  [Symbol.asyncIterator](): AsyncGenerator<any>;
  [Symbol.dispose](): void;
}
```

#### Options (`QueueOptions`)

| Option             | Type    | Default             | Description                                                             |
| ------------------ | ------- | ------------------- | ----------------------------------------------------------------------- |
| `messageTimeoutMs` | number  | 100                 | Time without acknowledgement after which a message becomes reclaimable. |
| `ackIntervalMs`    | number  | 100                 | Periodic acknowledgement keep‑alive while processing.                   |
| `store`            | `Store` | `new MemoryStore()` | Storage backend instance.                                               |

#### `add(data: any)`

Enqueues a new message wrapping the provided payload.

#### `ack(messageRef: any)`

Marks a message as successfully processed, allowing it to be deleted from the queue. This is an alias for `acknowledgeMessage()`.

#### `acknowledgeMessage(messageRef: any)`

Marks a message as successfully processed, allowing it to be deleted from the queue. The message reference should be the data yielded by the consume generator.

#### `consume(signal?: AbortSignal)`

Returns an async generator that yields message `data` values. **Important**: Messages are only deleted from the queue if they are explicitly acknowledged using `ack()` or `acknowledgeMessage()`.

| Argument form | Behavior                                        |
| ------------- | ----------------------------------------------- |
| Omitted       | Polls continuously until queue is inactive.     |
| `AbortSignal` | Exits when signal is aborted (fully supported). |

> Keep‑alive continues until message processing finishes. Messages are **only deleted** if explicitly acknowledged with `ack()` or `acknowledgeMessage()`.

#### `close()`

Gracefully shuts down the queue and stops all message consumption operations. This method:

- Immediately stops claiming new messages from the store
- Allows currently processing messages to complete normally
- Notifies all active consumers to stop gracefully
- Closes the underlying store
- Is irreversible - the queue cannot be reopened

**Example:**

```ts
const queue = new Queue();

// Start consuming messages
const consumer = (async () => {
  for await (const message of queue) {
    await processMessage(message);
    queue.ack(message);
  }
  console.log("Consumer stopped gracefully");
})();

// Shutdown after some time
setTimeout(() => queue.close(), 30000);
await consumer; // Wait for graceful completion
```

#### `[Symbol.dispose]()`

Implements the Disposable pattern by calling `close()`. This allows the queue to be used with the `using` declaration for automatic resource cleanup:

```ts
{
  using queue = new Queue();
  // Use queue...
} // Queue is automatically closed here
```

##### Consumption Patterns

Basic consumption with manual acknowledgment:

```ts
for await (const data of queue.consume()) {
  try {
    await handle(data);
    queue.ack(data); // Acknowledge successful processing
  } catch (error) {
    // Don't acknowledge - message will be reclaimed
    console.error("Processing failed:", error);
  }
}
```

With AbortSignal:

```ts
const controller = new AbortController();
(async () => {
  for await (const data of queue.consume(controller.signal)) {
    await handle(data);
    queue.ack(data);
  }
})();
setTimeout(() => controller.abort(), 10_000);
```

### Message

```ts
class Message {
  id: string;
  createdAt: number;
  acknowledgedAt: number | null;
  data: any;
  ttl: null | number;
  constructor(data: any, message?: Partial<Omit<MessageData, "data">>);
  acknowledge(): void;
  isExpired(now: number): boolean;
  toJSON(): MessageData<object>;
  static from<T>(message: MessageData<T>): Message<T>;
}
```

The `Message` class now supports flexible construction, serialization, and TTL (Time-to-Live) functionality:

- **Enhanced constructor**: Optionally specify custom `id`, `createdAt`, `acknowledgedAt`, or `ttl` values
- **TTL Support**: Messages can include an optional expiration duration in seconds for automatic cleanup
- **Expiration checking**: Use `isExpired()` method to check if a message has expired
- **JSON serialization**: Perfect conversion to/from plain objects with `toJSON()` and `from()`
- **Static factory method**: `Message.from()` reconstructs Message instances from serialized data
- **Perfect for persistence**: Seamlessly works with IndexedDB and other storage backends

**Examples:**

```ts
// Basic message with auto-generated ID and timestamp
const msg1 = new Message({ task: "send-email" });

// Message with TTL (expires in 1 hour)
const msg2 = new Message(
  { task: "temporary-cleanup" },
  { ttl: Temporal.Duration.from({ hours: 1 }).total("seconds") },
);

// Message with custom metadata (useful for reconstruction from storage)
const msg3 = new Message(
  { task: "process-order" },
  {
    id: "custom-id",
    createdAt: Date.now() - 1000,
    ttl: Temporal.Duration.from({ minutes: 30 }).total("seconds"),
  },
);

// Reconstruct from stored data (e.g., from IndexedDB)
const storedData = {
  id: "msg-123",
  data: { task: "cleanup" },
  createdAt: 1693737600000,
  acknowledgedAt: null,
  ttl: Temporal.Duration.from({ hours: 1 }).total("seconds"),
};
const message = Message.from(storedData);
```

### Store (abstract)

```ts
abstract class Store {
  abstract addMessage(message: Message): Promise<void>;
  abstract getMessage(id: string): Promise<Message | null>;
  abstract acknowledgeMessage(id: string): Promise<void>;
  abstract deleteMessage(id: string): Promise<void>;
  abstract claimMessage(
    timeoutMs: number,
    now: number,
    abort?: AbortSignal,
  ): Promise<Message | null>;
  abstract getSize(): Promise<number>;
  abstract close(): Promise<void>;
}
```

`claimMessage` should be atomic in multi‑producer / multi‑consumer implementations (the provided `MemoryStore` is not safe for concurrent multi‑process usage).

The `close()` method should clean up resources and stop any ongoing operations. For example, the `MemoryStore` implementation clears all messages and stops active claim operations.

### MemoryStore

Reference implementation for tests & development. **Not durable.** Adds a reactive internal observer (not exported) to track queue size and includes automatic TTL cleanup for expired messages.

**TTL Features:**

- **Automatic cleanup**: Expired messages are automatically removed every 1 second (configurable via `MemoryStore.defaultPerformance.cleanupIntervalMilliseconds`)
- **Expiration calculation**: Messages expire when `createdAt + (ttl * 1000) <= now` (TTL specified in seconds, converted to milliseconds)
- **Rejection of expired messages**: Messages that are already expired when added to the store are silently rejected
- **Performance tuning**: Cleanup interval can be adjusted for testing or different performance requirements

**Example:**

```ts
// Configure cleanup interval for testing
MemoryStore.defaultPerformance.cleanupIntervalMilliseconds = 500; // Check every 500ms

const store = new MemoryStore();
const message = new Message(
  { task: "expires-soon" },
  { ttl: 2 }, // Expires in 2 seconds
);
```

### IndexedDBStore

**Browser-only** persistent storage implementation using IndexedDB. Messages are stored durably and survive page reloads, browser restarts, and crashes.

```ts
import { IndexedDBStore } from "@jondotsoy/utils-js/queue/store/indexeddb-store";

// Basic usage
const store = new IndexedDBStore("my-app-queue");

// With custom object store name
const store = new IndexedDBStore("my-app-queue", "tasks");

// For testing (with fake-indexeddb)
const store = new IndexedDBStore("test-db", "messages", fakeIndexedDB);
```

**Features:**

- **Atomic operations**: Prevents race conditions in concurrent environments
- **Automatic schema creation**: Creates database and indexes automatically
- **Efficient querying**: Uses indexes on `createdAt` and `acknowledgedAt` for performance
- **Cross-session persistence**: Messages survive browser restarts and page reloads
- **TTL support**: Full Time-to-Live support with automatic cleanup every minute
- **Expired message handling**: Filters out expired messages during all operations
- **Manual cleanup**: `cleanupExpiredMessages()` method for immediate cleanup
- **Graceful error handling**: Handles browser storage quota limits and database errors

**Browser Support:**

- All modern browsers with IndexedDB support
- Chrome 24+, Firefox 16+, Safari 8+, Edge 12+
- Throws error if IndexedDB is unavailable (can provide custom factory for testing)

**Example with persistence across sessions:**

```ts
import { Queue } from "@jondotsoy/utils-js/queue";
import { IndexedDBStore } from "@jondotsoy/utils-js/queue/store/indexeddb-store";

const queue = new Queue({
  store: new IndexedDBStore("task-queue"),
  messageTimeoutMs: 30000,
  ackIntervalMs: 5000,
});

// Add some tasks
await queue.add({ type: "email", recipient: "user@example.com" });
await queue.add({ type: "report", userId: 123 });

// Add task with TTL (expires in 1 hour)
await queue.add(
  { type: "notification", message: "Session expires soon" },
  { ttl: Temporal.Duration.from({ hours: 1 }).total("seconds") },
);

// Manual cleanup of expired messages (returns count removed)
const removedCount = await queue.store.cleanupExpiredMessages();
console.log(`Removed ${removedCount} expired messages`);

// Process tasks (survives page reload)
for await (const task of queue) {
  try {
    await processTask(task);
    queue.ack(task); // Remove from persistent storage
  } catch (error) {
    console.error("Task failed, will retry:", error);
    // Don't acknowledge - task remains in IndexedDB for retry
  }
}
```

### WorkerStore

**Browser and Node.js** Worker-based storage implementation that delegates all storage operations to a Web Worker (browser) or Worker Thread (Node.js). This provides better performance for heavy workloads by preventing storage operations from blocking the main thread.

```ts
import { WorkerStore } from "@jondotsoy/utils-js/queue/store/worker-store";

// Basic usage with Web Worker
const worker = new Worker("/path/to/worker-store-backend.js");
const store = new WorkerStore(worker);

// With Node.js Worker Threads
import { Worker } from "worker_threads";
const worker = new Worker("/path/to/worker-store-backend.js");
const store = new WorkerStore(worker);
```

**Features:**

- **Non-blocking operations**: All storage operations run in a separate thread
- **JSON-RPC communication**: Uses standardized JSON-RPC 2.0 protocol for worker communication
- **Full Store API**: Implements all Store methods (add, get, acknowledge, delete, claim, getSize, close)
- **Abort support**: Supports cancellation of long-running operations via AbortSignal
- **Error handling**: Properly propagates errors from worker thread to main thread
- **Health checking**: Includes ping/pong mechanism to verify worker responsiveness
- **Thread safety**: Worker backend uses MemoryStore with proper synchronization

**Worker Backend Setup:**

The WorkerStore requires a corresponding worker script that imports the backend implementation:

```ts
// worker-store-backend.js
import "@jondotsoy/utils-js/queue/store/worker-store-be";
```

**Example with performance optimization:**

```ts
import { Queue } from "@jondotsoy/utils-js/queue";
import { WorkerStore } from "@jondotsoy/utils-js/queue/store/worker-store";

// Setup worker-based storage
const worker = new Worker("/worker-store-backend.js");
const queue = new Queue({
  store: new WorkerStore(worker),
  messageTimeoutMs: 30000,
  ackIntervalMs: 5000,
});

// Add CPU-intensive tasks
await queue.add({ type: "image-processing", imagePath: "/large-image.jpg" });
await queue.add({ type: "data-analysis", dataset: largeDataArray });

// Process tasks without blocking main thread
for await (const task of queue) {
  console.log("Processing task:", task.type);

  try {
    await processTask(task);
    queue.ack(task); // Remove from worker storage
  } catch (error) {
    console.error("Task failed, will retry:", error);
    // Don't acknowledge - task remains in worker for retry
  }
}

// Health check
try {
  const response = await queue.store.ping();
  console.log("Worker health:", response); // "pong"
} catch (error) {
  console.error("Worker not responding:", error);
}

// Graceful shutdown
await queue.close(); // Stops queue operations
worker.terminate(); // Clean up worker resources
```

**Performance Considerations:**

- **Best for**: CPU-intensive applications, large message payloads, high-throughput scenarios
- **Overhead**: Adds serialization/deserialization overhead for message passing
- **Memory**: Worker maintains separate memory space, so total memory usage is higher
- **Concurrency**: Allows main thread to remain responsive during storage operations

**Browser Support:**

- All modern browsers with Web Worker support
- Chrome 4+, Firefox 3.5+, Safari 4+, Edge 12+
- Node.js 10.5+ with Worker Threads support

**Error Handling:**

```ts
try {
  await store.addMessage(message);
} catch (error) {
  if (error.message.includes("Worker not responding")) {
    // Handle worker communication errors
    console.error("Worker communication failed:", error);
  } else {
    // Handle storage-specific errors
    console.error("Storage operation failed:", error);
  }
}
```

### Error & Failure Semantics

- Messages are **only deleted** if explicitly acknowledged with `ack()` or `acknowledgeMessage()`.
- If user processing throws and the message is **not acknowledged**, it will be reclaimed by another worker after `messageTimeoutMs`.
- The keep‑alive mechanism prevents message timeout during processing, but acknowledgment is required for deletion.
- This provides _at least once_ delivery semantics by default - failed messages are automatically retried.
- Long running tasks require `ackIntervalMs < messageTimeoutMs` to avoid premature reclamation.

### Selecting Interval Values

| Scenario               | Suggested `ackIntervalMs` | Suggested `messageTimeoutMs` | Notes                                  |
| ---------------------- | ------------------------- | ---------------------------- | -------------------------------------- |
| Fast tasks (<50ms)     | 50                        | 500                          | Lower overhead, quick reclaim on crash |
| Medium tasks (seconds) | 500                       | 5_000                        | 10× ratio typical                      |
| Long tasks (minutes)   | 5_000                     | 60_000                       | Keep at least 5–10× headroom           |

Ensure: `ackIntervalMs * 2 <= messageTimeoutMs` (rule‑of‑thumb) to mitigate clock jitter.

### Concurrency

Multiple async consumers can iterate the same queue instance. Each claimed message is acknowledged before yielding to user code, so other workers skip it unless it times out.

### Cancellation

Use `AbortController` or a custom observer to terminate a long‑lived consumer cleanly.

### Graceful Shutdown

The queue supports graceful shutdown through the `close()` method, which stops all active consumers safely:

```ts
const queue = new Queue();

// Multiple consumers
const consumers = [
  worker("Consumer-1"),
  worker("Consumer-2"),
  worker("Consumer-3"),
];

async function worker(name: string) {
  for await (const job of queue) {
    console.log(name, "processing", job);
    await processJob(job);
    queue.ack(job);
  }
  console.log(name, "stopped gracefully");
}

// Shutdown all consumers gracefully
setTimeout(() => {
  console.log("Initiating graceful shutdown...");
  queue.close(); // All consumers will stop after completing current messages
}, 60000);

await Promise.all(consumers);
console.log("All consumers stopped");
```

**Disposable Pattern:**

```ts
{
  using queue = new Queue();
  // Queue will be automatically closed when leaving this scope
  for await (const job of queue) {
    await processJob(job);
    queue.ack(job);
  }
} // Automatic cleanup here
```

### Limitations & TODO

- `MemoryStore` lacks atomicity & durability.
- No priority ordering (FIFO only via array scan order).
- No visibility into in‑flight messages besides store inspection.
- No backpressure signal (`add` always succeeds). Add your own capacity guard if needed.
- `IndexedDBStore` is browser-only (requires IndexedDB support).
- `WorkerStore` adds serialization overhead and requires separate worker lifecycle management.

Potential future extensions: priority queues, batch consumption, dead‑letter store, exponential retry.

### Example: Two Workers

```ts
const store = new MemoryStore();
const queue = new Queue({ store, messageTimeoutMs: 500, ackIntervalMs: 100 });

await queue.add({ id: 1 });
await queue.add({ id: 2 });

const worker = (name: string) =>
  (async () => {
    for await (const job of queue) {
      console.log(name, "got", job);
      await new Promise((r) => setTimeout(r, 150)); // simulate work
      queue.ack(job); // Acknowledge successful processing
    }
  })();

await Promise.all([worker("A"), worker("B")]);
```

### Testing Notes

For deterministic tests, tune small values:

```ts
const queue = new Queue({
  store: new MemoryStore(),
  ackIntervalMs: 20,
  messageTimeoutMs: 100,
});
```
