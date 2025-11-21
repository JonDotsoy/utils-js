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

#### `.string()`

Validates that the value is a string. Returns `undefined` if it's not.

```typescript
pick("hello").string()?.valueOf(); // "hello"
pick(123).string(); // undefined
```

#### `.number()`

Validates that the value is a number. Returns `undefined` if it's not.

```typescript
pick(123).number()?.valueOf(); // 123
pick("123").number(); // undefined
```

#### `.integer()`

Validates that the value is an integer. Returns `undefined` if it's not.

```typescript
pick(42).integer()?.valueOf(); // 42
pick(3.14).integer(); // undefined
```

#### `.bigInt()`

Validates that the value is a bigint. Returns `undefined` if it's not.

```typescript
pick(123n).bigInt()?.valueOf(); // 123n
pick(123).bigInt(); // undefined
```

#### `.boolean()`

Validates that the value is a boolean. Returns `undefined` if it's not.

```typescript
pick(true).boolean()?.valueOf(); // true
pick(1).boolean(); // undefined
```

#### `.symbol()`

Validates that the value is a symbol. Returns `undefined` if it's not.

```typescript
const sym = Symbol("test");
pick(sym).symbol()?.valueOf(); // Symbol(test)
pick("not a symbol").symbol(); // undefined
```

#### `.date()`

Validates that the value is a valid Date object. Does not convert numbers or strings to dates. Excludes invalid Date objects (NaN). Returns a `DatePick` instance that allows date range validations. Returns `undefined` if the value is not a valid Date.

```typescript
// Valid Date object
pick(new Date()).date()?.valueOf(); // Date object
pick(new Date("2024-01-01")).date()?.valueOf(); // Date object

// Invalid Date
pick(new Date("invalid")).date(); // undefined

// Non-Date values (not converted)
pick(Date.now()).date(); // undefined (number, not Date)
pick(1234567890000).date(); // undefined (number, not Date)
pick("2024-01-01").date(); // undefined (string, not Date)

// Date range validation
pick(new Date("2024-06-15"))
  .date()
  ?.after(new Date(2024, 0, 1))
  ?.before(new Date(2024, 11, 31))
  ?.valueOf();
// Date object: 2024-06-15
```

#### `.undefined()`

Validates that the value is `undefined`. Returns `undefined` if it's not.

```typescript
pick(undefined).undefined()?.valueOf(); // undefined
pick(null).undefined(); // undefined
pick(0).undefined(); // undefined
```

#### `.null()`

Validates that the value is `null`. Returns `undefined` if it's not.

```typescript
pick(null).null()?.valueOf(); // null
pick(undefined).null(); // undefined
pick(0).null(); // undefined
```

#### `.array()`

Validates that the value is an array. Returns `undefined` if it's not.

```typescript
pick([1, 2, 3]).array()?.valueOf(); // [1, 2, 3]
pick("not array").array(); // undefined
```

#### `.record()`

Validates that the value is an object. Returns `undefined` if it's not.

```typescript
pick({ key: "value" }).record()?.valueOf(); // { key: "value" }
pick(null).record(); // undefined
```

#### `.native()`

Validates that the value is a native JavaScript type (string, number, boolean, array, or record). Returns `undefined` if it's not.

```typescript
pick("text").native()?.valueOf(); // "text"
pick(42).native()?.valueOf(); // 42
pick(null).native(); // undefined
```

#### `.enum(values)`

Validates that the value is one of the specified values in the array. Returns `undefined` if it's not.

```typescript
const status = pick("active").enum(["active", "inactive", "pending"]);
status?.valueOf(); // "active"

pick("unknown").enum(["active", "inactive"]); // undefined
```

#### `.startsWith(prefix)`

Validates that the value is a string that starts with the specified prefix. Returns `undefined` if it's not a string or doesn't start with the prefix.

```typescript
pick("hello world").startsWith("hello")?.valueOf(); // "hello world"
pick("hello world").startsWith("world"); // undefined
pick(123).startsWith("1"); // undefined
```

#### `.endsWith(suffix)`

Validates that the value is a string that ends with the specified suffix. Returns `undefined` if it's not a string or doesn't end with the suffix.

```typescript
pick("hello world").endsWith("world")?.valueOf(); // "hello world"
pick("hello world").endsWith("hello"); // undefined
pick(123).endsWith("3"); // undefined
```

#### `.uppercase()`

Validates that the value is a string with all alphabetic characters in uppercase. Numbers and symbols are ignored. Returns `undefined` if it's not a string or contains lowercase characters.

```typescript
pick("HELLO").uppercase()?.valueOf(); // "HELLO"
pick("HELLO123").uppercase()?.valueOf(); // "HELLO123"
pick("Hello").uppercase(); // undefined
pick("hello").uppercase(); // undefined
```

