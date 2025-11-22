# Pick

A utility for safely navigating and validating data structures with a chainable API.

## Installation

```typescript
import { pick } from "@jondotsoy/utils-js/pick";
```

## Description

`pick` provides a fluent API for safely accessing and validating object properties. It returns `undefined` when an operation fails, allowing elegant handling of cases where data doesn't meet expectations.

## Specialized Classes

The `pick` utility returns different specialized classes depending on the validation method used:

- **`Pick<T>`** - Base class for all types
- **`StringPick`** - For string values (returned by `.string()`)
- **`NumberPick`** - For number values (returned by `.number()`)
- **`IntegerPick`** - For integer values (returned by `.integer()`)
- **`BigIntPick`** - For bigint values (returned by `.bigInt()`)
- **`BooleanPick`** - For boolean values (returned by `.boolean()`)
- **`ArrayPick<T>`** - For array values (returned by `.array()`)
- **`RecordPick`** - For object values (returned by `.record()`)
- **`DatePick<T>`** - For date values (returned by `.date()`)
- **`URLPick<T>`** - For URL values (returned by `.url()`)

Each specialized class provides type-specific validation methods while maintaining the ability to chain operations.

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

Validates that the value is a string. Returns a `StringPick` instance if valid, or `undefined` if it's not.

```typescript
pick("hello").string()?.valueOf(); // "hello"
pick(123).string(); // undefined
```

**Deprecated alias:** `.isString()` - Use `.string()` instead

#### `.number()`

Validates that the value is a number. Returns a `NumberPick` instance if valid, or `undefined` if it's not.

```typescript
pick(123).number()?.valueOf(); // 123
pick("123").number(); // undefined
```

**Deprecated alias:** `.isNumber()` - Use `.number()` instead

#### `.integer()`

Validates that the value is an integer. Returns an `IntegerPick` instance if valid, or `undefined` if it's not.

```typescript
pick(42).integer()?.valueOf(); // 42
pick(3.14).integer(); // undefined
```

**Deprecated alias:** `.isInteger()` - Use `.integer()` instead

#### `.bigInt()`

Validates that the value is a bigint. Returns a `BigIntPick` instance if valid, or `undefined` if it's not.

```typescript
pick(123n).bigInt()?.valueOf(); // 123n
pick(123).bigInt(); // undefined
```

**Deprecated alias:** `.isBigInt()` - Use `.bigInt()` instead

#### `.boolean()`

Validates that the value is a boolean. Returns a `BooleanPick` instance if valid, or `undefined` if it's not.

```typescript
pick(true).boolean()?.valueOf(); // true
pick(1).boolean(); // undefined
```

**Deprecated alias:** `.isBoolean()` - Use `.boolean()` instead

#### `.symbol()`

Validates that the value is a symbol. Returns `undefined` if it's not.

```typescript
const sym = Symbol("test");
pick(sym).symbol()?.valueOf(); // Symbol(test)
pick("not a symbol").symbol(); // undefined
```

#### `.email()`

Validates that the value is a valid email address. This is an alias for `this.string()?.email()`. Returns `undefined` if it's not a valid email.

```typescript
pick("user@example.com").email()?.valueOf(); // "user@example.com"
pick("invalid-email").email(); // undefined
pick(123).email(); // undefined
```

#### `.instanceOf(constructor)`

Validates that the value is an instance of the specified class or constructor. Returns `undefined` if it's not an instance.

```typescript
// Built-in classes
pick(new Date()).instanceOf(Date)?.valueOf(); // Date object
pick(new Error("test")).instanceOf(Error)?.valueOf(); // Error object
pick([1, 2, 3]).instanceOf(Array)?.valueOf(); // [1, 2, 3]
pick(new Map()).instanceOf(Map)?.valueOf(); // Map object
pick("hello").instanceOf(Date); // undefined

// Custom classes
class User {
  constructor(public name: string) {}
}
const user = new User("John");
pick(user).instanceOf(User)?.valueOf(); // User instance
pick({ name: "John" }).instanceOf(User); // undefined (plain object, not User instance)
```

