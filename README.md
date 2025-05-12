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

Safely access deeply nested properties in JavaScript/TypeScript objects by following a sequence of keys. The module also exposes type extractors that validate and convert the value when possible, making dynamic data handling safer and more convenient.

**Basic Syntax:**

```ts
get(obj); // => unknown | undefined
get(obj, ...paths); // => unknown | undefined
```

**Type Extractors:**

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

These extractors help you write more robust and safe code, especially when working with dynamic data or complex nested structures.

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

> Inspiring on [tc39/proposal-pipeline-operator](https://github.com/tc39/proposal-pipeline-operator).

Simplify the joint operations to be easier to read and reduce complexity. It also supports async operations.

```ts
import { pipe } from "@jondotsoy/utils-js/pipe";

const sum = (v: number) => (a: number) => a + v;

const res = pipe(3).pipe(sum(1)).value();

res; // => 4
```

Alternative using to async operations. To this import `"@jondotsoy/utils-js/pipe/async"` module.

```ts
import { pipe } from "@jondotsoy/utils-js/pipe/async";

const sum = (v: number) => async (a: number) => a + v;

const res = await pipe(3).pipe(sum(1)).value();

res; // => 4
```

**Syntax:**

```ts
pipe(initialValue).value();
pipe(initialValue).pipe(operator).value();
pipe(initialValue).pipe(operator).pipe(operator).value();
```

**Arguments**

- `initialValue` `<unknown>`: initial value to pass on the next operator.
- `operator` `<(prevValue: unknown) => unknown>`: The operator to apply to the previous value.

**Return**

A pipe object that can be used to chain operations. call `.value()` to get the final result.

**Example:**

```ts
const sum = (v: number) => (a: number) => a + v;

pipe(3).pipe(sum(1)).value(); // => 4;

pipe(3)
  .pipe((a) => a + 1)
  .pipe((a) => a + 1)
  .value(); // => 5;

await pipe(3)
  .pipe(async (a) => a + 2)
  .pipe(sum(1))
  .value(); // => Promise<6>;
```

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

A utility class for converting and formatting byte values in different units (byte, kilobyte, megabyte, gigabyte, terabyte, petabyte).

**Syntax:**

```ts
import { Bytes } from "@jondotsoy/utils-js/bytes";

const bytes = new Bytes(1024); // 1024 bytes
```

### Methods

| Method                    | Description                                         |
| ------------------------- | --------------------------------------------------- |
| `toBytes()`               | Returns the value in bytes.                         |
| `toKilobytes()`           | Returns the value in kilobytes.                     |
| `toMegabytes()`           | Returns the value in megabytes.                     |
| `toGigabytes()`           | Returns the value in gigabytes.                     |
| `toTerabytes()`           | Returns the value in terabytes.                     |
| `toPetabytes()`           | Returns the value in petabytes.                     |
| `toLocaleString(locale?)` | Returns a human-readable string (e.g., '1 MB').     |
| `from(value, unit)`       | Creates a new Bytes instance from a value and unit. |

### Units

Supported units: `byte`, `kilobyte`, `megabyte`, `gigabyte`, `terabyte`, `petabyte` (also accepts abbreviations: `b`, `kb`, `mb`, `gb`, `tb`, `pb`).

### Examples

**Convert between units:**

```ts
const bytes = new Bytes(1048576); // 1 MB
bytes.toKilobytes(); // 1024
bytes.toMegabytes(); // 1
bytes.toGigabytes(); // 0.0009765625
```

**Create Bytes from a specific unit:**

```ts
const kb = new Bytes(0).from(1, "kilobyte");
kb.toBytes(); // 1024

const mb = new Bytes(0).from(2, "mb");
mb.toBytes(); // 2097152
```

**Format as a human-readable string:**

```ts
const bytes = new Bytes(123456789);
bytes.toLocaleString("en-US"); // '117.74 MB'
bytes.toLocaleString("de-DE"); // '117,74 MB'
```

**Error handling for invalid units:**

```ts
new Bytes(0).from(1, "invalidUnit"); // Throws: Invalid unit type: invalidUnit
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

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details