#### `.lowercase()`

Validates that the value is a string with all alphabetic characters in lowercase. Numbers and symbols are ignored. Returns `undefined` if it's not a string or contains uppercase characters.

```typescript
pick("hello").lowercase()?.valueOf(); // "hello"
pick("hello123").lowercase()?.valueOf(); // "hello123"
pick("Hello").lowercase(); // undefined
pick("HELLO").lowercase(); // undefined
```

#### `.includes(search)`

Validates that the value contains the specified element. For strings, checks if it contains the substring. For arrays, checks if it contains the element. For records, checks if it has the property (key in object). Returns `undefined` if it doesn't contain the element.

```typescript
// String includes
pick("hello world").includes("world")?.valueOf(); // "hello world"
pick("hello").includes("bye"); // undefined

// Array includes
pick([1, 2, 3]).includes(2)?.valueOf(); // [1, 2, 3]
pick([1, 2, 3]).includes(5); // undefined

// Record includes (property check)
pick({ name: "John", age: 30 }).includes("name")?.valueOf();
// { name: "John", age: 30 }
pick({ name: "John" }).includes("email"); // undefined
```

#### `.length(length)`

Validates that the value (string or array) has the exact length specified. Returns `undefined` if it's not a string/array or doesn't have the exact length.

```typescript
pick("hello").length(5)?.valueOf(); // "hello"
pick([1, 2, 3]).length(3)?.valueOf(); // [1, 2, 3]
pick("hi").length(5); // undefined
```

#### `.min(minValue)`

Validates that the value meets the minimum requirement. For strings and arrays, validates the length. For numbers, validates the value. Returns `undefined` if it doesn't meet the condition.

```typescript
// Minimum length for strings
pick("hello").min(3)?.valueOf(); // "hello"
pick("hi").min(5); // undefined

// Minimum length for arrays
pick([1, 2, 3]).min(2)?.valueOf(); // [1, 2, 3]
pick([1]).min(5); // undefined

// Minimum value for numbers
pick(10).min(5)?.valueOf(); // 10
pick(3).min(5); // undefined
```

#### `.max(maxValue)`

Validates that the value meets the maximum requirement. For strings and arrays, validates the length. For numbers, validates the value. Returns `undefined` if it doesn't meet the condition.

```typescript
// Maximum length for strings
pick("hello").max(10)?.valueOf(); // "hello"
pick("hello world").max(5); // undefined

// Maximum length for arrays
pick([1, 2, 3]).max(5)?.valueOf(); // [1, 2, 3]
pick([1, 2, 3, 4, 5, 6]).max(5); // undefined

// Maximum value for numbers
pick(5).max(10)?.valueOf(); // 5
pick(15).max(10); // undefined
```

#### `.regexp(pattern, flags?)`

Validates that the value is a string that matches the specified regular expression. Returns `undefined` if it's not a string or doesn't match.

```typescript
// Using RegExp object
pick("hello123").regexp(/^[a-z]+\d+$/)?.valueOf(); // "hello123"
pick("hello").regexp(/^\d+$/); // undefined

// Using string pattern with flags
pick("HELLO").regexp("^hello$", "i")?.valueOf(); // "HELLO"

// Email validation
pick("user@example.com").regexp(/^[\w.-]+@[\w.-]+\.\w+$/)?.valueOf();
// "user@example.com"
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
  ?.oneOf([(v) => v.string(), (v) => v.number()])
  ?.valueOf();
// value = "1.0.0"
```

#### `.gt(other)`

Validates that the value is greater than the specified value. Returns `undefined` if it's not.

```typescript
pick(10).gt(5)?.valueOf(); // 10
pick(3).gt(5); // undefined
```

#### `.gte(other)`

Validates that the value is greater than or equal to the specified value. Returns `undefined` if it's not.

```typescript
pick(10).gte(10)?.valueOf(); // 10
pick(10).gte(5)?.valueOf(); // 10
pick(3).gte(5); // undefined
```

#### `.lt(other)`

Validates that the value is less than the specified value. Returns `undefined` if it's not.

```typescript
pick(3).lt(5)?.valueOf(); // 3
pick(10).lt(5); // undefined
```

#### `.lte(other)`

Validates that the value is less than or equal to the specified value. Returns `undefined` if it's not.

```typescript
pick(5).lte(5)?.valueOf(); // 5
pick(3).lte(5)?.valueOf(); // 3
pick(10).lte(5); // undefined
```

#### `.eq(other)`

Validates that the value is strictly equal to the specified value. Returns `undefined` if it's not.