#### `.error()`

Validates that the value is an Error instance. This is an alias for `this.instanceOf(Error)`. Returns `undefined` if it's not an Error.

```typescript
// Standard Error
pick(new Error("test")).error()?.valueOf(); // Error object
pick(new TypeError("test")).error()?.valueOf(); // TypeError object
pick(new RangeError("test")).error()?.valueOf(); // RangeError object

// Custom Error subclasses
class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomError";
  }
}
pick(new CustomError("test")).error()?.valueOf(); // CustomError object

// Invalid values
pick("error").error(); // undefined
pick({ message: "error" }).error(); // undefined
pick(123).error(); // undefined

// Chain with other operations
pick(new Error("test"))
  .error()
  ?.pipe((err) => err.message)
  .valueOf(); // "test"
```

#### `.date()`

Validates that the value is a valid date. Accepts Date objects, timestamps (numbers), or date strings. Returns a `DatePick` instance that allows date range validations. Returns `undefined` if the value cannot be converted to a valid date.

```typescript
// Valid Date object
pick(new Date()).date()?.valueOf(); // Date object
pick(new Date("2024-01-01")).date()?.valueOf(); // Date object

// Valid timestamp (number)
pick(Date.now()).date()?.valueOf(); // timestamp number
pick(1234567890000).date()?.valueOf(); // 1234567890000

// Valid date string
pick("2024-01-01").date()?.valueOf(); // "2024-01-01"

// Invalid dates
pick(new Date("invalid")).date(); // undefined
pick("not a date").date(); // undefined
pick(NaN).date(); // undefined

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

Validates that the value is an array. Returns an `ArrayPick` instance if valid, or `undefined` if it's not.

```typescript
pick([1, 2, 3]).array()?.valueOf(); // [1, 2, 3]
pick("not array").array(); // undefined
```

**Deprecated alias:** `.isArray()` - Use `.array()` instead

#### `.record()`

Validates that the value is an object (Record). Returns a `RecordPick` instance if valid, or `undefined` if it's not.

```typescript
pick({ key: "value" }).record()?.valueOf(); // { key: "value" }
pick(null).record(); // undefined
```

**Deprecated alias:** `.isRecord()` - Use `.record()` instead

#### `.native()`

Validates that the value is a native JavaScript type (string, number, boolean, array, or record). Returns a `Pick` instance with the appropriate type if valid, or `undefined` if it's not.

```typescript
pick("text").native()?.valueOf(); // "text"
pick(42).native()?.valueOf(); // 42
pick(null).native(); // undefined
```

**Deprecated alias:** `.isNative()` - Use `.native()` instead

#### `.enum(values)`

Validates that the value is a string that belongs to a specific set of values (enum). Returns a `Pick` instance with the enum type if valid, or `undefined` if it's not.

```typescript
const status = pick("active").enum(["active", "inactive", "pending"]);
status?.valueOf(); // "active"

pick("unknown").enum(["active", "inactive"]); // undefined
```

**Deprecated alias:** `.isEnumOf(values)` - Use `.enum(values)` instead

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

#### `.first()`

Gets the first element of an array. Returns a new Pick instance with the first element, or `undefined` if the array is empty.

```typescript
pick([1, 2, 3]).array()?.first()?.valueOf(); // 1
pick(["a", "b", "c"]).array()?.first()?.valueOf(); // "a"
pick([]).array()?.first(); // undefined

// Chain with other validations
pick([1, 2, 3]).array()?.first()?.number()?.gt(0)?.valueOf(); // 1
```

#### `.last()`

Gets the last element of an array. Returns a new Pick instance with the last element, or `undefined` if the array is empty.

```typescript
pick([1, 2, 3]).array()?.last()?.valueOf(); // 3
pick(["a", "b", "c"]).array()?.last()?.valueOf(); // "c"
pick([]).array()?.last(); // undefined

