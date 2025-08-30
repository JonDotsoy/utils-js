# Queue API

High–level, lightweight asynchronous message queue with periodic acknowledgments, cooperative workers and pluggable storage.

> This module exports: `Queue`, `MemoryStore`, `Store` (abstract base), `Message`, `ValueObserver`, and the interface `ReadOnlyValueObserver<T>`.

## Features

- Async iterator consumption (`for await ... of queue`)
- Periodic acknowledgement keep‑alive while a message is being processed
- Automatic deletion after successful processing (in `finally` block safety)
- Reclaim (re-deliver) messages whose acknowledgement timeout elapsed
- Pluggable storage through the `Store` abstraction (in‑memory implementation included)
- Flexible consumption control: boolean flag, reactive `ReadOnlyValueObserver`, or `AbortSignal`
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
| Store                  | Abstraction for persistence; must implement methods to add / get / acknowledge / delete / claim / count.                     |
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
  [Symbol.asyncIterator](): AsyncGenerator<any>;
}
```

#### Options (`QueueOptions`)

| Option              | Type    | Default             | Description                                                             |
| ------------------- | ------- | ------------------- | ----------------------------------------------------------------------- |
| `pollingIntervalMs` | number  | 50                  | Delay between polls when no message claimed.                            |
| `messageTimeoutMs`  | number  | 100                 | Time without acknowledgement after which a message becomes reclaimable. |
| `ackIntervalMs`     | number  | 100                 | Periodic acknowledgement keep‑alive while processing.                   |
| `store`             | `Store` | `new MemoryStore()` | Storage backend instance.                                               |

#### `add(data: any)`

Enqueues a new message wrapping the provided payload.

#### `ack(messageRef: any)`

Marks a message as successfully processed, allowing it to be deleted from the queue. This is an alias for `acknowledgeMessage()`.

#### `acknowledgeMessage(messageRef: any)`

Marks a message as successfully processed, allowing it to be deleted from the queue. The message reference should be the data yielded by the consume generator.

#### `consume(signal?: AbortSignal)`

Returns an async generator that yields message `data` values. **Important**: Messages are only deleted from the queue if they are explicitly acknowledged using `ack()` or `acknowledgeMessage()`.

| Argument form | Behavior                                            |
| ------------- | --------------------------------------------------- |
| Omitted       | Polls continuously until queue is inactive.         |
| `AbortSignal` | Exits when signal is aborted (not yet implemented). |

> Keep‑alive continues until message processing finishes. Messages are **only deleted** if explicitly acknowledged with `ack()` or `acknowledgeMessage()`.

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

With AbortSignal (when implemented):

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
  ): Promise<Message | null>;
  abstract getSize(): Promise<number>;
}
```

`claimMessage` should be atomic in multi‑producer / multi‑consumer implementations (the provided `MemoryStore` is not safe for concurrent multi‑process usage).

### MemoryStore

Reference implementation for tests & development. **Not durable.** Adds a reactive `queueSize` internal observer (not exported) to track length.

### ValueObserver

```ts
class ValueObserver<T> {
  constructor(value: T);
  get(): T;
  set(value: T): void;
  listen(callback: (value: T) => void): () => void;
  subscribe(callback: (value: T) => void): () => void;

  // Static methods
  static isReadOnlyValueObserver<T>(
    value: any,
  ): value is ReadOnlyValueObserver<T>;
  static readOnlyValueObserver<T>(
    value: T | ReadOnlyValueObserver<T>,
  ): ReadOnlyValueObserver<T>;
  static readOnlyValueObserverFromAbortSignal(
    signal: AbortSignal,
  ): ReadOnlyValueObserver<boolean>;
}
```

A reactive observer pattern implementation for watching value changes. Allows monitoring changes to a value and notifying registered callbacks whenever the value is updated.

- `get()` - Gets the current value
- `set(value)` - Sets a new value and notifies all registered callbacks
- `listen(callback)` - Registers a callback to be called when the value changes, returns unsubscribe function
- `subscribe(callback)` - Registers a callback and immediately calls it with current value, returns unsubscribe function

Static helper methods provide utilities for working with `ReadOnlyValueObserver` interfaces, including type guards and conversion utilities.

### ReadOnlyValueObserver<T>

```ts
interface ReadOnlyValueObserver<T> {
  get(): T;
}
```

Read-only interface for value observers. Provides a contract for objects that can provide a value without allowing direct modification. Useful for creating immutable value references or dependency injection scenarios.

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
  pollingIntervalMs: 5,
  ackIntervalMs: 20,
  messageTimeoutMs: 100,
});
```