```typescript
pick(5).eq(5)?.valueOf(); // 5
pick("hello").eq("hello")?.valueOf(); // "hello"
pick(5).eq(10); // undefined
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
  ?.string()
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
  ?.array()
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
  ?.enum(["success", "error", "pending"])
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
  ?.every((v) => v.string())
  ?.valueOf();

console.log(tags); // ["typescript", "javascript", "node"]
```

### Flexible type validation with oneOf

```typescript
const config = { timeout: 5000 };

const timeout = pick(config)
  .property("timeout")
  ?.oneOf([(v) => v.string(), (v) => v.number()])
  ?.valueOf();

console.log(timeout); // 5000
```

### Comparison validations

```typescript
const data = { age: 25, score: 85 };

// Validate age is at least 18
const age = pick(data).property("age")?.number()?.gte(18)?.valueOf();
console.log(age); // 25

// Validate score is less than 100
const score = pick(data).property("score")?.number()?.lt(100)?.valueOf();
console.log(score); // 85

// Check exact value
const exactAge = pick(data).property("age")?.eq(25)?.valueOf();
console.log(exactAge); // 25

// Chain comparisons with other validations
const validAge = pick(data)
  .property("age")
  ?.number()
  ?.gte(18)
  ?.lte(65)
  ?.valueOf();
console.log(validAge); // 25
```

### Regular expression validation

```typescript
const data = {
  email: "user@example.com",
  phone: "+1-555-0123",
  code: "ABC123",
};

// Validate email format
const email = pick(data)
  .property("email")
  ?.string()
  ?.regexp(/^[\w.-]+@[\w.-]+\.\w+$/)
  ?.valueOf();
console.log(email); // "user@example.com"

// Validate phone format
const phone = pick(data)
  .property("phone")
  ?.string()
  ?.regexp(/^\+\d{1}-\d{3}-\d{4}$/)
  ?.valueOf();
console.log(phone); // "+1-555-0123"

// Case-insensitive validation
const code = pick(data)
  .property("code")
  ?.string()
  ?.regexp("^[a-z]{3}\\d{3}$", "i")
  ?.valueOf();
console.log(code); // "ABC123"
```

### Date validation

```typescript
const data = {
  createdAt: new Date("2024-01-01"),
  timestamp: 1704067200000,
  dateString: "2024-12-25",
  invalidDate: new Date("invalid"),
};

// Validate Date object
const createdAt = pick(data)
  .property("createdAt")
  ?.date()
  ?.valueOf();
console.log(createdAt); // Date object: 2024-01-01

// Timestamps are not converted (returns undefined)
const fromTimestamp = pick(data)
  .property("timestamp")
  ?.date()
  ?.valueOf();
console.log(fromTimestamp); // undefined (number, not Date)

// Strings are not converted (returns undefined)
const fromString = pick(data)
  .property("dateString")
  ?.date()
  ?.valueOf();
console.log(fromString); // undefined (string, not Date)

// Invalid Date returns undefined
const invalid = pick(data)
  .property("invalidDate")
  ?.date()
  ?.valueOf();
console.log(invalid); // undefined

// Validate date range with after/before
const validDate = pick(data)
  .property("createdAt")
  ?.date()
  ?.after(new Date(2020, 0, 1))
  ?.before(new Date(2025, 11, 31))
  ?.valueOf();
console.log(validDate); // Date object if within range

// Validate date is in the past
const pastDate = pick(data)
  .property("createdAt")
  ?.date()
  ?.before(new Date())
  ?.valueOf();
console.log(pastDate); // Date object if not in the future

// Validate date range with between
const inRange = pick(data)
  .property("createdAt")
  ?.date()
  ?.between(new Date(2024, 0, 1), new Date(2024, 11, 31))
  ?.valueOf();
console.log(inRange); // Date object if in 2024
```

### Case validation

```typescript
const data = {
  code: "ABC123",
  name: "john",
  title: "Hello World",
};

// Validate uppercase
const code = pick(data)
  .property("code")
  ?.string()
  ?.uppercase()
  ?.valueOf();
console.log(code); // "ABC123"

// Validate lowercase
const name = pick(data)
  .property("name")
  ?.string()
  ?.lowercase()
  ?.valueOf();
console.log(name); // "john"

// Mixed case fails both validations
const title = pick(data).property("title")?.string()?.uppercase()?.valueOf();
console.log(title); // undefined

const titleLower = pick(data)
  .property("title")
  ?.string()
  ?.lowercase()
  ?.valueOf();
console.log(titleLower); // undefined
```

### Null and undefined validation