// Chain with other validations
pick([1, 2, 3]).array()?.last()?.number()?.lte(10)?.valueOf(); // 3
```

#### `.at(index)`

Gets an element at a specific index. Supports negative indices (counting from the end). Returns a new Pick instance with the element, or `undefined` if the index doesn't exist.

```typescript
pick([1, 2, 3]).array()?.at(0)?.valueOf(); // 1
pick([1, 2, 3]).array()?.at(1)?.valueOf(); // 2
pick([1, 2, 3]).array()?.at(-1)?.valueOf(); // 3 (last element)
pick([1, 2, 3]).array()?.at(-2)?.valueOf(); // 2 (second to last)
pick([1, 2, 3]).array()?.at(10); // undefined

// Chain with other validations
pick(["a", "b", "c"]).array()?.at(1)?.string()?.valueOf(); // "b"
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
pick("hello123")
  .regexp(/^[a-z]+\d+$/)
  ?.valueOf(); // "hello123"
pick("hello").regexp(/^\d+$/); // undefined

// Using string pattern with flags
pick("HELLO").regexp("^hello$", "i")?.valueOf(); // "HELLO"

// Email validation
pick("user@example.com")
  .regexp(/^[\w.-]+@[\w.-]+\.\w+$/)
  ?.valueOf();
// "user@example.com"
```

#### `.matches(pattern)`

Validates that the string matches a regular expression. This is an alias for `.regexp()` but only accepts RegExp or string patterns (without separate flags parameter).

```typescript
// Using RegExp object
pick("hello123")
  .string()
  ?.matches(/^[a-z]+\d+$/)
  ?.valueOf(); // "hello123"

// Using string pattern
pick("test").string()?.matches("^test$")?.valueOf(); // "test"

pick("hello").string()?.matches(/^\d+$/); // undefined
```

#### `.notEmpty()`

Validates that the string is not empty. Returns `undefined` if the string has length 0.

```typescript
pick("hello").string()?.notEmpty()?.valueOf(); // "hello"
pick("").string()?.notEmpty(); // undefined
pick(" ").string()?.notEmpty()?.valueOf(); // " " (whitespace is not empty)
```

#### `.toUpperCase()`

Transforms the string to uppercase. Returns a new StringPick instance with the transformed value.

```typescript
pick("hello").string()?.toUpperCase().valueOf(); // "HELLO"
pick("Hello World").string()?.toUpperCase().valueOf(); // "HELLO WORLD"

// Chain with other validations
pick("hello").string()?.toUpperCase().startsWith("HE")?.valueOf(); // "HELLO"
```

#### `.toLowerCase()`

Transforms the string to lowercase. Returns a new StringPick instance with the transformed value.

```typescript
pick("HELLO").string()?.toLowerCase().valueOf(); // "hello"
pick("Hello World").string()?.toLowerCase().valueOf(); // "hello world"

// Chain with other validations
pick("HELLO").string()?.toLowerCase().startsWith("he")?.valueOf(); // "hello"
```

#### `.trim()`

Removes whitespace from the beginning and end of the string. Returns a new StringPick instance with the trimmed value.

```typescript
pick("  hello  ").string()?.trim().valueOf(); // "hello"
pick("\n\tworld\t\n").string()?.trim().valueOf(); // "world"

// Chain with other validations
pick("  test  ").string()?.trim().length(4)?.valueOf(); // "test"
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

#### `.filter(filter, thisArg?)` ⚠️ DEPRECATED

> **Deprecated**: This method is deprecated because the name can be confusing. Although it doesn't mutate the original value, the name suggests a mutation operation. Use `.pipe()` with native `filter()` instead.

Filters array elements based on the predicate. Returns `undefined` if the value is not an array.

```typescript
// ❌ Deprecated:
const filtered = pick([1, 2, 3, 4, 5])
  .filter((n) => n > 3)
  ?.valueOf();
// filtered = [4, 5]

// ✅ Recommended:
const filtered = pick([1, 2, 3, 4, 5])
  .pipe((arr) => arr.filter((n) => n > 3))
  .valueOf();
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

#### `.positive()`

Validates that the number is positive (greater than 0). Available for `NumberPick`, `IntegerPick`, and `BigIntPick`. Returns `undefined` if not positive.

```typescript
// NumberPick
pick(5).number()?.positive()?.valueOf(); // 5
pick(0).number()?.positive(); // undefined
pick(-5).number()?.positive(); // undefined

