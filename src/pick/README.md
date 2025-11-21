# Pick

A utility for safely navigating and validating data structures with a chainable API.

## Installation

```typescript
import { pick } from "@jondotsoy/utils-js/pick";
```

## Description

`pick` provides a fluent API for safely accessing and validating object properties. It returns `undefined` when an operation fails, allowing elegant handling of cases where data doesn't meet expectations.

## API

### `pick(value)`

Creates a Pick instance with the provided value.

```typescript
const data = { name: "John", age: 30 };
const picker = pick(data);
```

### Methods

#### `.property(key)`

Accesses an object property. Returns `undefined` if the value is not an object or the property doesn't exist.

```typescript
const obj = { user: { name: "Alice" } };
const name = pick(obj).property("user")?.property("name")?.valueOf();
// name = "Alice"
```

#### `.isString()`

Validates that the value is a string. Returns `undefined` if it's not.

```typescript
pick("hello").isString()?.valueOf(); // "hello"
pick(123).isString(); // undefined
```

#### `.isNumber()`

Validates that the value is a number. Returns `undefined` if it's not.

```typescript
pick(123).isNumber()?.valueOf(); // 123
pick("123").isNumber(); // undefined
```

#### `.isInteger()`

Validates that the value is an integer. Returns `undefined` if it's not.

```typescript
pick(42).isInteger()?.valueOf(); // 42
pick(3.14).isInteger(); // undefined
```

#### `.isBigInt()`

Validates that the value is a bigint. Returns `undefined` if it's not.

```typescript
pick(123n).isBigInt()?.valueOf(); // 123n
pick(123).isBigInt(); // undefined
```

#### `.isBoolean()`

Validates that the value is a boolean. Returns `undefined` if it's not.

```typescript
pick(true).isBoolean()?.valueOf(); // true
pick(1).isBoolean(); // undefined
```

#### `.isArray()`

Validates that the value is an array. Returns `undefined` if it's not.

```typescript
pick([1, 2, 3]).isArray()?.valueOf(); // [1, 2, 3]
pick("not array").isArray(); // undefined
```

#### `.isRecord()`

Validates that the value is an object. Returns `undefined` if it's not.

```typescript
pick({ key: "value" }).isRecord()?.valueOf(); // { key: "value" }
pick(null).isRecord(); // undefined
```

#### `.isNative()`

Validates that the value is a native JavaScript type (string, number, boolean, array, or record). Returns `undefined` if it's not.

```typescript
pick("text").isNative()?.valueOf(); // "text"
pick(42).isNative()?.valueOf(); // 42
pick(null).isNative(); // undefined
```

#### `.isEnumOf(values)`

Validates that the value is one of the specified values in the array. Returns `undefined` if it's not.

```typescript
const status = pick("active").isEnumOf(["active", "inactive", "pending"]);
status?.valueOf(); // "active"

pick("unknown").isEnumOf(["active", "inactive"]); // undefined
```

#### `.pipe(transform)`

Applies a transformation function to the value.

```typescript
const result = pick(5)
  .pipe((n) => n * 2)
  .valueOf();
// result = 10

const upper = pick({ name: "john" })
  .property("name")
  ?.pipe((name) => name.toUpperCase())
  .valueOf();
// upper = "JOHN"
```

#### `.find(filter, thisArg?)`

Finds an element in an array that matches the predicate. Returns `undefined` if the value is not an array.

```typescript
const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 },
];

const user = pick(users)
  .find((u) => u.age > 25)
  ?.valueOf();
// user = { name: "Bob", age: 30 }
```

#### `.filter(filter, thisArg?)`

Filters array elements based on the predicate. Returns `undefined` if the value is not an array.

```typescript
const numbers = [1, 2, 3, 4, 5];
const filtered = pick(numbers)
  .filter((n) => n > 3)
  ?.valueOf();
// filtered = [4, 5]
```

#### `.every(validator)`

Validates that all elements in an array pass the validation function. Returns `undefined` if the value is not an array or any element fails validation.

```typescript
const strings = pick(["hello", "world"]).every((v) => v.isString());
strings?.valueOf(); // ["hello", "world"]

pick(["hello", 123]).every((v) => v.isString()); // undefined
```

#### `.oneOf(validators)`

Tries multiple validators and returns the result of the first one that succeeds. Returns `undefined` if all validators fail.

```typescript
const value = pick({ version: "1.0.0" })
  .property("version")
  ?.oneOf([(v) => v.isString(), (v) => v.isNumber()])
  ?.valueOf();
// value = "1.0.0"
```

#### `.valueOf()`

Returns the current value.

```typescript
const value = pick({ key: "value" }).valueOf();
// value = { key: "value" }
```

## Examples

### Safe navigation of nested objects

```typescript
const data = {
  user: {
    profile: {
      email: "user@example.com",
    },
  },
};

const email = pick(data)
  .property("user")
  ?.property("profile")
  ?.property("email")
  ?.valueOf();

console.log(email); // "user@example.com"
```

### Validation and transformation

```typescript
const config = {
  port: "3000",
  host: "localhost",
};

const port = pick(config)
  .property("port")
  ?.isString()
  ?.pipe((str) => parseInt(str, 10))
  .valueOf();

console.log(port); // 3000
```

### Array filtering

```typescript
const data = {
  users: [
    { name: "Alice", active: true },
    { name: "Bob", active: false },
    { name: "Charlie", active: true },
  ],
};

const activeUsers = pick(data)
  .property("users")
  ?.isArray()
  ?.filter((user: any) => user.active)
  ?.valueOf();

console.log(activeUsers);
// [{ name: "Alice", active: true }, { name: "Charlie", active: true }]
```

### Enum validation

```typescript
const response = { status: "success" };

const status = pick(response)
  .property("status")
  ?.isEnumOf(["success", "error", "pending"])
  ?.valueOf();

if (status) {
  console.log(`Status: ${status}`);
}
```

### Array validation with every

```typescript
const data = { tags: ["typescript", "javascript", "node"] };

const tags = pick(data)
  .property("tags")
  ?.every((v) => v.isString())
  ?.valueOf();

console.log(tags); // ["typescript", "javascript", "node"]
```

### Flexible type validation with oneOf

```typescript
const config = { timeout: 5000 };

const timeout = pick(config)
  .property("timeout")
  ?.oneOf([(v) => v.isString(), (v) => v.isNumber()])
  ?.valueOf();

console.log(timeout); // 5000
```

## Utilities

`pick.utils` exposes type validation functions that can be used independently:

```typescript
pick.utils.isString(value); // boolean
pick.utils.isNumber(value); // boolean
pick.utils.isBoolean(value); // boolean
pick.utils.isArray(value); // boolean
pick.utils.isRecord(value); // boolean
pick.utils.isSymbol(value); // boolean
pick.utils.hasOwnProperty(obj, key); // boolean
pick.utils.includes(array, value); // boolean
```

Example usage:

```typescript
if (pick.utils.isString(value)) {
  console.log(value.toUpperCase());
}

if (pick.utils.hasOwnProperty(obj, "name")) {
  console.log(obj.name);
}
```

## Features

- **Type safety**: Maintains type information in TypeScript
- **Fluent chaining**: Allows chaining multiple operations
- **Elegant error handling**: Returns `undefined` instead of throwing exceptions
- **Immutable**: Doesn't modify original values
- **Flexible**: Supports strings, numbers, arrays, objects, and symbols