```typescript
const data = {
  name: "John",
  age: null,
  address: undefined,
  id: Symbol("user-id"),
};

// Validate null values
const age = pick(data).property("age")?.null()?.valueOf();
console.log(age); // null

// Validate undefined values
const address = pick(data).property("address")?.undefined()?.valueOf();
console.log(address); // undefined

// Validate symbol values
const id = pick(data).property("id")?.symbol()?.valueOf();
console.log(id); // Symbol(user-id)

// Use with oneOf for optional values
const optionalValue = pick(data)
  .property("age")
  ?.oneOf([(v) => v.number(), (v) => v.null()])
  ?.valueOf();
console.log(optionalValue); // null
```

### String and array length validation

```typescript
const data = {
  username: "john_doe",
  password: "secret123",
  tags: ["javascript", "typescript"],
  items: [1, 2, 3, 4, 5],
  age: 25,
};

// Validate exact length
const tags = pick(data)
  .property("tags")
  ?.array()
  ?.length(2)
  ?.valueOf();
console.log(tags); // ["javascript", "typescript"]

// Validate minimum length
const password = pick(data)
  .property("password")
  ?.string()
  ?.min(8)
  ?.valueOf();
console.log(password); // "secret123"

// Validate maximum length
const username = pick(data)
  .property("username")
  ?.string()
  ?.max(20)
  ?.valueOf();
console.log(username); // "john_doe"

// Validate length range (chain min and max)
const items = pick(data)
  .property("items")
  ?.array()
  ?.min(3)
  ?.max(10)
  ?.valueOf();
console.log(items); // [1, 2, 3, 4, 5]

// Validate string starts with prefix
const validUsername = pick(data)
  .property("username")
  ?.string()
  ?.startsWith("john")
  ?.valueOf();
console.log(validUsername); // "john_doe"

// Validate string ends with suffix
const validUsernameEnd = pick(data)
  .property("username")
  ?.string()
  ?.endsWith("_doe")
  ?.valueOf();
console.log(validUsernameEnd); // "john_doe"

// Validate string includes substring
const hasSecret = pick(data)
  .property("password")
  ?.string()
  ?.includes("secret")
  ?.valueOf();
console.log(hasSecret); // "secret123"

// Validate lowercase string
const lowerUsername = pick(data)
  .property("username")
  ?.string()
  ?.lowercase()
  ?.valueOf();
console.log(lowerUsername); // "john_doe"

// Validate array includes element
const hasTypeScript = pick(data)
  .property("tags")
  ?.array()
  ?.includes("typescript")
  ?.valueOf();
console.log(hasTypeScript); // ["javascript", "typescript"]

// Validate object has property
const hasAge = pick(data)
  .record()
  ?.includes("age")
  ?.valueOf();
console.log(hasAge); // { username: "john_doe", password: "secret123", ... }

// Validate number range
const age = pick(data)
  .property("age")
  ?.number()
  ?.min(18)
  ?.max(65)
  ?.valueOf();
console.log(age); // 25
```

## DatePick

`DatePick` is a specialized class that extends `Pick<Date>` with date-specific validation methods. It's automatically returned by the `.date()` method.

### DatePick Methods

#### `.after(minDate)`

Validates that the date is greater than or equal to the minimum date specified. Accepts Date objects, timestamps (numbers), or date strings.

```typescript
pick(new Date("2024-06-15"))
  .date()
  ?.after(new Date("2024-01-01"))
  ?.valueOf();
// Date object: 2024-06-15

pick(new Date("2023-12-31"))
  .date()
  ?.after(new Date("2024-01-01"));
// undefined

// Using timestamps
pick(Date.now())
  .date()
  ?.after(Date.now() - 86400000)
  ?.valueOf();
// Date object if within last 24 hours
```

#### `.before(maxDate)`

Validates that the date is less than or equal to the maximum date specified. Accepts Date objects, timestamps (numbers), or date strings.

```typescript
pick(new Date("2024-06-15"))
  .date()
  ?.before(new Date("2024-12-31"))
  ?.valueOf();
// Date object: 2024-06-15

pick(new Date("2025-01-01"))
  .date()
  ?.before(new Date("2024-12-31"));
// undefined

// Using timestamps
pick(Date.now())
  .date()
  ?.before(Date.now())
  ?.valueOf();
// Date object if not in the future
```

#### `.between(minDate, maxDate)`

Validates that the date is within the specified range (inclusive). Accepts Date objects, timestamps (numbers), or date strings.

```typescript
pick(new Date("2024-06-15"))
  .date()
  ?.between(new Date("2024-01-01"), new Date("2024-12-31"))
  ?.valueOf();
// Date object: 2024-06-15

pick(new Date("2025-01-01"))
  .date()
  ?.between(new Date("2024-01-01"), new Date("2024-12-31"));
// undefined
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