// IntegerPick
pick(10).integer()?.positive()?.valueOf(); // 10

// BigIntPick
pick(100n).bigInt()?.positive()?.valueOf(); // 100n
```

#### `.negative()`

Validates that the number is negative (less than 0). Available for `NumberPick`, `IntegerPick`, and `BigIntPick`. Returns `undefined` if not negative.

```typescript
// NumberPick
pick(-5).number()?.negative()?.valueOf(); // -5
pick(0).number()?.negative(); // undefined
pick(5).number()?.negative(); // undefined

// IntegerPick
pick(-10).integer()?.negative()?.valueOf(); // -10

// BigIntPick
pick(-100n).bigInt()?.negative()?.valueOf(); // -100n
```

#### `.between(min, max)`

Validates that the number is within a range (inclusive). Available for `NumberPick`, `IntegerPick`, and `BigIntPick`. Returns `undefined` if not in range.

```typescript
// NumberPick
pick(5).number()?.between(1, 10)?.valueOf(); // 5
pick(0).number()?.between(1, 10); // undefined
pick(15).number()?.between(1, 10); // undefined

// IntegerPick
pick(7).integer()?.between(5, 10)?.valueOf(); // 7

// BigIntPick
pick(50n).bigInt()?.between(1n, 100n)?.valueOf(); // 50n
```

#### `.finite()`

Validates that the number is finite (not Infinity or -Infinity). Only available for `NumberPick`. Returns `undefined` if not finite.

```typescript
pick(42).number()?.finite()?.valueOf(); // 42
pick(Infinity).number()?.finite(); // undefined
pick(-Infinity).number()?.finite(); // undefined
pick(NaN).number()?.finite(); // undefined
```

#### `.multipleOf(divisor)` / `.divisibleBy(divisor)`

Validates that the number is divisible by the specified divisor. Both methods are equivalent - `divisibleBy` is an alias for `multipleOf` with more intuitive naming. Available for `NumberPick`, `IntegerPick`, and `BigIntPick`. Returns `undefined` if not divisible or divisor is 0.

```typescript
// NumberPick
pick(10).number()?.multipleOf(5)?.valueOf(); // 10
pick(10).number()?.divisibleBy(2)?.valueOf(); // 10
pick(7).number()?.divisibleBy(3); // undefined

// IntegerPick
pick(12).integer()?.divisibleBy(3)?.valueOf(); // 12
pick(12).integer()?.divisibleBy(5); // undefined

// BigIntPick
pick(100n).bigInt()?.divisibleBy(10n)?.valueOf(); // 100n
pick(100n).bigInt()?.multipleOf(7n); // undefined
```

#### `.even()`

Validates that the number is even. Available for `NumberPick`, `IntegerPick`, and `BigIntPick`. For `NumberPick`, also validates that the number is an integer. Returns `undefined` if not even.

```typescript
// NumberPick
pick(4).number()?.even()?.valueOf(); // 4
pick(5).number()?.even(); // undefined
pick(4.5).number()?.even(); // undefined (not an integer)

// IntegerPick
pick(10).integer()?.even()?.valueOf(); // 10
pick(7).integer()?.even(); // undefined

// BigIntPick
pick(100n).bigInt()?.even()?.valueOf(); // 100n
pick(99n).bigInt()?.even(); // undefined
```

#### `.odd()`

Validates that the number is odd. Available for `NumberPick`, `IntegerPick`, and `BigIntPick`. For `NumberPick`, also validates that the number is an integer. Returns `undefined` if not odd.

```typescript
// NumberPick
pick(5).number()?.odd()?.valueOf(); // 5
pick(4).number()?.odd(); // undefined
pick(5.5).number()?.odd(); // undefined (not an integer)

