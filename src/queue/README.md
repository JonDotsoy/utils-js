# Queue API

High–level, lightweight asynchronous message queue with periodic acknowledgments, cooperative workers and pluggable storage.

> This module exports: `Queue`, `MemoryStore`, `Store` (abstract base), and `Message`.

## Features

- Async iterator consumption (`for await ... of queue`)
- **Graceful shutdown** with `close()` method and Disposable pattern support
- Periodic acknowledgement keep‑alive while a message is being processed
- Automatic deletion after successful processing (in `finally` block safety)
- Reclaim (re-deliver) messages whose acknowledgement timeout elapsed
- Pluggable storage through the `Store` abstraction (in‑memory implementation included)
- Zero external dependencies

## Installation

Installed as part of your workspace package (example with bun / npm):

```bash
bun add @jondotsoy/utils-js
# or
npm install @jondotsoy/utils-js
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

## Concepts

| Concept                | Description                                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Message                | Wrapper carrying `data`, `id`, timestamps `createdAt`, `acknowledgedAt`.                                                     |
| Acknowledge keep‑alive | Timer re‑acknowledging the message every `ackIntervalMs` until processing finishes.                                          |
| Manual acknowledgment  | Messages must be explicitly acknowledged with `ack()` or `acknowledgeMessage()` to be deleted from the queue.                |
| Reclaim                | If a message's last `acknowledgedAt` is older than `now - messageTimeoutMs`, it is eligible to be claimed by another worker. |
| Graceful shutdown      | Queue can be closed with `close()` to stop all message consumption gracefully without interrupting current processing.       |
| Store                  | Abstraction for persistence; must implement methods to add / get / acknowledge / delete / claim / count / close.             |
| MemoryStore            | Simple array based store (dev / tests). Not durable.                                                                         |

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
  constructor(public data: any);
  acknowledge(): void;
}
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

Reference implementation for tests & development. **Not durable.** Adds a reactive internal observer (not exported) to track queue size.

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
