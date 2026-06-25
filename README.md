# utils-js

Some utilities for JS. Will be util to reduce common logic in your code.

- [visit](#visit)
- [get](#get)
- [set](#set)
- [pick](#pick)
- [pipe](#pipe)
- [result](#result)
- [CleanupTasks](#cleanuptasks)
- [Bytes](#bytes)
- [BytesFormat](#bytesformat)
- [Meter](#meter)
- [Queue](#queue)
- [Workspace](#workspace)
- [Unit Conversion Family](#unit-conversion-family)
  - [Weight](#weight)
  - [Length](#length)
  - [Temperature](#temperature)
  - [Volume](#volume)
  - [Circumference](#circumference)

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

## Pick

A utility for safely navigating and validating data structures with a chainable API. Returns `undefined` when an operation fails, allowing elegant handling of cases where data doesn't meet expectations.

**Import:**

```ts
import { pick } from "@jondotsoy/utils-js/pick";
```

**Syntax:**

```ts
pick(value);
```

**Arguments:**

- `value` `<unknown>`: The value to wrap and validate.

**Return:**

A Pick instance with chainable validation methods.

**Basic Examples:**

```ts
// Safe property access
const data = { user: { name: "Alice", age: 30 } };
const name = pick(data).property("user")?.property("name")?.valueOf();
// name = "Alice"

// Type validation
pick("hello").string()?.valueOf(); // "hello"
pick(123).number()?.valueOf(); // 123
pick([1, 2, 3]).array()?.valueOf(); // [1, 2, 3]

// Returns undefined on validation failure
pick(123).string(); // undefined
pick("text").number(); // undefined
```

### Methods

**Type Validators:**

- `.string()` - Validates the value is a string
- `.number()` - Validates the value is a number
- `.integer()` - Validates the value is an integer
- `.bigInt()` - Validates the value is a bigint
- `.boolean()` - Validates the value is a boolean
- `.array()` - Validates the value is an array
- `.record()` - Validates the value is an object
- `.native()` - Validates the value is a native JS type (string, number, boolean, array, or object)
- `.date()` - Validates the value is a valid Date object (returns DatePick)
- `.undefined()` - Validates the value is undefined
- `.null()` - Validates the value is null
- `.symbol()` - Validates the value is a symbol

**Navigation & Transformation:**

- `.property(key)` - Accesses an object property
- `.pipe(transform)` - Applies a transformation function
- `.find(filter)` - Finds an element in an array
- `.filter(filter)` - Filters array elements
- `.every(validator)` - Validates all array elements
- `.oneOf(validators)` - Tries multiple validators
- `.enum(values)` - Validates value is in a set of allowed values
- `.valueOf()` - Returns the current value

**String Validators:**

- `.startsWith(prefix)` - Validates string starts with prefix
- `.endsWith(suffix)` - Validates string ends with suffix
- `.includes(search)` - Validates string/array/record contains element
- `.length(length)` - Validates exact length
- `.min(minValue)` - Validates minimum length/value
- `.max(maxValue)` - Validates maximum length/value
- `.regexp(pattern, flags?)` - Validates string matches regex
- `.uppercase()` - Validates all alphabetic characters are uppercase
- `.lowercase()` - Validates all alphabetic characters are lowercase
- `.email()` - Validates email format
- `.url()` - Validates URL format
- `.trim()` - Removes whitespace from start and end
- `.toUpperCase()` - Transforms to uppercase
- `.toLowerCase()` - Transforms to lowercase

**Number Validators:**

- `.gt(other)` - Validates greater than
- `.gte(other)` - Validates greater than or equal
- `.lt(other)` - Validates less than
- `.lte(other)` - Validates less than or equal
- `.eq(other)` - Validates strict equality
- `.between(min, max)` - Validates within range
- `.positive()` - Validates positive number
- `.negative()` - Validates negative number
- `.multipleOf(divisor)` - Validates multiple of divisor
- `.even()` - Validates even number
- `.odd()` - Validates odd number

**Array Validators:**

- `.minLength(min)` - Validates minimum array length
- `.maxLength(max)` - Validates maximum array length
- `.notEmpty()` - Validates array is not empty
- `.first()` - Gets first element
- `.last()` - Gets last element
- `.at(index)` - Gets element at index

**Record Validators:**

- `.hasKey(key)` - Validates object has key
- `.hasKeys(keys)` - Validates object has all keys
- `.keys()` - Gets object keys as ArrayPick
- `.values()` - Gets object values as ArrayPick
- `.minKeys(min)` - Validates minimum number of keys
- `.maxKeys(max)` - Validates maximum number of keys

**Advanced Examples:**

```ts
// Enum validation
const status = pick({ status: "active" })
  .property("status")
  ?.enum(["active", "inactive", "pending"])
  ?.valueOf();
// status = "active"

// Transformation pipeline
const port = pick({ port: "3000" })
  .property("port")
  ?.string()
  ?.pipe((str) => parseInt(str, 10))
  .valueOf();
// port = 3000

// Array validation
const tags = pick({ tags: ["typescript", "javascript"] })
  .property("tags")
  ?.every((v) => v.string())
  ?.valueOf();
// tags = ["typescript", "javascript"]

// Flexible type validation
const timeout = pick({ timeout: 5000 })
  .property("timeout")
  ?.oneOf([(v) => v.string(), (v) => v.number()])
  ?.valueOf();
// timeout = 5000

// Array filtering
const users = [
  { name: "Alice", active: true },
  { name: "Bob", active: false },
];
const activeUsers = pick(users)
  .filter((user: any) => user.active)
  ?.valueOf();
// activeUsers = [{ name: "Alice", active: true }]

// String validation with regex
const email = pick({ email: "user@example.com" })
  .property("email")
  ?.string()
  ?.regexp(/^[\w.-]+@[\w.-]+\.\w+$/)
  ?.valueOf();
// email = "user@example.com"

// Date validation with range
const validDate = pick({ createdAt: new Date("2024-06-15") })
  .property("createdAt")
  ?.date()
  ?.after(new Date("2024-01-01"))
  ?.before(new Date("2024-12-31"))
  ?.valueOf();
// validDate = Date object if within range

// Number range validation
const age = pick({ age: 25 })
  .property("age")
  ?.number()
  ?.gte(18)
  ?.lte(65)
  ?.valueOf();
// age = 25

// String length and case validation
const username = pick({ username: "john_doe" })
  .property("username")
  ?.string()
  ?.min(3)
  ?.max(20)
  ?.lowercase()
  ?.valueOf();
// username = "john_doe"
```

### DatePick

`DatePick` is a specialized class for date validation, automatically returned by `.date()`:

**Methods:**

- `.after(minDate)` - Validates date is after minimum date
- `.before(maxDate)` - Validates date is before maximum date
- `.between(minDate, maxDate)` - Validates date is within range

**Example:**

```ts
const data = { createdAt: new Date("2024-01-01") };

// Validate Date object (does not convert timestamps or strings)
const date = pick(data).property("createdAt")?.date()?.valueOf();
// date = Date object

// Validate date range
const inRange = pick(data)
  .property("createdAt")
  ?.date()
  ?.between(new Date(2024, 0, 1), new Date(2024, 11, 31))
  ?.valueOf();
// inRange = Date object if in 2024
```

**Utilities:**

The `pick.utils` namespace exposes type validation functions for independent use:

```ts
pick.utils.isString(value); // boolean
pick.utils.isNumber(value); // boolean
pick.utils.isBoolean(value); // boolean
pick.utils.isArray(value); // boolean
pick.utils.isRecord(value); // boolean
pick.utils.isSymbol(value); // boolean
pick.utils.hasOwnProperty(obj, key); // boolean
pick.utils.includes(array, value); // boolean
```

For complete API documentation and more examples, see [src/pick/README.md](src/pick/README.md).

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

Capture the result of an expression and return it as a tuple with success status, error, and value. Provides type-safe error handling without try-catch blocks.

```ts
import { result } from "@jondotsoy/utils-js/result";

const asyncExpression = () => fetch("https://example.com");

const [ok, error, response] = await result(asyncExpression);

if (!ok) {
  console.error(error);
  return;
}

console.log(response);
```

**Syntax**

```ts
const [ok, error, value] = result(expression);
const [ok, error, value] = await result(asyncExpression);
const [ok, error, value] = result(fn, ...args); // Function with arguments
```

**Arguments**

- `expression` `<() => unknown | Promise<unknown>>`: A function that returns a value or promise.
- `asyncExpression` `<() => Promise<unknown>>`: A function that returns a promise.
- `fn` `<(...args: any[]) => unknown | Promise<unknown>>`: A function to call with provided arguments.
- `...args` `<any[]>`: Arguments to pass to the function.

**Return**

A tuple containing:

- `ok` `<boolean>`: Success status (true if successful, false if error)
- `error` `<Error | null>`: The error (null if successful)
- `value` `<T | null>`: The result value (null if error)

**Examples**

**Basic synchronous function:**

```ts
import { result } from "@jondotsoy/utils-js/result";

const [ok, error, data] = result(() => JSON.parse('{"key": "value"}'));

if (!ok) {
  console.error("Parse failed:", error.message);
  return;
}

console.log("Parsed data:", data); // { key: "value" }
```

**Asynchronous function:**

```ts
const [ok, error, response] = await result(async () => {
  const res = await fetch("https://api.example.com/data");
  return res.json();
});

if (!ok) {
  console.error("API call failed:", error);
  return;
}

console.log("API data:", response);
```

**Function with arguments:**

```ts
const [ok, error, parsed] = result(JSON.parse, '{"name": "John"}');

if (!ok) {
  console.error("JSON parsing failed:", error.message);
  return;
}

console.log("User:", parsed.name); // "John"
```

**Direct Promise handling:**

```ts
const [ok, error, value] = await result(Promise.resolve(42));

if (ok) {
  console.log("Value:", value); // 42
}
```

**Alternative exports:**

```ts
import { Result, ok, error } from "@jondotsoy/utils-js/result";

// Create results manually
const success = ok(42); // [true, null, 42]
const failure = error(new Error()); // [false, Error, null]

// Use Result class methods
const [isOk, err, val] = Result.try(() => riskyOperation());
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

## Meter

A library for parsing, converting, and formatting International System (SI) length units with localization support.

**Import:**

```ts
import { Meter } from "@jondotsoy/utils-js/meter";
import { MeterFormat } from "@jondotsoy/utils-js/meter";
```

### Features

- Parse strings with units (e.g., "2.5 km", "100 cm")
- Automatic conversion between units
- Localized formatting using `Intl.NumberFormat`
- Support for multiple languages with automatic pluralization
- Short and long unit forms

### Supported Units

| Unit       | Short | Long       | Factor         |
| ---------- | ----- | ---------- | -------------- |
| Kilometer  | km    | kilometer  | 1,000,000 mm   |
| Hectometer | hm    | hectometer | 100,000 mm     |
| Decameter  | dam   | decameter  | 10,000 mm      |
| Meter      | m     | meter      | 1,000 mm       |
| Decimeter  | dm    | decimeter  | 100 mm         |
| Centimeter | cm    | centimeter | 10 mm          |
| Millimeter | mm    | millimeter | 1 mm           |
| Micrometer | µm    | micrometer | 0.001 mm       |
| Nanometer  | nm    | nanometer  | 0.000001 mm    |
| Picometer  | pm    | picometer  | 0.000000001 mm |

### Basic Usage

**Parsing values:**

```ts
// Parse from string with unit
const distance1 = Meter.parse("2.5 km");
console.log(distance1.millimeter); // 2500000

// Parse from number (assumes millimeters)
const distance2 = Meter.parse(1000);
console.log(distance2.millimeter); // 1000

// Different unit formats
Meter.parse("1cm"); // 10 mm
Meter.parse("12 km"); // 12000000 mm
Meter.parse("2.5 meter"); // 2500 mm
```

**Formatting values:**

```ts
// Simple format
Meter.parse("2m").toLocaleString(); // "2 m"

// Long format (full names)
Meter.parse("2m").toLocaleString(undefined, { unitDisplay: "long" });
// "2 meters"

// Different locales
Meter.parse("2500mm").toLocaleString("en", { unitDisplay: "long" });
// "2.5 meters"

Meter.parse("5000mm").toLocaleString("ja-JP", { unitDisplay: "long" });
// "5メートル"
```

**Conversion between units:**

```ts
const distance = Meter.parse("2500 m");
const result = distance.toLocaleString("en", {
  unit: "kilometer",
  unitDisplay: "long",
});
console.log(result); // "2.5 kilometers"
```

### MeterFormat

Creates a reusable formatter for consistent formatting:

```ts
const formatter = new MeterFormat("es-CL", { unitDisplay: "long" });

formatter.format("1km"); // "1 kilometer"
formatter.format("3 cm"); // "3 centimeters"
formatter.format(2500); // "2.5 meters"
```

**Options:**

- `locale`: Locale to use (e.g., 'es-CL', 'en', 'ja-JP')
- `unitDisplay`: 'short' | 'long' - Unit format
- `unit`: Fixed unit to use (e.g., 'kilometer', 'meter')
- `unitAllow`: Array of allowed units for automatic selection

**Examples:**

```ts
// Fixed unit
Meter.parse("2500m").toLocaleString("es-CL", {
  unit: "kilometer",
  unitDisplay: "long",
});
// "2.5 kilometers"

// Restrict allowed units
const formatter = new MeterFormat("es-CL", {
  unitAllow: ["km", "m", "cm"],
  unitDisplay: "long",
});
formatter.format("5000mm"); // "5 meters" (doesn't use millimeters)
```

For complete API documentation and more examples, see [src/meter/README.md](src/meter/README.md).

## Queue

A lightweight asynchronous message queue system with support for pluggable storage, keep-alive acknowledgments, TTL (Time-to-Live) message expiration, and manual message confirmation. Perfect for background job processing, task coordination, and reliable message distribution with at-least-once delivery semantics.

**Import:**

```ts
import { Queue } from "@jondotsoy/utils-js/queue";

// For persistent storage (browser environments)
import { IndexedDBStore } from "@jondotsoy/utils-js/queue/store/indexeddb-store";

// For worker-based storage (browser and Node.js)
import { WorkerStore } from "@jondotsoy/utils-js/queue/store/worker-store";
```

### Basic Usage

**Simple message processing with manual acknowledgment:**

```ts
const queue = new Queue();

// Add messages
await queue.add({ task: "send-email", to: "user@example.com" });
await queue.add({ task: "process-image", id: 123 });

// Process messages with explicit acknowledgment
for await (const message of queue) {
  try {
    console.log("Processing:", message);
    await processMessage(message);

    // Acknowledge successful processing - required for deletion
    queue.ack(message);
  } catch (error) {
    // Don't acknowledge - message will be reclaimed
    console.error("Processing failed:", error);
  }
}
```

**Concurrent workers:**

```ts
const queue = new Queue();

const worker = (name) => async () => {
  for await (const job of queue) {
    try {
      console.log(`${name} processing:`, job);
      await simulateWork(job);
      queue.ack(job); // Acknowledge successful processing
    } catch (error) {
      console.error(`${name} failed:`, error);
      // Don't acknowledge - message will be reclaimed by another worker
    }
  }
};

// Both workers process different messages concurrently
await Promise.all([worker("Worker-1")(), worker("Worker-2")()]);
```

**With persistent storage (IndexedDB):**

```ts
import { IndexedDBStore } from "@jondotsoy/utils-js/queue/store/indexeddb-store";

// Messages persist across browser sessions
const queue = new Queue({
  store: new IndexedDBStore("my-app-queue"),
});

await queue.add({ task: "process-order", orderId: "123" });

for await (const job of queue) {
  console.log("Processing:", job);
  // Messages are automatically persisted to IndexedDB
  queue.ack(job);
}
```

**With worker-based storage (non-blocking):**

```ts
import { WorkerStore } from "@jondotsoy/utils-js/queue/store/worker-store";

// Create worker that handles storage operations
const worker = new Worker("/worker-store-backend.js");
const queue = new Queue({
  store: new WorkerStore(worker),
});

await queue.add({ task: "cpu-intensive-work", data: largeDataset });

for await (const job of queue) {
  console.log("Processing:", job);
  // Storage operations happen in worker thread - main thread stays responsive
  queue.ack(job);
}

// Health check
const response = await queue.store.ping(); // "pong"

// Cleanup
await queue.close();
worker.terminate();
```

**With TTL (Time-to-Live) expiration:**

```ts
import { IndexedDBStore } from "@jondotsoy/utils-js/queue/store/indexeddb-store";

const queue = new Queue({
  store: new IndexedDBStore("task-queue"),
});

// Add message with TTL (expires in 1 hour)
await queue.add(
  { task: "send-notification", userId: "123" },
  { ttl: 60 * 60 }, // 3600 seconds = 1 hour
);

// Add urgent task (expires in 5 minutes)
await queue.add(
  { task: "urgent-cleanup", resource: "/tmp" },
  { ttl: 5 * 60 }, // 300 seconds = 5 minutes
);

// Expired messages are automatically filtered out and cleaned up
// Manual cleanup also available: await queue.store.cleanupExpiredMessages();
```

**With AbortSignal support:**

```ts
const controller = new AbortController();

// Consume with cancellation support
(async () => {
  for await (const job of queue.consume(controller.signal)) {
    await processJob(job);
    queue.ack(job);
  }
})();

// Stop processing after 10 seconds
setTimeout(() => controller.abort(), 10_000);
```

**With TTL (Time-to-Live) message expiration:**

```ts
import { Queue, Message } from "@jondotsoy/utils-js/queue";

const queue = new Queue();

// Add a message that expires in 5 minutes
const message = new Message(
  { task: "send-notification", userId: "123" },
  { ttl: 5 * 60 }, // TTL in seconds
);
await queue.add(message);

// Messages are automatically cleaned up when expired
for await (const job of queue) {
  console.log("Processing:", job);
  queue.ack(job);
}
```

**Graceful shutdown:**

```ts
const queue = new Queue();

// Start consumers
const consumer = (async () => {
  for await (const job of queue) {
    await processJob(job);
    queue.ack(job);
  }
  console.log("Consumer stopped gracefully");
})();

// Graceful shutdown - completes current messages before stopping
setTimeout(() => queue.close(), 30_000);
await consumer;

// Or use Disposable pattern for automatic cleanup
{
  using queue = new Queue();
  // Queue automatically closed when leaving scope
}
```

### Queue Options

```ts
const queue = new Queue({
  messageTimeoutMs: 100, // Time before message is considered unacknowledged (default: 100)
  ackIntervalMs: 100, // Keep-alive acknowledgment interval (default: 100)
  store: new MemoryStore(), // Custom storage backend (default: new MemoryStore())
});
```

### Message Lifecycle & Acknowledgment

Messages require **explicit acknowledgment** to be deleted from the queue:

```ts
for await (const messageData of queue.consume()) {
  try {
    await processMessage(messageData);

    // Required: Acknowledge successful processing
    queue.ack(messageData); // or queue.acknowledgeMessage(messageData)
  } catch (error) {
    // Don't acknowledge - message will be reclaimed after timeout
    console.error("Processing failed:", error);
  }
}
```

**Key behaviors:**

- Messages are only deleted when explicitly acknowledged with `queue.ack()`
- Unacknowledged messages are automatically reclaimed after `messageTimeoutMs`
- Keep-alive prevents timeout during long processing
- Provides at-least-once delivery semantics

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
    abort?: AbortSignal,
  ): Promise<Message | null>;
  abstract getSize(): Promise<number>;
  abstract close(): Promise<void>;
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

  async close(): Promise<void> {
    // Your Redis cleanup implementation
  }
}

const queue = new Queue({ store: new RedisStore() });
```

**Built-in stores:**

- **MemoryStore**: Default in-memory storage (development/testing) with automatic TTL cleanup
- **IndexedDBStore**: Browser-only persistent storage with TTL support - messages survive browser restarts and include automatic cleanup of expired messages
- **WorkerStore**: Worker-based storage that delegates operations to a Web Worker/Worker Thread - prevents main thread blocking for better performance

### Features

- **🔄 Async Iterator Support**: Clean `for await...of` consumption pattern
- **🛑 Graceful Shutdown**: `close()` method and Disposable pattern support
- **💾 Pluggable Storage**: Abstract `Store` interface with in-memory and IndexedDB implementations
- **⚡ Keep-Alive Acknowledgments**: Prevents message timeout during long processing
- **⏱️ TTL Support**: Optional Time-to-Live for automatic message expiration and cleanup
- **🔀 Concurrent Workers**: Multiple consumers safely process different messages
- **🛡️ Message Recovery**: Automatic reclaim of failed/stalled messages after timeout
- **✋ Manual Acknowledgment**: Explicit `ack()` required for message deletion
- **📦 Zero Dependencies**: Pure TypeScript implementation
- **🔒 Type Safe**: Full TypeScript support with comprehensive type definitions
- **🔁 At-Least-Once Delivery**: Failed messages are automatically retried

### Use Cases

- **Background job processing**
- **Task queue coordination between workers**
- **Event-driven microservices communication**
- **Batch processing with failure recovery**
- **Real-time message distribution systems**

For complete API documentation and advanced usage examples, see [src/queue/README.md](src/queue/README.md).

## Workspace

A powerful and flexible API for executing shell commands in Node.js applications with workspace-centric command execution, environment management, and isolation. Built on top of `@jondotsoy/shell`, it provides managed environments for executing multiple related commands with consistent configuration, automatic timeout handling, and temporary workspace creation. For complete API documentation and advanced usage examples, see [src/workspace/README.md](src/workspace/README.md).

**Syntax:**

```ts
import { Workspace } from "@jondotsoy/utils-js/workspace";
// or for both workspace and direct shell access
import { shell, Workspace } from "@jondotsoy/utils-js/workspace";

// Basic command execution (direct shell)
const response = shell(command);
const response = shell(command, options);

// Workspace management
const workspace = new Workspace(options);
const response = workspace.run(command);
const response = workspace.run(command, options);
```

**Arguments:**

- `command` `<string>`: Command to execute
- `options` `<object>`: Optional configuration for shell commands
  - `stdin` `<ReadableStream>`: Input stream to pipe to the command
  - `env` `<Record<string, string>>`: Environment variables
  - `shell` `<string>`: Shell to use for execution
  - `cwd` `<string>`: Working directory
  - `signal` `<AbortSignal>`: Signal for cancellation/timeout
- `options` `<WorkspaceOptions>`: Configuration for workspace
  - `workingDirectory` `<string | URL>` **required**: Working directory for the workspace
  - `shell` `<string>`: Shell to use for command execution (default: '/bin/sh')
  - `env` `<Record<string, string>>`: Environment variables
  - `timeout` `<number>`: Timeout in milliseconds for all commands in workspace

**Examples:**

```ts
import { shell, Workspace } from "@jondotsoy/utils-js/workspace";

// Direct shell command execution
const response = shell('echo "Hello World"');
const output = await response.text();
console.log(output); // "Hello World"

// Command with timeout
const timedResponse = shell("long-running-command", {
  signal: AbortSignal.timeout(5000), // 5 seconds
});

// Create a workspace with default settings
const workspace = new Workspace({
  workingDirectory: "/path/to/project",
  shell: "/bin/bash",
  timeout: 30000, // 30 seconds default timeout for all commands
});

// Execute commands in the workspace context
const result1 = workspace.run("npm install");
const result2 = workspace.run("npm test");

// All commands inherit workspace configuration
const output = await result1.text();
const exitCode = await result1.exitCode;

// Temporary workspace
const tmpWorkspace = Workspace.mktmp();
const response = tmpWorkspace.run('echo "temp work" > file.txt');

// Workspace with environment variables
const devWorkspace = new Workspace({
  workingDirectory: "/project",
  env: { NODE_ENV: "development", CI: "true" },
});

const buildResult = devWorkspace.run("npm run build");
```

## Unit Conversion Family

A family of measurement utility classes that share a consistent API pattern:

```ts
ClassName.from({ unit1: value, unit2: value }).total("targetUnit")
ClassName.from(value, "unit").total("targetUnit")
ClassName.from("valueUnit").total("targetUnit")
```

Each class stores its value in a canonical base unit and converts on read via `.total(unit)`. All classes support string parsing, object input (combine multiple units), and a `{ unit }` object form for `.total()`.

| Class | Import | Base unit | Measures | Highlights |
|---|---|---|---|---|
| [`Weight`](#weight) | `@jondotsoy/utils-js/weight` | gram | Mass | Metric, Imperial, Troy, Gemology |
| [`Length`](#length) | `@jondotsoy/utils-js/length` | millimeter | Linear distance | Metric, Imperial, Nautical |
| [`Temperature`](#temperature) | `@jondotsoy/utils-js/temperature` | Kelvin | Temperature | Celsius, Fahrenheit, Rankine, Delisle, Newton, Réaumur, Rømer |
| [`Volume`](#volume) | `@jondotsoy/utils-js/volume` | milliliter | Volume | Metric, US customary, Imperial, Cubic |
| [`Circumference`](#circumference) | `@jondotsoy/utils-js/circumference` | millimeter | Circle circumference | Same units as Length plus `fromRadius()`, `fromDiameter()`, `.radius()`, `.diameter()` |

## Weight

A utility class for converting between weight units. Stores values internally in grams and converts on read via `.total(unit)`.

**Syntax:**

```ts
Weight.from({ kilograms: 12, grams: 345 }).total("oz")
Weight.from(1, "lb").total("grams")
Weight.from("2.5kg").total({ unit: "oz" })
```

**Supported units:**

| Category | Units | Short aliases |
|---|---|---|
| Metric | microgram, milligram, gram, kilogram, tonne | µg/mcg, mg, g, kg, t |
| Imperial | grain, dram, ounce, pound, stone, short-ton, long-ton | gr, dr, oz, lb/lbs, st, ton |
| Troy | troy-ounce, troy-pound | ozt, lbt |
| Gemology | carat | ct |

**Examples:**

```ts
import { Weight } from "@jondotsoy/utils-js/weight";

// Object form — combine multiple units
Weight.from({ kilograms: 12, grams: 345 }).total("oz"); // 435.58 oz

// Number + unit
Weight.from(1, "lb").total("grams"); // 453.59

// String parsing
Weight.from("2.5kg").total("oz"); // 88.18

// Object unit argument
Weight.from({ pounds: 10 }).total({ unit: "kg" }); // 4.54
```

## Length

A utility class for converting between length units. Stores values internally in millimeters and converts on read via `.total(unit)`.

**Syntax:**

```ts
Length.from({ meters: 1, centimeters: 50 }).total("in")
Length.from(6, "ft").total("mm")
Length.from("1.5km").total({ unit: "mi" })
```

**Supported units:**

| Category | Units | Short aliases |
|---|---|---|
| Metric | picometer, nanometer, micrometer, millimeter, centimeter, decimeter, meter, decameter, hectometer, kilometer | pm, nm, µm/um, mm, cm, dm, m, dam, hm, km |
| Imperial | thou, inch, foot, yard, mile | th/mil, in, ft/feet, yd, mi |
| Nautical | nautical-mile | nmi |

**Examples:**

```ts
import { Length } from "@jondotsoy/utils-js/length";

// Object form — combine multiple units
Length.from({ meters: 1, centimeters: 50 }).total("in"); // 59.06 in

// Number + unit
Length.from(6, "ft").total("mm"); // 1828.8 mm

// String parsing
Length.from("5km").total("mi"); // 3.11 mi

// Object unit argument
Length.from({ inches: 12 }).total({ unit: "ft" }); // 1 ft
```

## Temperature

A utility class for converting between temperature scales. Stores values internally in Kelvin and converts on read via `.total(unit)`.

> Unlike weight or length, temperature scales are not related by a simple ratio — they involve offsets. The object form accepts exactly one unit key.

**Syntax:**

```ts
Temperature.from({ celsius: 100 }).total("fahrenheit")
Temperature.from(32, "fahrenheit").total("celsius")
Temperature.from("100°C").total({ unit: "kelvin" })
```

**Supported scales:**

| Scale | Aliases |
|---|---|
| Kelvin | `kelvin`, `K`, `k` |
| Celsius | `celsius`, `centigrade`, `C`, `c`, `°C` |
| Fahrenheit | `fahrenheit`, `F`, `f`, `°F` |
| Rankine | `rankine`, `Ra`, `R`, `r`, `°R` |
| Delisle | `delisle`, `De`, `de`, `°De` |
| Newton | `newton`, `N`, `n`, `°N` |
| Réaumur | `reaumur`, `Re`, `re`, `°Re` |
| Rømer | `romer`, `Ro`, `ro`, `°Ro` |

**Examples:**

```ts
import { Temperature } from "@jondotsoy/utils-js/temperature";

// Object form
Temperature.from({ celsius: 100 }).total("fahrenheit"); // 212
Temperature.from({ fahrenheit: 32 }).total("celsius");  // 0

// Number + unit
Temperature.from(0, "celsius").total("kelvin");         // 273.15
Temperature.from(373.15, "kelvin").total("celsius");    // 100

// String parsing
Temperature.from("100°C").total("fahrenheit");          // 212
Temperature.from("32F").total("celsius");               // 0

// Object unit argument
Temperature.from(100, "celsius").total({ unit: "reaumur" }); // 80
```

## Volume

A utility class for converting between volume units. Stores values internally in milliliters and converts on read via `.total(unit)`.

**Syntax:**

```ts
Volume.from({ liters: 1, milliliters: 500 }).total("floz")
Volume.from(8, "floz").total("ml")
Volume.from("1.5l").total({ unit: "cup" })
```

**Supported units:**

| Category | Units | Short aliases |
|---|---|---|
| Metric | milliliter, centiliter, deciliter, liter, cubic-meter | ml, cl, dl, l, m³ |
| Cubic | cubic-centimeter, cubic-inch, cubic-foot | cc/cm³, in³, ft³ |
| US customary | us-teaspoon, us-tablespoon, us-fluid-ounce, us-cup, us-pint, us-quart, us-gallon | tsp, tbsp, floz, cup, pt, qt, gal |
| Imperial | imperial-fluid-ounce, imperial-pint, imperial-quart, imperial-gallon | imp-fl-oz, imp-pt, imp-qt, imp-gal |

**Examples:**

```ts
import { Volume } from "@jondotsoy/utils-js/volume";

// Object form — combine multiple units
Volume.from({ liters: 1, milliliters: 500 }).total("floz"); // 50.72 fl oz

// Number + unit
Volume.from(8, "floz").total("ml");    // 236.59 ml
Volume.from(1, "gal").total("l");      // 3.785 l
Volume.from(5, "cc").total("ml");      // 5 ml

// String parsing
Volume.from("250ml").total("cup");     // 1.057 cups
Volume.from("1 gal").total("l");       // 3.785 l

// Object unit argument
Volume.from({ cups: 2 }).total({ unit: "ml" }); // 473.18 ml
```

## Circumference

A utility class for working with circle circumferences. Shares all length units with [`Length`](#length) and adds geometric factory methods and reverse conversions. Stores values internally in millimeters.

**Syntax:**

```ts
Circumference.from({ meters: 1, centimeters: 50 }).total("mm")
Circumference.from(314, "mm").total("cm")
Circumference.fromRadius(5, "cm").total("mm")
Circumference.fromDiameter(10, "cm").radius("cm")
```

**Examples:**

```ts
import { Circumference } from "@jondotsoy/utils-js/circumference";

// From a known circumference
Circumference.from(314, "mm").total("cm");         // 31.4 cm

// From radius
Circumference.fromRadius(1, "m").total("mm");      // 6283.18 mm  (2π × 1000)

// From diameter
Circumference.fromDiameter(10, "cm").total("mm"); // 314.16 mm  (π × 100)

// Reverse — get radius or diameter from any circumference
const c = Circumference.fromRadius(7, "cm");
c.radius("cm");    // 7
c.diameter("cm");  // 14

// Object form + object unit argument
Circumference.from({ meters: 1 }).total({ unit: "cm" }); // 100
```

**Geometric methods:**

| Method | Description |
|---|---|
| `Circumference.fromRadius(value, unit)` | Creates a circumference from a circle's radius |
| `Circumference.fromDiameter(value, unit)` | Creates a circumference from a circle's diameter |
| `.radius(unit)` | Returns the radius implied by this circumference |
| `.diameter(unit)` | Returns the diameter implied by this circumference |

Supported units are identical to [`Length`](#length): full metric scale (pm → km), Imperial (thou, in, ft, yd, mi), and Nautical (nmi).

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details