// IntegerPick
pick(7).integer()?.odd()?.valueOf(); // 7
pick(10).integer()?.odd(); // undefined

// BigIntPick
pick(99n).bigInt()?.odd()?.valueOf(); // 99n
pick(100n).bigInt()?.odd(); // undefined
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

### Email validation

```typescript
const user = {
  email: "user@example.com",
  name: "John Doe",
};

// Direct email validation
const email = pick(user).property("email")?.email()?.valueOf();
console.log(email); // "user@example.com"

// Email validation with transformation
const normalizedEmail = pick(user)
  .property("email")
  ?.email()
  ?.pipe((email) => email.toLowerCase())
  .valueOf();
console.log(normalizedEmail); // "user@example.com"

// Invalid email returns undefined
const invalidEmail = pick({ email: "not-an-email" })
  .property("email")
  ?.email()
  ?.valueOf();
console.log(invalidEmail); // undefined
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
  ?.pipe((users) => users.filter((user: any) => user.active))
  .valueOf();

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

### Instance validation with instanceOf

```typescript
// Validate built-in types
const data = {
  createdAt: new Date("2024-01-01"),
  error: new Error("Something went wrong"),
  tags: ["javascript", "typescript"],
  metadata: new Map([["key", "value"]]),
};

// Validate Date instance
const date = pick(data).property("createdAt")?.instanceOf(Date)?.valueOf();
console.log(date); // Date object

// Validate Error instance
const error = pick(data).property("error")?.instanceOf(Error)?.valueOf();
console.log(error); // Error object

// Validate Array instance
const tags = pick(data).property("tags")?.instanceOf(Array)?.valueOf();
console.log(tags); // ["javascript", "typescript"]

// Validate Map instance
const metadata = pick(data).property("metadata")?.instanceOf(Map)?.valueOf();
console.log(metadata); // Map object

// Custom class validation
class User {
  constructor(
    public name: string,
    public email: string,
  ) {}
}

class Admin extends User {
  constructor(
    name: string,
    email: string,
    public permissions: string[],
  ) {}
}

const users = {
  user1: new User("John", "john@example.com"),
  user2: new Admin("Alice", "alice@example.com", ["read", "write"]),
  user3: { name: "Bob", email: "bob@example.com" }, // Plain object
};

// Validate User instance
const user1 = pick(users).property("user1")?.instanceOf(User)?.valueOf();
console.log(user1); // User instance

// Admin is also an instance of User (inheritance)
const user2 = pick(users).property("user2")?.instanceOf(User)?.valueOf();
console.log(user2); // Admin instance (extends User)

// Plain object is not a User instance
const user3 = pick(users).property("user3")?.instanceOf(User)?.valueOf();
console.log(user3); // undefined

// Validate specific Admin instance
const admin = pick(users).property("user2")?.instanceOf(Admin)?.valueOf();
console.log(admin); // Admin instance

// Chain with other validations
const validDate = pick(data)
  .property("createdAt")
  ?.instanceOf(Date)
  ?.pipe((date) => date.getFullYear())
  .valueOf();
console.log(validDate); // 2024
```

### Error validation

```typescript
const data = {
  error: new Error("Something went wrong"),
  typeError: new TypeError("Invalid type"),
  customError: new RangeError("Out of range"),
  notAnError: { message: "This is not an error" },
};

// Validate Error instance using .error() method
const error = pick(data).property("error")?.error()?.valueOf();
console.log(error); // Error object

// Works with Error subclasses
const typeError = pick(data).property("typeError")?.error()?.valueOf();
console.log(typeError); // TypeError object

const rangeError = pick(data).property("customError")?.error()?.valueOf();
console.log(rangeError); // RangeError object

// Returns undefined for non-Error values
const notAnError = pick(data).property("notAnError")?.error()?.valueOf();
console.log(notAnError); // undefined

// Custom Error subclasses
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

const validationError = new ValidationError("Invalid email", "email");
const validated = pick(validationError).error()?.valueOf();
console.log(validated); // ValidationError object

// Chain with other operations
const errorMessage = pick(data)
  .property("error")
  ?.error()
  ?.pipe((err) => err.message)
  .valueOf();
