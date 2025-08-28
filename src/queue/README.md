# Queue API

High–level, lightweight asynchronous message queue with periodic acknowledgments, cooperative workers and pluggable storage.

> This module exports: `Queue`, `MemoryStore`, `Store` (abstract base), `Message`, and the interface `ReadOnlyValueObserver<T>`.

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
  // Process and exit when queue becomes empty.
  console.log("Processing", job);
}
```

## Concepts

| Concept                | Description                                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Message                | Wrapper carrying `data`, `id`, timestamps `createdAt`, `acknowledgedAt`.                                                     |
| Acknowledge keep‑alive | Timer re‑acknowledging the message every `ackIntervalMs` until processing finishes.                                          |
| Reclaim                | If a message's last `acknowledgedAt` is older than `now - messageTimeoutMs`, it is eligible to be claimed by another worker. |
| Store                  | Abstraction for persistence; must implement methods to add / get / acknowledge / delete / claim / count.                     |
| MemoryStore            | Simple array based store (dev / tests). Not durable.                                                                         |
| Consumption control    | `consume(waitForMessages)` parameter decides loop exit: boolean, `ReadOnlyValueObserver<boolean>`, or `AbortSignal`.         |

## Message Lifecycle

1. `add(data)` creates a `Message` with `acknowledgedAt = null`.
2. Worker claims an unacknowledged / expired message (sets `acknowledgedAt = now`).
3. Keep‑alive acknowledges again every `ackIntervalMs` while processing.
4. Worker yields `message.data` to caller code.
5. After processing, message is deleted and keep‑alive stops.
6. If worker crashes / stalls, another worker can reclaim after `messageTimeoutMs`.

## API Reference

### Queue

```ts
class Queue {
  constructor(options?: QueueOptions);
  add(data: any): Promise<void>;
  consume(
    waitForMessages?: boolean | ReadOnlyValueObserver<boolean> | AbortSignal,
  ): AsyncGenerator<any>;
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

#### `consume(waitForMessages?)`

Returns an async generator that yields message `data` values.

| Argument form                    | Behavior                                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| Omitted / `false`                | Stops when queue becomes empty (after finishing current message).                              |
| `true`                           | Polls forever (use external cancellation).                                                     |
| `ReadOnlyValueObserver<boolean>` | Dynamically controls looping. When observer `.get()` returns `false` and queue empty -> exits. |
| `AbortSignal`                    | Exits when signal is aborted (also subject to empty queue behavior if signal still false).     |

> Keep‑alive continues until message deletion even if an exception occurs; deletion only happens after the `yield` and user code finishes.

##### Consumption Patterns

Basic exit when empty:

```ts
for await (const data of queue.consume()) {
  await handle(data);
}
```

Continuous (daemon style) with abort:

```ts
const controller = new AbortController();
(async () => {
  for await (const data of queue.consume(true)) {
    await handle(data);
  }
})();
setTimeout(() => controller.abort(), 10_000);
```

Reactive control:

```ts
// Implement the ReadOnlyValueObserver interface.
let flag = false;
const control: ReadOnlyValueObserver<boolean> = { get: () => flag };

const loop = (async () => {
  for await (const data of queue.consume(control)) {
    await handle(data);
  }
})();

// Later promote to continuous
flag = true;
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

### ReadOnlyValueObserver<T>

```ts
interface ReadOnlyValueObserver<T> {
  get(): T;
}
```

Provide an object adhering to this interface for dynamic control of `consume()`.

### Error & Failure Semantics

- If user processing throws, the `finally` block stops keep‑alive; the message was already deleted after your handler finishes (deletion occurs only if the `yield` resumed and delete succeeded inside try block). If you want _at least once_ semantics with requeue-on-failure you would need to customize deletion logic.
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
