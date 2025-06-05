# get

Utility to safely extract deeply nested values from JavaScript/TypeScript objects with type validation.

## Description

The main function `get` allows you to access nested properties of an object using a sequence of keys. Additionally, the module exposes type extractors and validators to obtain already validated values (string, number, boolean, array, date, etc.) or convert them if possible.

## Type Extraction Methods

In addition to the main `get` method, this module provides specialized methods to extract and validate specific data types from nested objects. These methods (`get.string`, `get.number`, `get.boolean`, `get.array`, `get.date`, etc.) allow you to obtain already converted and validated values, making data handling safer and avoiding manual conversions or additional type checks. Each extractor tries to convert the value to the desired type when possible, returning `undefined` if the conversion or validation fails.

## Basic Usage

```typescript
import { get } from "@jondotsoy/utils-js/get";

const obj = { a: { b: { c: 42 } } };
const value = get(obj, "a", "b", "c"); // 42
const missing = get(obj, "a", "x"); // undefined
```

## Type Extractors

Type extractors are specialized methods that allow you to obtain and validate values of specific types from nested objects. Each extractor tries to convert the value to the desired type when possible and returns `undefined` if the conversion or validation fails. This makes data access safer and avoids manual type checks in user code.

Available extractors:

- `get.string(obj, ...paths)` → Returns a string if the value is or can be converted to string.
- `get.number(obj, ...paths)` → Returns a number if the value is or can be converted to number.
- `get.boolean(obj, ...paths)` → Returns a boolean if the value is boolean.
- `get.function(obj, ...paths)` → Returns a function if the value is function.
- `get.bigint(obj, ...paths)` → Returns a bigint if the value is or can be converted to bigint.
- `get.symbol(obj, ...paths)` → Returns a symbol if the value is symbol.
- `get.array(obj, ...paths)` → Returns an array if the value is an array.
- `get.date(obj, ...paths)` → Returns a Date object if the value is or can be converted to a date.
- `get.numberDate(obj, ...paths)` → Returns a timestamp (number) if the value is a number or a valid date.
- `get.isoStringDate(obj, ...paths)` → Returns a string in ISO format if the value is or can be converted to a date.
- `get.record(obj, ...paths)` / `get.object(obj, ...paths)` → Returns an object if the value is a non-null object.
- `get.is(test)(obj, ...paths)` → Allows you to define a custom extractor using a validation function.

These methods help you write more robust and safe code, especially when working with dynamic data or complex nested structures.

## Examples

### Get a string

```typescript
const obj = { user: { name: "Jon" } };
const name = get.string(obj, "user", "name"); // 'Jon'
```

### Get a number (with conversion)

```typescript
const obj = { value: "123" };
const num = get.number(obj, "value"); // 123
```

### Get a date

```typescript
const obj = { created: "2024-01-01T00:00:00Z" };
const date = get.date(obj, "created"); // Date instance
const iso = get.isoStringDate(obj, "created"); // '2024-01-01T00:00:00.000Z'
```

### Custom validation

```typescript
const isEven = (v: unknown): v is number =>
  typeof v === "number" && v % 2 === 0;
const getEven = get.is(isEven);
const obj = { n: 4 };
const even = getEven(obj, "n"); // 4
```

## API

### get(obj, ...paths)

Returns the nested value in the object following the sequence of keys. If any key does not exist, returns `undefined`.

### get.string / get.number / get.boolean / ...

Return the value validated and converted to the corresponding type, or `undefined` if it is not valid.

### get.parse(obj, parser)

Extracts a nested value from the object and validates or transforms it using a parser. The parser can be a Zod schema, a custom object with a `safeParse` method, or any compatible validator. If the value passes validation, the parsed/transformed value is returned; otherwise, `undefined` is returned.

- **Parameters:**
  - `obj`: The source object.
  - `parser`: A Zod schema, or any object with a `safeParse` method that returns `{ success: boolean, data?: any }`.
  - `...paths`: (optional) Sequence of keys to access the nested value (like in `get`).
- **Returns:** The parsed/transformed value if validation succeeds, or `undefined` if it fails.

#### Example: Using Zod

```typescript
import { get } from "@jondotsoy/utils-js/get";
import { z } from "zod";

const obj = { val: 32 };
const value = get.parse(
  obj,
  z.object({ val: z.number() }).transform((e) => e.val),
);
// value === 32
```

#### Example: Custom parser

```typescript
const customParser = {
  safeParse(v: any) {
    if (v && typeof v.foo === "number") {
      return { success: true as const, data: v.foo };
    }
    return { success: false as const, error: "Not a number" };
  },
};
const obj = { foo: 123 };
const result = get.parse(obj, customParser);
// result === 123
```

If the validation fails, `undefined` is returned:

```typescript
const obj = { val: "not-a-number" };
const value = get.parse(
  obj,
  z.object({ val: z.number() }).transform((e) => e.val),
);
// value === undefined
```

### get.is(test)

> ⚠️ **Deprecated**: This function is deprecated. It is recommended to use custom extractors directly with `get.parse` or equivalent functions.

Allows you to create a custom extractor using a validation function. Returns the validated value if the function returns `true`, or `undefined` otherwise.

```typescript
// Example usage (still supported for compatibility):
const isEven = (v: unknown): v is number =>
  typeof v === "number" && v % 2 === 0;
const getEven = get.is(isEven);
const obj = { n: 4 };
const even = getEven(obj, "n"); // 4
```

> **Note:** For new code, it is recommended to define custom extractors using `get.parse` or similar approaches instead of `get.is`.