console.log(errorMessage); // "Something went wrong"

// Use in error handling
function processResult(result: unknown) {
  const error = pick(result).error();
  if (error) {
    console.error("Error occurred:", error.valueOf().message);
    return null;
  }
  return result;
}
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

### Boolean validations

```typescript
const data = {
  isActive: true,
  isDeleted: false,
  hasPermission: true,
};

// Validate true value
const isActive = pick(data).property("isActive")?.boolean()?.true()?.valueOf();
console.log(isActive); // true

const isDeleted = pick(data)
  .property("isDeleted")
  ?.boolean()
  ?.true()
  ?.valueOf();
console.log(isDeleted); // undefined (value is false)

// Validate false value
const notDeleted = pick(data)
  .property("isDeleted")
  ?.boolean()
  ?.false()
  ?.valueOf();
console.log(notDeleted); // false

// Invert boolean value
const inverted = pick(data).property("isActive")?.boolean()?.not().valueOf();
console.log(inverted); // false

// Chain not with validations
const invertedAndValidated = pick(data)
  .property("isActive")
  ?.boolean()
  ?.not()
  .false()
  ?.valueOf();
console.log(invertedAndValidated); // false

// Use with pipe for transformations
const boolToString = pick(data)
  .property("isActive")
  ?.boolean()
  ?.pipe((b) => (b ? "yes" : "no"))
  .valueOf();
console.log(boolToString); // "yes"
```

### Arithmetic validations

```typescript
const data = {
  quantity: 10,
  price: 99.99,
  itemsPerBox: 12,
  userId: 12345n,
};

// Validate divisibility
const evenQuantity = pick(data)
  .property("quantity")
  ?.number()
  ?.divisibleBy(2)
  ?.valueOf();
console.log(evenQuantity); // 10

// Validate even/odd numbers
const evenItems = pick(data)
  .property("itemsPerBox")
  ?.integer()
  ?.even()
  ?.valueOf();
console.log(evenItems); // 12

const oddQuantity = pick(data)
  .property("quantity")
  ?.integer()
  ?.odd()
  ?.valueOf();
console.log(oddQuantity); // undefined (10 is not odd)

// Check if number is multiple of another
const multipleOfFive = pick(data)
  .property("quantity")
  ?.number()
  ?.multipleOf(5)
  ?.valueOf();
console.log(multipleOfFive); // 10

// BigInt arithmetic validations
const evenUserId = pick(data).property("userId")?.bigInt()?.even()?.valueOf();
console.log(evenUserId); // undefined (12345 is odd)

const oddUserId = pick(data).property("userId")?.bigInt()?.odd()?.valueOf();
console.log(oddUserId); // 12345n

const divisibleById = pick(data)
  .property("userId")
  ?.bigInt()
  ?.divisibleBy(5n)
  ?.valueOf();
console.log(divisibleById); // 12345n

// Chain arithmetic validations
const validQuantity = pick(data)
  .property("quantity")
  ?.integer()
  ?.positive()
  ?.even()
  ?.divisibleBy(5)
  ?.valueOf();
console.log(validQuantity); // 10

// Validate price is not an integer (for decimal prices)
const decimalPrice = pick(data).property("price")?.number()?.valueOf();
const isInteger = pick(data).property("price")?.integer()?.valueOf();
console.log(decimalPrice); // 99.99
console.log(isInteger); // undefined (99.99 is not an integer)
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
const createdAt = pick(data).property("createdAt")?.date()?.valueOf();
console.log(createdAt); // Date object: 2024-01-01

// Validate timestamp (number) - returns the original timestamp
const fromTimestamp = pick(data).property("timestamp")?.date()?.valueOf();
console.log(fromTimestamp); // 1704067200000 (timestamp number)

// Validate date string - returns the original string
const fromString = pick(data).property("dateString")?.date()?.valueOf();
console.log(fromString); // "2024-12-25" (string)

// Invalid Date returns undefined
const invalid = pick(data).property("invalidDate")?.date()?.valueOf();
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

// Convert timestamp to Date object using toDate()
const timestampAsDate = pick(data)
  .property("timestamp")
  ?.date()
  ?.toDate()
  ?.valueOf();
console.log(timestampAsDate); // Date object

// Convert string to Date object using toDate()
const stringAsDate = pick(data)
  .property("dateString")
  ?.date()
  ?.toDate()
  ?.valueOf();
console.log(stringAsDate); // Date object
```

