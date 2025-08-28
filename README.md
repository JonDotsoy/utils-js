# utils-js

Some utilities for JS. Will be util to reduce common logic in your code.

- [visit](#visit)
- [get](#get)
- [set](#set)
- [pipe](#pipe)
- [result](#result)
- [CleanupTasks](#cleanuptasks)
- [Bytes](#bytes)
- [BytesFormat](#bytesformat)
- [Queue](#queue)

## Visit

A generator function that recursively visits nodes in an object, yielding each node that passes the provided test.

**Syntax**

```ts
visit(node);
visit(node, test);
```

**Arguments:**

- `node` `<unknown>`: The starting node to visit.
- `test` `<(node: unknown) => boolean>`: An optional function that takes a node as input and returns a boolean. If true, the node will be yielded

**Example:**

```ts
import { visit } from "@jondotsoy/utils-js/visit";

const v = visit([1, 2, 3]);
v.next().value; // [1, 2, 3]
v.next().value; // 1
v.next().value; // 2
v.next().value; // 3

const v = visit(
  {
    children: [
      { type: "span", value: "foo" },
      { type: "block", children: [{ type: "span", value: "var" }] },
    ],
  },
  (node) => node.type === "span",
);
v.next().value; // {type:"span",value:"foo"}
v.next().value; // {type:"span",value:"var"}
```

### Visit.getParent

The Visit.getParent function is a helper method provided by the visit utility. It allows you to retrieve the parent node of a given node during the recursive traversal performed by the visit generator function. This can be useful when you need to access or modify the parent node based on the current node being visited.

**Syntax:**

```ts
Visit.getParent(node); // => parent
```

**Arguments:**

- `node` `<unknown>`: The node element for which to find the parent.

**Return:**

Returns the parent node that contains the provided node. If the node is the root node or has no parent, it returns undefined.

**Example:**

```ts
for (const node of visit(
  { a: { b: { toVisit: true } } },
  (node) => node.toVisit,
)) {
  visit.getParent(node); // => { b: { toVisit: true } }
}
```

### Visit.getFieldName

The Visit.getFieldName function is a utility method provided by the visit library. It allows you to retrieve the field name (or key) under which the current node is stored in its parent object during the traversal process.

**Syntax:**

```ts
Visit.getFieldName(node); // => string | number | symbol | undefined
```

**Arguments:**

- `node` `<unknown>`: The node element for which to find the field name.

**Return:**

Returns a string representing the field name of the current node within its parent object. If the node is the root node or the field name cannot be determined, it returns undefined.

**Example:**

```ts
for (const node of visit(
  { a: { b: { toVisit: true } } },
  (node) => node.toVisit,
)) {
  visit.getFieldName(node); // => 'b'
}
```

## Get

Safely access deeply nested properties in JavaScript/TypeScript objects by following a sequence of keys. The module also exposes type extractors and advanced validators that validate and convert the value when possible, making dynamic data handling safer and more convenient.

**Basic Syntax:**

```ts
get(obj); // => unknown | undefined
get(obj, ...paths); // => unknown | undefined
```

**Type Extractors and Advanced Validators:**

These methods allow you to obtain and validate values of specific types, attempting to convert the value when possible. They return `undefined` if the conversion or validation fails.

- `get.string(obj, ...paths)` → string | undefined
- `get.number(obj, ...paths)` → number | undefined
- `get.boolean(obj, ...paths)` → boolean | undefined
- `get.function(obj, ...paths)` → function | undefined
- `get.bigint(obj, ...paths)` → bigint | undefined
- `get.symbol(obj, ...paths)` → symbol | undefined
- `get.array(obj, ...paths)` → Array<unknown> | undefined
- `get.date(obj, ...paths)` → Date | undefined
- `get.numberDate(obj, ...paths)` → number | undefined (timestamp)
- `get.isoStringDate(obj, ...paths)` → string | undefined (ISO)
- `get.record(obj, ...paths)` / `get.object(obj, ...paths)` → object | undefined
- `get.is(test)(obj, ...paths)` → custom validation using a predicate function
- `get.parse(parser, obj, ...paths)` → advanced extraction and validation using a Zod schema or any object with a `safeParse` method

**Examples:**

Basic access:

```ts
const obj = { a: { b: { c: 42 } } };
get(obj, "a", "b", "c"); // 42
get(obj, "a", "x"); // undefined
```

Type extraction and conversion:

```ts
const obj = { value: "123", created: "2024-01-01T00:00:00Z" };
get.number(obj, "value"); // 123
get.date(obj, "created"); // Date instance
get.isoStringDate(obj, "created"); // '2024-01-01T00:00:00.000Z'
```

Custom validation:

```ts
const isEven = (v: unknown): v is number =>
  typeof v === "number" && v % 2 === 0;
const getEven = get.is(isEven);
const obj = { n: 4 };
getEven(obj, "n"); // 4
```

Advanced extraction and validation with Zod or custom parser:

```ts
import { z } from "zod";
const obj = { user: { profile: { age: "25" } } };
const schema = z.object({ age: z.preprocess(Number, z.number()) });
get.parse(schema, obj, "user", "profile"); // { age: 25 }

const customParser = {
  safeParse(v: any) {
    if (v && typeof v.foo === "number") {
      return { success: true as const, data: v.foo };
    }
    return { success: false as const, error: "Not a number" };
  },
};
const obj2 = { foo: 123 };
get.parse(customParser, obj2); // 123
```

These extractors and validators help you write more robust and safe code, especially when working with dynamic data or complex nested structures.

## Set

Sets a value at a specified path within a nested object structure.

**Syntax**

```ts
set(obj, paths, value);
```

**Arguments**

- `obj` `<unknown>`: The object to modify.
- `paths` `<Array<string | number | symbol>>`: An array of property keys representing the path to the target property.
- `value` `<unknown>`: The value to set at the specified path.

**Return**

The modified object.

**Example:**

```ts
const obj = { a: {} };
set(obj, ["a", "b", "c"], 1); // => { a: { b: { c: 1} } }

const data = { a: { b: 1 } };

set(data, ["a", "b"], 2); // => { a: { b: 2 } }

set(data, ["a", "c", "d"], 3); //=> { a: { b: 2, c: { d: 3 } } }
```

## Pipe

> Inspired by [tc39/proposal-pipeline-operator](https://github.com/tc39/proposal-pipeline-operator).

Allows you to chain operations in a readable and simple way, supporting both synchronous and asynchronous functions. The pipeline type adapts automatically according to the value returned by each operation.

**Import:**

```ts
import { pipe } from "@jondotsoy/utils-js/pipe";
```

**Syntax**

```ts
pipe(initialValue).value();
pipe(initialValue).pipe(operator).value();
pipe(initialValue).pipe(operator).pipe(operator).value();
// ...and so on

// If you use `await` directly, you do not need to call `.value()`:
await pipe(initialValue);
await pipe(initialValue).pipe(operator);
await pipe(initialValue).pipe(operator).pipe(operator);
// ...and so on
```

**Basic usage:**

```ts
const sum = (v: number) => (a: number) => a + v;

// Synchronous operations
const res = pipe(3)
  .pipe(sum(1))
  .pipe((a) => a * 2)
  .value(); // => 8

// Asynchronous or mixed operations
const asyncSum = (v: number) => async (a: number) => a + v;

const result = await pipe(3)
  .pipe(asyncSum(2))
  .pipe((a) => a * 2)
  .value(); // => 10
```

**API:**

- `pipe(initialValue)`
  - Creates a pipeline with the initial value (can be sync or a promise).
- `.pipe(fn)`
  - Chains a function that receives the previous value and returns a new value or a promise.
  - If any function returns a promise, the pipeline becomes asynchronous automatically.
- `.value()`
  - Returns the final value (or a promise if any operation was asynchronous).

**Additional examples:**

```ts
// Mixed chaining
const res = await pipe(1)
  .pipe((a) => a + 1)
  .pipe(async (a) => a * 3)
  .pipe((a) => a - 2);
// => 4

// Only synchronous
pipe(5)
  .pipe((a) => a * 2)
  .pipe((a) => a + 1)
  .value(); // => 11
```

**Types:**

- The type returned by `.pipe()` and `.value()` automatically adjusts according to the value type (sync/async).
- You do not need to import from `pipe/async`, the main `pipe` handles both cases.

## result

> Inspiring on [arthurfiorette/proposal-safe-assignment-operator](https://github.com/arthurfiorette/proposal-safe-assignment-operator)

Capture the result of an expression and return it as a value.

```ts
import { result } from "@jondotsoy/utils-js/result";

const asyncExpression = () => fetch("https://example.com");

const [error, response] = await result(asyncExpression);

if (error) {
  console.error(error);
  return;
}

console.log(response);
```

**Syntax**

```ts
const [error, value] = result(expression);
const [error, value] = await result(asyncExpression);
```

**Arguments**

- `expression` `<unknown>`: The expression to evaluate.
- `asyncExpression` `<Promise<unknown>>`: The async expression to evaluate.

**Return**

A tuple containing the error and the value of the expression.

**Example**

```ts
import { result } from "@jondotsoy/utils-js/result";

const asyncExpression = () => fetch("https://example.com");

const [error, response] = await result(asyncExpression);

if (error) {
  console.error(error);
  return;
}

console.log(response);
```

## CleanupTasks

**syntax**

```ts
const cleanupTasks = new CleanupTasks();
await using cleanupTasks = new CleanupTasks();
```

**Return**

Instance of `CleanupTasks` class.

**Example**

```ts
await using cleanupTasks = new CleanupTasks();

cleanupTasks.add(() => myCleanupTask());

await cleanupTasks.cleanup();
```

## Bytes

A utility class for converting and formatting byte values in different units (byte, kilobyte, megabyte, gigabyte, terabyte, petabyte). Supports aliases and plural forms for units, as well as parsing from strings.

**Syntax:**

```ts
import { Bytes } from "@jondotsoy/utils-js/bytes";

const bytes = new Bytes(1024); // 1024 bytes
```

### Methods

| Method                              | Description                                                                 |
| ----------------------------------- | --------------------------------------------------------------------------- |
| `toBytes()`                         | Returns the value in bytes.                                                 |
| `toKilobytes()`                     | Returns the value in kilobytes.                                             |
| `toMegabytes()`                     | Returns the value in megabytes.                                             |
| `toGigabytes()`                     | Returns the value in gigabytes.                                             |
| `toTerabytes()`                     | Returns the value in terabytes.                                             |
| `toPetabytes()`                     | Returns the value in petabytes.                                             |
| `toLocaleString(locale?, options?)` | Returns a human-readable string (e.g., '1 MB'), accepts formatting options. |
| `static from(value, unit?)`         | Creates a Bytes instance from a number and unit, or from a string.          |

### Supported units

- `byte`, `kilobyte`, `megabyte`, `gigabyte`, `terabyte`, `petabyte`
- Aliases: `b`, `kb`, `mb`, `gb`, `tb`, `pb`
- Plurals: `bytes`, `kilobytes`, etc.

### Examples

**Convert between units:**

```ts
const bytes = new Bytes(1048576); // 1 MB
bytes.toKilobytes(); // 1024
bytes.toMegabytes(); // 1
bytes.toGigabytes(); // 0.0009765625
```

**Create Bytes from number and unit:**

```ts
const kb = Bytes.from(1, "kilobyte");
kb.toBytes(); // 1024

const mb = Bytes.from(2, "mb");
mb.toBytes(); // 2097152
```

**Create Bytes from string:**

```ts
const b1 = Bytes.from("1kb");
b1.toBytes(); // 1024

const b2 = Bytes.from("2 MB");
b2.toBytes(); // 2097152
```

**Format as a human-readable string:**

```ts
const bytes = new Bytes(123456789);
bytes.toLocaleString("en-US"); // '117.74 MB'
bytes.toLocaleString("de-DE"); // '117,74 MB'
// With options:
bytes.toLocaleString("en-US", { unit: "megabyte", maximumFractionDigits: 1 }); // '117.7 MB'
```

**Error handling for invalid units:**

```ts
Bytes.from(1, "invalidUnit"); // Throws: Invalid unit type: invalidUnit
Bytes.from("10zz"); // Throws: Invalid unit type: zz
```

## BytesFormat

A utility class for formatting byte values into human-readable strings with automatic or fixed units, supporting localization and custom formatting options.

**Syntax:**

```ts
import { BytesFormat } from "@jondotsoy/utils-js/bytes-format";

const formatter = new BytesFormat("en-US");
formatter.format(1048576); // '1 MB'
```

### Constructor

```ts
new BytesFormat(locale?: string, options?: BytesFormatOptions)
```

- `locale`: Optional. A BCP 47 language tag (e.g., 'en-US', 'de-DE').
- `options`: Optional. Formatting options:
  - `unit`: Force a specific unit (e.g., 'megabyte'), or use 'auto' (default).
  - `unitDisplay`: 'short' | 'long' | 'narrow' (default: 'short').
  - `maximumFractionDigits`: Number of decimal places (default: 2).
  - `maximumSignificantDigits`: Number of significant digits.

### Methods

| Method      | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| `format(n)` | Formats the number of bytes as a localized string with unit. |

### Examples

**Automatic unit selection:**

```ts
const f = new BytesFormat("en-US");
f.format(2048); // '2 kB'
f.format(1048576); // '1 MB'
f.format(512); // '512 byte'
```

**Force a specific unit:**

```ts
const f = new BytesFormat("en-US", { unit: "megabyte" });
f.format(1048576); // '1 MB'
f.format(2048); // '0 MB'
```

**Custom unit display:**

```ts
new BytesFormat("en-US", { unitDisplay: "long" }).format(2048); // '2 kilobytes'
new BytesFormat("en-US", { unitDisplay: "narrow" }).format(2048); // '2kB'
```

**Custom decimal places:**

```ts
new BytesFormat("en-US", { maximumFractionDigits: 1 }).format(1536); // '1.5 kB'
new BytesFormat("en-US", { maximumFractionDigits: 0 }).format(1536); // '2 kB'
```

**Localization:**

```ts
new BytesFormat("de-DE").format(123456789); // '117,74 MB'
```

## Queue

A lightweight asynchronous message queue system with support for pluggable storage, keep-alive acknowledgments, and concurrent worker processing. Perfect for background job processing, task coordination, and reliable message distribution.

**Import:**

```ts
import { Queue } from "@jondotsoy/utils-js/queue";
```

### Basic Usage

**Simple message processing:**

```ts
const queue = new Queue();

// Add messages
await queue.add({ task: "send-email", to: "user@example.com" });
await queue.add({ task: "process-image", id: 123 });

// Process messages with async iteration
for await (const message of queue) {
  console.log("Processing:", message);
  // Message is automatically acknowledged and deleted
}
```

**Concurrent workers:**

```ts
const queue = new Queue();

const worker1 = async () => {
  for await (const job of queue) {
    console.log("Worker 1 processing:", job);
    await simulateWork(job);
    // Message is automatically acknowledged and deleted
  }
};

const worker2 = async () => {
  for await (const job of queue) {
    console.log("Worker 2 processing:", job);
    await simulateWork(job);
    // Message is automatically acknowledged and deleted
  }
};

// Both workers process different messages concurrently
await Promise.all([worker1(), worker2()]);
```

### Queue Options

```ts
const queue = new Queue({
  pollingIntervalMs: 100, // Delay between polls when queue is empty (default: 50)
  messageTimeoutMs: 5000, // Message timeout for recovery (default: 100)
  ackIntervalMs: 1000, // Keep-alive acknowledgment interval (default: 100)
  store: new MemoryStore(), // Custom storage backend (default: MemoryStore)
});
```

### Consumption Modes

**Exit when empty (default):**

```ts
for await (const job of queue.consume()) {
  // Exits when no more messages
}
```

**Continuous polling:**

```ts
for await (const job of queue.consume(true)) {
  // Keeps polling for new messages indefinitely
}
```

**With AbortSignal:**

```ts
const controller = new AbortController();
setTimeout(() => controller.abort(), 10000); // Stop after 10 seconds

for await (const job of queue.consume(controller.signal)) {
  // Process messages until aborted
}
```

**With reactive control using ReadOnlyValueObserver:**

```ts
import { ValueObserver } from "@jondotsoy/utils-js/queue";

const shouldWait = new ValueObserver(false);

// Start consuming, will exit when empty initially
const consumePromise = (async () => {
  for await (const messageData of queue.consume(shouldWait)) {
    console.log("Processing:", messageData);
  }
})();

// Later, change to continuous polling
shouldWait.set(true);
```

### Custom Storage Backend

Implement your own storage by extending the `Store` abstract class:

```ts
import { Store, Message } from "@jondotsoy/utils-js/queue";

abstract class Store {
  abstract addMessage(message: Message): Promise<void>;
  abstract getMessage(messageId: string): Promise<Message | null>;
  abstract acknowledgeMessage(messageId: string): Promise<void>;
  abstract deleteMessage(messageId: string): Promise<void>;
  abstract claimMessage(
    acknowledgeTimeoutMs: number,
    now: number,
  ): Promise<Message | null>;
  abstract getSize(): Promise<number>;
}

class RedisStore extends Store {
  // Implement Redis-backed storage
  async addMessage(message: Message): Promise<void> {
    // Your Redis implementation
  }

  async getMessage(messageId: string): Promise<Message | null> {
    // Your Redis implementation
  }

  async acknowledgeMessage(messageId: string): Promise<void> {
    // Your Redis implementation
  }

  async deleteMessage(messageId: string): Promise<void> {
    // Your Redis implementation
  }

  async claimMessage(
    acknowledgeTimeoutMs: number,
    now: number,
  ): Promise<Message | null> {
    // Your Redis implementation - should be atomic
  }

  async getSize(): Promise<number> {
    // Your Redis implementation
  }
}

const queue = new Queue({ store: new RedisStore() });
```

### Features

- **🔄 Async Iterator Support**: Clean `for await...of` consumption pattern
- **💾 Pluggable Storage**: Abstract `Store` interface with in-memory implementation
- **⚡ Keep-Alive Acknowledgments**: Prevents message timeout during long processing
- **🔀 Concurrent Workers**: Multiple consumers safely process different messages
- **🛡️ Message Recovery**: Automatic reclaim of failed/stalled messages after timeout
- **🎛️ Flexible Control**: Boolean, reactive observer, or AbortSignal consumption modes
- **📦 Zero Dependencies**: Pure TypeScript implementation
- **🔒 Type Safe**: Full TypeScript support with comprehensive type definitions

### Use Cases

- **Background job processing**
- **Task queue coordination between workers**
- **Event-driven microservices communication**
- **Batch processing with failure recovery**
- **Real-time message distribution systems**

For complete API documentation and advanced usage examples, see [src/queue/README.md](src/queue/README.md).

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details