### Case validation

```typescript
const data = {
  code: "ABC123",
  name: "john",
  title: "Hello World",
};

// Validate uppercase
const code = pick(data).property("code")?.string()?.uppercase()?.valueOf();
console.log(code); // "ABC123"

// Validate lowercase
const name = pick(data).property("name")?.string()?.lowercase()?.valueOf();
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

### Record (Object) validations

```typescript
const data = {
  user: {
    name: "John",
    email: "john@example.com",
    age: 30,
  },
  settings: {},
};

// Validate object has a specific key
const user = pick(data).property("user")?.record()?.hasKey("name")?.valueOf();
console.log(user); // { name: "John", email: "john@example.com", age: 30 }

// Validate object has multiple keys
const validUser = pick(data)
  .property("user")
  ?.record()
  ?.hasKeys(["name", "email"])
  ?.valueOf();
console.log(validUser); // { name: "John", email: "john@example.com", age: 30 }

// Validate object is not empty
const settings = pick(data).property("settings")?.record()?.notEmpty();
console.log(settings); // undefined (empty object)

// Validate minimum number of keys
const userWithMinKeys = pick(data)
  .property("user")
  ?.record()
  ?.minKeys(2)
  ?.valueOf();
console.log(userWithMinKeys); // { name: "John", email: "john@example.com", age: 30 }

// Validate maximum number of keys
const userWithMaxKeys = pick(data)
  .property("user")
  ?.record()
  ?.maxKeys(10)
  ?.valueOf();
console.log(userWithMaxKeys); // { name: "John", email: "john@example.com", age: 30 }

// Get object keys
const keys = pick(data).property("user")?.record()?.keys().valueOf();
console.log(keys); // ["name", "email", "age"]

// Get object values
const values = pick(data).property("user")?.record()?.values().valueOf();
console.log(values); // ["John", "john@example.com", 30]

// Chain validations
const validatedUser = pick(data)
  .property("user")
  ?.record()
  ?.notEmpty()
  ?.hasKeys(["name", "email"])
  ?.minKeys(2)
  ?.maxKeys(10)
  ?.valueOf();
console.log(validatedUser); // { name: "John", email: "john@example.com", age: 30 }
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

// Chaining with pipe for transformations
const processedValue = pick(data)
  .property("name")
  ?.string()
  ?.pipe((name) => name.toUpperCase())
  .valueOf();
console.log(processedValue); // "JOHN"
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
const tags = pick(data).property("tags")?.array()?.length(2)?.valueOf();
console.log(tags); // ["javascript", "typescript"]

// Validate minimum length
const password = pick(data).property("password")?.string()?.min(8)?.valueOf();
console.log(password); // "secret123"

// Validate maximum length
const username = pick(data).property("username")?.string()?.max(20)?.valueOf();
console.log(username); // "john_doe"

// Validate length range (chain min and max)
const items = pick(data).property("items")?.array()?.min(3)?.max(10)?.valueOf();
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
const hasAge = pick(data).record()?.includes("age")?.valueOf();
console.log(hasAge); // { username: "john_doe", password: "secret123", ... }

// Validate number range
const age = pick(data).property("age")?.number()?.min(18)?.max(65)?.valueOf();
console.log(age); // 25
```

## ArithmeticMethods Interface

`ArithmeticMethods<T, Self>` is an interface that defines common arithmetic validation methods for numerical types. It's implemented by `NumberPick`, `IntegerPick`, and `BigIntPick` to ensure a consistent API across all numerical types.

### Methods defined by ArithmeticMethods

- `gt(min)` - Greater than (exclusive)
- `gte(min)` - Greater than or equal (inclusive)
- `lt(max)` - Less than (exclusive)
- `lte(max)` - Less than or equal (inclusive)
- `between(min, max)` - Within range (inclusive on both ends)
- `positive()` - Greater than 0
- `negative()` - Less than 0
- `multipleOf(divisor)` - Is a multiple of divisor
- `divisibleBy(divisor)` - Is divisible by divisor (alias for multipleOf)
- `even()` - Is an even number
- `odd()` - Is an odd number

All three numerical classes (`NumberPick`, `IntegerPick`, `BigIntPick`) implement this interface, providing a consistent API for numerical validations.

### NumberPick Specific Methods

In addition to the `ArithmeticMethods` interface, `NumberPick` also provides:

- `integer()` - Validates that the number is an integer and returns an `IntegerPick` instance
- `finite()` - Validates that the number is finite (not Infinity or -Infinity)

## DatePick

`DatePick` is a specialized class that extends `Pick<Date | number | string>` with date-specific validation methods. It's automatically returned by the `.date()` method and preserves the original value type (Date, timestamp number, or date string).

### DatePick Methods

#### `.after(minDate)`

Validates that the date is greater than or equal to the minimum date specified. Accepts Date objects, timestamps (numbers), or date strings.

```typescript
pick(new Date("2024-06-15")).date()?.after(new Date("2024-01-01"))?.valueOf();
// Date object: 2024-06-15

pick(new Date("2023-12-31")).date()?.after(new Date("2024-01-01"));
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
pick(new Date("2024-06-15")).date()?.before(new Date("2024-12-31"))?.valueOf();
// Date object: 2024-06-15

pick(new Date("2025-01-01")).date()?.before(new Date("2024-12-31"));
// undefined

// Using timestamps
pick(Date.now()).date()?.before(Date.now())?.valueOf();
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

## URLPick

`URLPick` is a specialized class that extends `Pick<URL | string>` for working with URLs. It's automatically returned by the `.url()` method.

### `.url()`

Validates that the value is a valid URL string or URL object and returns a URLPick instance.

```typescript
// Valid URL string
pick("https://example.com").url()?.valueOf(); // URL object
pick("https://example.com/path?query=value").url()?.valueOf(); // URL object

// Valid URL object
pick(new URL("https://example.com")).url()?.valueOf(); // URL object

// Invalid URLs
pick("not-a-url").url(); // undefined
pick(123).url(); // undefined
pick("example.com").url(); // undefined (missing protocol)

// Chain with other validations
const validUrl = pick("https://example.com")
  .url()
  ?.pipe((url) => new URL(url))
  .valueOf();
console.log(validUrl); // URL object
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

## Deprecated Methods

The following methods are deprecated and will be removed in a future version. Use the recommended alternatives instead:

### Type Validation Methods

- `.isString()` → Use `.string()` instead
- `.isNumber()` → Use `.number()` instead
- `.isInteger()` → Use `.integer()` instead
- `.isBigInt()` → Use `.bigInt()` instead
- `.isBoolean()` → Use `.boolean()` instead
- `.isArray()` → Use `.array()` instead
- `.isRecord()` → Use `.record()` instead
- `.isNative()` → Use `.native()` instead
- `.isEnumOf(values)` → Use `.enum(values)` instead

### Array Methods

- `.filter(predicate)` → Use `.pipe(arr => arr.filter(predicate))` instead

The `.filter()` method is deprecated because the name can be confusing. Although it doesn't mutate the original value, the name suggests a mutation operation.

## Features

- **Type safety**: Maintains type information in TypeScript
- **Fluent chaining**: Allows chaining multiple operations
- **Elegant error handling**: Returns `undefined` instead of throwing exceptions
- **Immutable**: Doesn't modify original values
- **Flexible**: Supports strings, numbers, arrays, objects, and symbols
- **Specialized classes**: Different classes for different types with type-specific methods
- **Consistent API**: Arithmetic methods work the same across NumberPick, IntegerPick, and BigIntPick
