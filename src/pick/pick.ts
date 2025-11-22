// Rules: Pick or any class that inherits from Pick should never modify the value

namespace Utils {
  export const isRecord = (value: any): value is Record<any, any> =>
    typeof value === "object" && value !== null;
  export const isSymbol = (value: any): value is symbol =>
    typeof value === "symbol";
  export const isString = (value: any): value is string =>
    typeof value === "string";
  export const isNumber = (value: any): value is number =>
    typeof value === "number";
  export const isBoolean = (value: any): value is boolean =>
    typeof value === "boolean";
  export const isArray = (value: any): value is Array<any> =>
    isRecord(value) && Array.isArray(value);
  export const hasOwnProperty = <K extends string | symbol | number>(
    value: Record<any, any>,
    key: K,
  ): value is Record<K, any> => Reflect.has(value, key);
  export const includes = <T extends string>(
    values: T[],
    value: unknown,
  ): value is T => isString(value) && (values as any[]).includes(value);
}

/**
 * Utility class for safely navigating and validating data structures.
 * Provides chainable methods for accessing properties and validating types.
 *
 * @template T - The type of the encapsulated value
 *
 * @example
 * ```typescript
 * const data = { user: { name: "John", age: 30 } };
 * const name = pick(data)
 *   .property("user")
 *   ?.property("name")
 *   ?.isString()
 *   ?.valueOf();
 * ```
 */
export class Pick<T> {
  /**
   * Creates a new Pick instance with the provided value.
   *
   * @param value - The value to encapsulate
   */
  constructor(readonly value: T) {}

  /**
   * Accesses a property of the current object.
   *
   * @template K - The type of the property key
   * @param key - The key of the property to access
   * @returns A new Pick instance with the property value, or undefined if it doesn't exist
   *
   * @example
   * ```typescript
   * pick({ name: "John" }).property("name")?.valueOf(); // "John"
   * ```
   */
  property<K extends string | symbol | number>(
    key: K,
  ): undefined | Pick<unknown> {
    if (!Utils.isRecord(this.value)) return undefined;
    if (!Utils.hasOwnProperty(this.value, key)) return undefined;
    return new Pick(this.value[key]);
  }

  /**
   * Validates that the current value is a string.
   *
   * @returns A new StringPick instance with the value typed as string, or undefined if it's not a string
   *
   * @example
   * ```typescript
   * pick("hello").string()?.valueOf(); // "hello"
   * pick(123).string(); // undefined
   * ```
   */
  string(): undefined | StringPick {
    if (!Utils.isString(this.value)) return undefined;
    return new StringPick(this.value);
  }

  /** @deprecated Use string() instead */
  isString(): undefined | StringPick {
    return this.string();
  }

  /**
   * Validates that the current value is a number.
   *
   * @returns A new NumberPick instance with the value typed as number, or undefined if it's not a number
   *
   * @example
   * ```typescript
   * pick(123).number()?.valueOf(); // 123
   * pick("hello").number(); // undefined
   * ```
   */
  number(): undefined | NumberPick {
    if (!Utils.isNumber(this.value)) return undefined;
    return new NumberPick(this.value);
  }

  /** @deprecated Use number() instead */
  isNumber(): undefined | NumberPick {
    return this.number();
  }

  /**
   * Validates that the current value is an integer.
   *
   * @returns A new IntegerPick instance with the value typed as number, or undefined if it's not an integer
   *
   * @example
   * ```typescript
   * pick(42).integer()?.valueOf(); // 42
   * pick(3.14).integer(); // undefined
   * pick("hello").integer(); // undefined
   * ```
   */
  integer(): undefined | IntegerPick {
    if (!Utils.isNumber(this.value)) return undefined;
    if (!Number.isInteger(this.value)) return undefined;
    return new IntegerPick(this.value);
  }

  /** @deprecated Use integer() instead */
  isInteger(): undefined | IntegerPick {
    return this.integer();
  }

  /**
   * Validates that the current value is a bigint.
   *
   * @returns A new BigIntPick instance with the value typed as bigint, or undefined if it's not a bigint
   *
   * @example
   * ```typescript
   * pick(123n).bigInt()?.valueOf(); // 123n
   * pick(123).bigInt(); // undefined
   * ```
   */
  bigInt(): undefined | BigIntPick {
    if (typeof this.value !== "bigint") return undefined;
    return new BigIntPick(this.value);
  }

  /** @deprecated Use bigInt() instead */
  isBigInt(): undefined | BigIntPick {
    return this.bigInt();
  }

  /**
   * Validates that the current value is a boolean.
   *
   * @returns A new BooleanPick instance with the value typed as boolean, or undefined if it's not a boolean
   *
   * @example
   * ```typescript
   * pick(true).boolean()?.valueOf(); // true
   * pick(1).boolean(); // undefined
   * ```
   */
  boolean(): undefined | BooleanPick {
    if (!Utils.isBoolean(this.value)) return undefined;
    return new BooleanPick(this.value);
  }

  /** @deprecated Use boolean() instead */
  isBoolean(): undefined | BooleanPick {
    return this.boolean();
  }

  /**
   * Validates that the current value is a native JavaScript type.
   * Native types include: string, number, boolean, Array, and Object.
   *
   * @returns A new Pick instance with the value typed as a native type, or undefined if it's not a native type
   *
   * @example
   * ```typescript
   * pick("hello").native()?.valueOf(); // "hello"
   * pick([1, 2, 3]).native()?.valueOf(); // [1, 2, 3]
   * ```
   */
  native():
    | undefined
    | Pick<string | number | boolean | Array<any> | Record<any, any>> {
    if (Utils.isString(this.value)) return new Pick(this.value);
    if (Utils.isNumber(this.value)) return new Pick(this.value);
    if (Utils.isBoolean(this.value)) return new Pick(this.value);
    if (Utils.isArray(this.value)) return new Pick(this.value);
    if (Utils.isRecord(this.value)) return new Pick(this.value);
    return undefined;
  }

  /** @deprecated Use native() instead */
  isNative():
    | undefined
    | Pick<string | number | boolean | Array<any> | Record<any, any>> {
    return this.native();
  }

  /**
   * Validates that the current value is an array.
   *
   * @returns A new ArrayPick instance with the value typed as Array, or undefined if it's not an array
   *
   * @example
   * ```typescript
   * pick([1, 2, 3]).array()?.valueOf(); // [1, 2, 3]
   * pick("hello").array(); // undefined
   * ```
   */
  array(): undefined | ArrayPick<unknown> {
    if (!Utils.isArray(this.value)) return undefined;
    return new ArrayPick(this.value);
  }

  /** @deprecated Use array() instead */
  isArray(): undefined | ArrayPick<unknown> {
    return this.array();
  }

  /**
   * Validates that the current value is an object (Record).
   *
   * @returns A new RecordPick instance with the value typed as Record, or undefined if it's not an object
   *
   * @example
   * ```typescript
   * pick({ name: "John" }).record()?.valueOf(); // { name: "John" }
   * pick(null).record(); // undefined
   * ```
   */
  record(): undefined | RecordPick {
    if (!Utils.isRecord(this.value)) return undefined;
    return new RecordPick(this.value);
  }

  /** @deprecated Use record() instead */
  isRecord(): undefined | RecordPick {
    return this.record();
  }

  /**
   * Validates that the current value is a string that belongs to a specific set of values (enum).
   *
   * @template E - The type of the enum values
   * @param values - Array of valid enum values
   * @returns A new Pick instance with the value typed as E, or undefined if it doesn't belong to the enum
   *
   * @example
   * ```typescript
   * pick("red").enum(["red", "green", "blue"])?.valueOf(); // "red"
   * pick("yellow").enum(["red", "green", "blue"]); // undefined
   * ```
   */
  enum<E extends string>(values: E[]) {
    if (!Utils.isString(this.value)) return undefined;
    if (!Utils.includes(values, this.value)) return undefined;
    return new Pick<E>(this.value);
  }

  /** @deprecated Use enum() instead */
  isEnumOf<E extends string>(values: E[]) {
    return this.enum(values);
  }

  /**
   * Applies a transformation function to the current value.
   *
   * @template E - The type of the resulting value
   * @param transform - Function that transforms the current value
   * @returns The result of applying the transformation function
   *
   * @example
   * ```typescript
   * pick("hello").pipe(s => s.toUpperCase()); // "HELLO"
   * pick(5).pipe(n => n * 2); // 10
   * ```
   */
  pipe<E>(transform: (value: T) => E): Pick<E> {
    return new Pick(transform(this.value));
  }

  /**
   * Finds the first element in an array that meets the specified condition.
   *
   * @param filter - Function that evaluates each element of the array
   * @param thisArg - Optional value to use as `this` when executing the filter function
   * @returns A new Pick instance with the found element, or undefined if not found or not an array
   *
   * @example
   * ```typescript
   * pick([1, 2, 3, 4]).find(n => n > 2)?.valueOf(); // 3
   * ```
   */
  find(
    filter: (value: T extends any[] ? T[number] : never) => boolean,
    thisArg?: any,
  ) {
    if (!Utils.isArray(this.value)) return undefined;
    return new Pick<T extends any[] ? T[number] : unknown>(
      this.value.find(filter, thisArg),
    );
  }

  /**
   * Filters array elements that meet the specified condition.
   *
   * @deprecated This method is deprecated because the name can be confusing.
   * Although it doesn't mutate the original value, the name suggests a mutation operation.
   * Use `pipe()` with native `filter()` instead: `.pipe(arr => arr.filter(...))`
   *
   * @param filter - Function that evaluates each element of the array
   * @param thisArg - Optional value to use as `this` when executing the filter function
   * @returns A new Pick instance with the filtered array, or undefined if it's not an array
   *
   * @example
   * ```typescript
   * // Deprecated:
   * pick([1, 2, 3, 4]).filter(n => n > 2)?.valueOf(); // [3, 4]
   *
   * // Recommended:
   * pick([1, 2, 3, 4]).pipe(arr => arr.filter(n => n > 2)).valueOf(); // [3, 4]
   * ```
   */
  filter(
    filter: (value: T extends any[] ? T[number] : never) => boolean,
    thisArg?: any,
  ) {
    if (!Utils.isArray(this.value)) return undefined;
    return new Pick(this.value.filter(filter, thisArg));
  }

  /**
   * Validates that all elements of an array meet a validation condition.
   *
   * @template R - The type of the resulting value after validation
   * @param validator - Validation function applied to each element of the array
   * @returns A new Pick instance with the array typed as R[], or undefined if it's not an array or any element fails validation
   *
   * @example
   * ```typescript
   * pick(["hello", "world"]).every(v => v.isString())?.valueOf(); // ["hello", "world"]
   * pick([1, 2, 3]).every(v => v.isString()); // undefined
   * pick(["a", 1]).every(v => v.isString()); // undefined
   * ```
   */
  every<R>(
    validator: (
      value: Pick<T extends any[] ? T[number] : never>,
    ) => undefined | Pick<R>,
  ): undefined | Pick<R[]> {
    if (!Utils.isArray(this.value)) return undefined;

    const results: R[] = [];
    for (const item of this.value) {
      const result = validator(new Pick(item));
      if (result === undefined) {
        return undefined;
      }
      results.push(result.valueOf());
    }

    return new Pick(results);
  }

  /**
   * Attempts to apply one of the provided validation functions.
   * Returns the result of the first function that doesn't return undefined.
   *
   * @template Validators - Array of validation functions
   * @param validators - Array of validation functions to try
   * @returns The result of the first successful validation, or undefined if all fail
   *
   * @example
   * ```typescript
   * pick({ version: "1.0.0" })
   *   .property("version")
   *   ?.oneOf([
   *     (v: Pick<unknown>) => v.isString(),
   *     (v: Pick<unknown>) => v.isNumber()
   *   ])
   *   ?.valueOf(); // "1.0.0"
   *
   * pick({ version: 2 })
   *   .property("version")
   *   ?.oneOf([
   *     (v: Pick<unknown>) => v.isString(),
   *     (v: Pick<unknown>) => v.isNumber()
   *   ])
   *   ?.valueOf(); // 2
   * ```
   */
  oneOf<Validators extends Array<(value: Pick<T>) => undefined | Pick<any>>>(
    validators: Validators,
  ):
    | undefined
    | Pick<
        Validators[number] extends (value: Pick<T>) => undefined | Pick<infer R>
          ? R
          : never
      > {
    for (const validator of validators) {
      const result = validator(this);
      if (result !== undefined) {
        return result as any;
      }
    }
    return undefined;
  }

  /**
   * Validates that the current value is a valid email.
   * This is an alias for `this.string()?.email()`.
   *
   * @remarks
   * This method uses a simplified regular expression to validate emails.
   * It doesn't cover all RFC 5322 specifications (which is extremely complex),
   * but validates most common and practical email formats.
   *
   * @returns A new StringPick instance if it's a valid email, or undefined if it's not
   *
   * @example
   * ```typescript
   * pick("user@example.com").email()?.valueOf(); // "user@example.com"
   * pick("invalid-email").email(); // undefined
   * pick(123).email(); // undefined
   * ```
   */
  email(): undefined | StringPick {
    return this.string()?.email();
  }

  /**
   * Validates that the current value is a valid date (Date, timestamp, or string).
   *
   * @returns A new DatePick instance if it's a valid date, or undefined if it's not
   *
   * @example
   * ```typescript
   * pick(new Date()).date()?.valueOf(); // Date object
   * pick(1234567890000).date()?.valueOf(); // timestamp
   * pick("2024-01-01").date()?.valueOf(); // "2024-01-01"
   * ```
   */
  date(): T extends Date
    ? DatePick<Date>
    : T extends string
      ? DatePick<string>
      : T extends number
        ? DatePick<number>
        : undefined {
    if (this.value instanceof Date) {
      if (isNaN(this.value.getTime())) return undefined as any;
      return new DatePick(this.value) as any;
    }

    if (typeof this.value === "number") {
      const date = new Date(this.value);
      if (isNaN(date.getTime())) return undefined as any;
      return new DatePick(this.value) as any;
    }

    if (typeof this.value === "string") {
      const date = new Date(this.value);
      if (isNaN(date.getTime())) return undefined as any;
      return new DatePick(this.value) as any;
    }

    return undefined as any;
  }

  /**
   * Validates that the current value is an instance of the specified class or constructor.
   *
   * @template C - The constructor type
   * @param constructor - The class or constructor function to check against
   * @returns A new Pick instance with the value typed as an instance of C, or undefined if it's not an instance
   *
   * @example
   * ```typescript
   * pick(new Date()).instanceOf(Date)?.valueOf(); // Date object
   * pick(new Error("test")).instanceOf(Error)?.valueOf(); // Error object
   * pick([1, 2, 3]).instanceOf(Array)?.valueOf(); // [1, 2, 3]
   * pick("hello").instanceOf(Date); // undefined
   *
   * // Custom classes
   * class User {
   *   constructor(public name: string) {}
   * }
   * const user = new User("John");
   * pick(user).instanceOf(User)?.valueOf(); // User instance
   * ```
   */
  instanceOf<C extends new (...args: any[]) => any>(
    constructor: C,
  ): undefined | Pick<InstanceType<C>> {
    if (!(this.value instanceof constructor)) return undefined;
    return new Pick(this.value as InstanceType<C>);
  }

  /**
   * Validates that the current value is a valid URL string or URL object and returns a URLPick.
   *
   * @returns A new URLPick instance with the URL object, or undefined if it's not a valid URL
   *
   * @example
   * ```typescript
   * pick("https://example.com").url()?.valueOf(); // URL object
   * pick(new URL("https://example.com")).url()?.valueOf(); // URL object
   * pick("not-a-url").url(); // undefined
   * pick(123).url(); // undefined
   * ```
   */
  url(): T extends URL
    ? URLPick<URL>
    : T extends string
      ? URLPick<string>
      : undefined {
    if (this.value instanceof URL) {
      return new URLPick<URL>(this.value) as any;
    }
    if (!Utils.isString(this.value)) return undefined as any;
    if (!URL.canParse(this.value)) return undefined as any;
    return new URLPick<string>(this.value) as any;
  }

  /**
   * Validates that the current value is an Error instance.
   * This is an alias for `this.instanceOf(Error)`.
   *
   * @returns A new Pick instance with the value typed as Error, or undefined if it's not an Error
   *
   * @example
   * ```typescript
   * pick(new Error("test")).error()?.valueOf(); // Error object
   * pick(new TypeError("test")).error()?.valueOf(); // TypeError object (extends Error)
   * pick("not an error").error(); // undefined
   * pick(123).error(); // undefined
   * ```
   */
  error(): undefined | Pick<Error> {
    return this.instanceOf(Error);
  }

  /**
   * Gets the current encapsulated value.
   *
   * @returns The original value encapsulated in this Pick instance
   *
   * @example
   * ```typescript
   * pick("hello").valueOf(); // "hello"
   * pick({ name: "John" }).valueOf(); // { name: "John" }
   * ```
   */
  valueOf(): T {
    return this.value;
  }

  static utils = Utils;
}

/**
 * Interface for numerical types that support arithmetic validation methods.
 * Implemented by NumberPick, IntegerPick, and BigIntPick.
 *
 * @template T - The numerical type (number or bigint)
 * @template Self - The implementing class type for method chaining
 */
export interface ArithmeticMethods<T extends number | bigint, Self> {
  /**
   * Validates that the number is greater than the specified value.
   *
   * @param min - Minimum value (exclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  gt(min: T): undefined | Self;

  /**
   * Validates that the number is greater than or equal to the specified value.
   *
   * @param min - Minimum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  gte(min: T): undefined | Self;

  /**
   * Validates that the number is less than the specified value.
   *
   * @param max - Maximum value (exclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  lt(max: T): undefined | Self;

  /**
   * Validates that the number is less than or equal to the specified value.
   *
   * @param max - Maximum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  lte(max: T): undefined | Self;

  /**
   * Validates that the number is within a range.
   *
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  between(min: T, max: T): undefined | Self;

  /**
   * Validates that the number is positive (greater than 0).
   *
   * @returns This instance if it's positive, or undefined if not
   */
  positive(): undefined | Self;

  /**
   * Validates that the number is negative (less than 0).
   *
   * @returns This instance if it's negative, or undefined if not
   */
  negative(): undefined | Self;

  /**
   * Validates that the number is a multiple of the specified value.
   *
   * @param divisor - The divisor
   * @returns This instance if it's a multiple, or undefined if not
   */
  multipleOf(divisor: T): undefined | Self;

  /**
   * Validates that the number is divisible by the specified divisor.
   * This is an alias for `multipleOf()` with more intuitive naming.
   *
   * @param divisor - The divisor to check
   * @returns This instance if it's divisible by the divisor, or undefined if not
   */
  divisibleBy(divisor: T): undefined | Self;

  /**
   * Validates that the number is even.
   *
   * @returns This instance if it's even, or undefined if not
   */
  even(): undefined | Self;

  /**
   * Validates that the number is odd.
   *
   * @returns This instance if it's odd, or undefined if not
   */
  odd(): undefined | Self;
}

/**
 * Specialized class for working with integers.
 * Extends NumberPick with specific validations for integer numbers.
 */
export class IntegerPick
  extends Pick<number>
  implements ArithmeticMethods<number, IntegerPick>
{
  /**
   * Validates that the integer is greater than the specified value.
   *
   * @param min - Minimum value (exclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  gt(min: number): undefined | IntegerPick {
    if (this.value <= min) return undefined;
    return this;
  }

  /**
   * Validates that the integer is greater than or equal to the specified value.
   *
   * @param min - Minimum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  gte(min: number): undefined | IntegerPick {
    if (this.value < min) return undefined;
    return this;
  }

  /**
   * Validates that the integer is less than the specified value.
   *
   * @param max - Maximum value (exclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  lt(max: number): undefined | IntegerPick {
    if (this.value >= max) return undefined;
    return this;
  }

  /**
   * Validates that the integer is less than or equal to the specified value.
   *
   * @param max - Maximum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  lte(max: number): undefined | IntegerPick {
    if (this.value > max) return undefined;
    return this;
  }

  /**
   * Validates that the integer is within a range.
   *
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  between(min: number, max: number): undefined | IntegerPick {
    if (this.value < min || this.value > max) return undefined;
    return this;
  }

  /**
   * Validates that the integer is positive (greater than 0).
   *
   * @returns This instance if it's positive, or undefined if not
   */
  positive(): undefined | IntegerPick {
    if (this.value <= 0) return undefined;
    return this;
  }

  /**
   * Validates that the integer is negative (less than 0).
   *
   * @returns This instance if it's negative, or undefined if not
   */
  negative(): undefined | IntegerPick {
    if (this.value >= 0) return undefined;
    return this;
  }

  /**
   * Validates that the integer is a multiple of the specified value.
   *
   * @param divisor - The divisor
   * @returns This instance if it's a multiple, or undefined if not
   */
  multipleOf(divisor: number): undefined | IntegerPick {
    if (this.value % divisor !== 0) return undefined;
    return this;
  }

  /**
   * Validates that the integer is even.
   *
   * @returns This instance if it's even, or undefined if not
   */
  even(): undefined | IntegerPick {
    if (this.value % 2 !== 0) return undefined;
    return this;
  }

  /**
   * Validates that the integer is odd.
   *
   * @returns This instance if it's odd, or undefined if not
   */
  odd(): undefined | IntegerPick {
    if (this.value % 2 === 0) return undefined;
    return this;
  }

  /**
   * Validates that the integer is divisible by the specified divisor.
   * This is an alias for `multipleOf()` with more intuitive naming.
   *
   * @param divisor - The divisor to check
   * @returns This instance if it's divisible by the divisor, or undefined if not
   *
   * @example
   * ```typescript
   * pick(10).integer()?.divisibleBy(2)?.valueOf(); // 10
   * pick(4).integer()?.divisibleBy(2)?.valueOf(); // 4
   * pick(5).integer()?.divisibleBy(2); // undefined
   * ```
   */
  divisibleBy(divisor: number): undefined | IntegerPick {
    return this.multipleOf(divisor);
  }
}

/**
 * Specialized class for working with bigints.
 * Extends Pick<bigint> with specific methods for bigint validation.
 */
export class BigIntPick
  extends Pick<bigint>
  implements ArithmeticMethods<bigint, BigIntPick>
{
  /**
   * Validates that the bigint is greater than the specified value.
   *
   * @param min - Minimum value (exclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  gt(min: bigint): undefined | BigIntPick {
    if (this.value <= min) return undefined;
    return this;
  }

  /**
   * Validates that the bigint is greater than or equal to the specified value.
   *
   * @param min - Minimum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  gte(min: bigint): undefined | BigIntPick {
    if (this.value < min) return undefined;
    return this;
  }

  /**
   * Validates that the bigint is less than the specified value.
   *
   * @param max - Maximum value (exclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  lt(max: bigint): undefined | BigIntPick {
    if (this.value >= max) return undefined;
    return this;
  }

  /**
   * Validates that the bigint is less than or equal to the specified value.
   *
   * @param max - Maximum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  lte(max: bigint): undefined | BigIntPick {
    if (this.value > max) return undefined;
    return this;
  }

  /**
   * Validates that the bigint is within a range.
   *
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  between(min: bigint, max: bigint): undefined | BigIntPick {
    if (this.value < min || this.value > max) return undefined;
    return this;
  }

  /**
   * Validates that the bigint is positive (greater than 0n).
   *
   * @returns This instance if it's positive, or undefined if not
   */
  positive(): undefined | BigIntPick {
    if (this.value <= 0n) return undefined;
    return this;
  }

  /**
   * Validates that the bigint is negative (less than 0n).
   *
   * @returns This instance if it's negative, or undefined if not
   */
  negative(): undefined | BigIntPick {
    if (this.value >= 0n) return undefined;
    return this;
  }

  /**
   * Validates that the bigint is a multiple of the specified value.
   *
   * @param divisor - The divisor
   * @returns This instance if it's a multiple, or undefined if not
   *
   * @example
   * ```typescript
   * pick(10n).bigInt()?.multipleOf(2n)?.valueOf(); // 10n
   * pick(5n).bigInt()?.multipleOf(2n); // undefined
   * ```
   */
  multipleOf(divisor: bigint): undefined | BigIntPick {
    if (divisor === 0n) return undefined;
    if (this.value % divisor !== 0n) return undefined;
    return this;
  }

  /**
   * Validates that the bigint is divisible by the specified divisor.
   * This is an alias for `multipleOf()` with more intuitive naming.
   *
   * @param divisor - The divisor to check
   * @returns This instance if it's divisible by the divisor, or undefined if not
   *
   * @example
   * ```typescript
   * pick(10n).bigInt()?.divisibleBy(2n)?.valueOf(); // 10n
   * pick(4n).bigInt()?.divisibleBy(2n)?.valueOf(); // 4n
   * pick(5n).bigInt()?.divisibleBy(2n); // undefined
   * ```
   */
  divisibleBy(divisor: bigint): undefined | BigIntPick {
    return this.multipleOf(divisor);
  }

  /**
   * Validates that the bigint is even.
   *
   * @returns This instance if it's even, or undefined if not
   *
   * @example
   * ```typescript
   * pick(4n).bigInt()?.even()?.valueOf(); // 4n
   * pick(5n).bigInt()?.even(); // undefined
   * ```
   */
  even(): undefined | BigIntPick {
    if (this.value % 2n !== 0n) return undefined;
    return this;
  }

  /**
   * Validates that the bigint is odd.
   *
   * @returns This instance if it's odd, or undefined if not
   *
   * @example
   * ```typescript
   * pick(5n).bigInt()?.odd()?.valueOf(); // 5n
   * pick(4n).bigInt()?.odd(); // undefined
   * ```
   */
  odd(): undefined | BigIntPick {
    if (this.value % 2n === 0n) return undefined;
    return this;
  }
}

/**
 * Specialized class for working with booleans.
 * Extends Pick<boolean> with specific methods for boolean validation.
 */
export class BooleanPick extends Pick<boolean> {
  /**
   * Validates that the value is true.
   *
   * @returns This instance if it's true, or undefined if not
   */
  true(): undefined | BooleanPick {
    if (this.value !== true) return undefined;
    return this;
  }

  /**
   * Validates that the value is false.
   *
   * @returns This instance if it's false, or undefined if not
   */
  false(): undefined | BooleanPick {
    if (this.value !== false) return undefined;
    return this;
  }

  /**
   * Inverts the boolean value.
   *
   * @returns A new BooleanPick instance with the inverted value
   */
  not(): BooleanPick {
    return new BooleanPick(!this.value);
  }
}

/**
 * Specialized class for working with arrays.
 * Extends Pick<Array<T>> with specific methods for array validation and manipulation.
 */
export class ArrayPick<T = unknown> extends Pick<Array<T>> {
  /**
   * Validates that the array has a minimum length.
   *
   * @param min - Minimum length (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  minLength(min: number): undefined | ArrayPick<T> {
    if (this.value.length < min) return undefined;
    return this;
  }

  /**
   * Validates that the array has a maximum length.
   *
   * @param max - Maximum length (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  maxLength(max: number): undefined | ArrayPick<T> {
    if (this.value.length > max) return undefined;
    return this;
  }

  /**
   * Validates that the array has an exact length.
   *
   * @param length - Exact length
   * @returns This instance if it meets the condition, or undefined if not
   */
  length(length: number): undefined | ArrayPick<T> {
    if (this.value.length !== length) return undefined;
    return this;
  }

  /**
   * Validates that the array is not empty.
   *
   * @returns This instance if it's not empty, or undefined if it's empty
   */
  notEmpty(): undefined | ArrayPick<T> {
    if (this.value.length === 0) return undefined;
    return this;
  }

  /**
   * Validates that the array contains a specific element.
   *
   * @param item - Element to search for
   * @returns This instance if it contains the element, or undefined if not
   */
  includes(item: T): undefined | ArrayPick<T> {
    if (!this.value.includes(item)) return undefined;
    return this;
  }

  /**
   * Gets the first element of the array.
   *
   * @returns A new Pick instance with the first element, or undefined if it's empty
   */
  first(): Pick<T> | undefined {
    if (this.value.length === 0) return undefined;
    return new Pick(this.value[0]);
  }

  /**
   * Gets the last element of the array.
   *
   * @returns A new Pick instance with the last element, or undefined if it's empty
   */
  last(): Pick<T> | undefined {
    if (this.value.length === 0) return undefined;
    return new Pick(this.value[this.value.length - 1]);
  }

  /**
   * Gets an element at a specific index.
   *
   * @param index - Index of the element
   * @returns A new Pick instance with the element, or undefined if the index doesn't exist
   */
  at(index: number): Pick<T> | undefined {
    const item = this.value.at(index);
    if (item === undefined) return undefined;
    return new Pick(item);
  }
}

/**
 * Specialized class for working with objects (Records).
 * Extends Pick<Record<string, unknown>> with specific methods for object validation.
 */
export class RecordPick extends Pick<Record<string, unknown>> {
  /**
   * Validates that the object has a specific key.
   *
   * @param key - Key to search for
   * @returns This instance if it has the key, or undefined if not
   */
  hasKey(key: string): undefined | RecordPick {
    if (!(key in this.value)) return undefined;
    return this;
  }

  /**
   * Validates that the object has all the specified keys.
   *
   * @param keys - Array of keys to search for
   * @returns This instance if it has all the keys, or undefined if any is missing
   */
  hasKeys(keys: string[]): undefined | RecordPick {
    for (const key of keys) {
      if (!(key in this.value)) return undefined;
    }
    return this;
  }

  /**
   * Validates that the object is not empty.
   *
   * @returns This instance if it's not empty, or undefined if it's empty
   */
  notEmpty(): undefined | RecordPick {
    if (Object.keys(this.value).length === 0) return undefined;
    return this;
  }

  /**
   * Gets the keys of the object.
   *
   * @returns A new ArrayPick instance with the keys
   */
  keys(): ArrayPick<string> {
    return new ArrayPick(Object.keys(this.value));
  }

  /**
   * Gets the values of the object.
   *
   * @returns A new ArrayPick instance with the values
   */
  values(): ArrayPick<unknown> {
    return new ArrayPick(Object.values(this.value));
  }

  /**
   * Validates that the object has a minimum number of keys.
   *
   * @param min - Minimum number of keys
   * @returns This instance if it meets the condition, or undefined if not
   */
  minKeys(min: number): undefined | RecordPick {
    if (Object.keys(this.value).length < min) return undefined;
    return this;
  }

  /**
   * Validates that the object has a maximum number of keys.
   *
   * @param max - Maximum number of keys
   * @returns This instance if it meets the condition, or undefined if not
   */
  maxKeys(max: number): undefined | RecordPick {
    if (Object.keys(this.value).length > max) return undefined;
    return this;
  }
}

/**
 * Specialized class for working with strings.
 * Extends Pick<string> with specific methods for string validation and manipulation.
 */
export class StringPick extends Pick<string> {
  /**
   * Validates that the string has a minimum length.
   *
   * @param min - Minimum length (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  minLength(min: number): undefined | StringPick {
    if (this.value.length < min) return undefined;
    return this;
  }

  /**
   * Validates that the string has a maximum length.
   *
   * @param max - Maximum length (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  maxLength(max: number): undefined | StringPick {
    if (this.value.length > max) return undefined;
    return this;
  }

  /**
   * Validates that the string has an exact length.
   *
   * @param length - Exact length
   * @returns This instance if it meets the condition, or undefined if not
   */
  length(length: number): undefined | StringPick {
    if (this.value.length !== length) return undefined;
    return this;
  }

  /**
   * Validates that the string matches a regular expression.
   *
   * @param pattern - Regular expression or string
   * @returns This instance if it matches, or undefined if not
   */
  matches(pattern: RegExp | string): undefined | StringPick {
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
    if (!regex.test(this.value)) return undefined;
    return this;
  }

  /**
   * Validates that the string starts with a specific prefix.
   *
   * @param prefix - Prefix to search for
   * @returns This instance if it starts with the prefix, or undefined if not
   */
  startsWith(prefix: string): undefined | StringPick {
    if (!this.value.startsWith(prefix)) return undefined;
    return this;
  }

  /**
   * Validates that the string ends with a specific suffix.
   *
   * @param suffix - Suffix to search for
   * @returns This instance if it ends with the suffix, or undefined if not
   */
  endsWith(suffix: string): undefined | StringPick {
    if (!this.value.endsWith(suffix)) return undefined;
    return this;
  }

  /**
   * Validates that the string contains a specific substring.
   *
   * @param substring - Substring to search for
   * @returns This instance if it contains the substring, or undefined if not
   */
  includes(substring: string): undefined | StringPick {
    if (!this.value.includes(substring)) return undefined;
    return this;
  }

  /**
   * Validates that the string is not empty.
   *
   * @returns This instance if it's not empty, or undefined if it's empty
   */
  notEmpty(): undefined | StringPick {
    if (this.value.length === 0) return undefined;
    return this;
  }

  /**
   * Validates that the string is a valid email.
   *
   * @remarks
   * This method uses a simplified regular expression to validate emails.
   * It doesn't cover all RFC 5322 specifications (which is extremely complex),
   * but validates most common and practical email formats.
   *
   * @returns This instance if it's a valid email, or undefined if not
   */
  email(): undefined | StringPick {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.value)) return undefined;
    return this;
  }

  /**
   * Transforms the string to uppercase.
   *
   * @returns A new StringPick instance with the string in uppercase
   */
  toUpperCase(): StringPick {
    return new StringPick(this.value.toUpperCase());
  }

  /**
   * Transforms the string to lowercase.
   *
   * @returns A new StringPick instance with the string in lowercase
   */
  toLowerCase(): StringPick {
    return new StringPick(this.value.toLowerCase());
  }

  /**
   * Removes whitespace from the beginning and end of the string.
   *
   * @returns A new StringPick instance with the trimmed string
   */
  trim(): StringPick {
    return new StringPick(this.value.trim());
  }
}

/**
 * Specialized class for working with numbers.
 * Extends Pick<number> with specific methods for number validation.
 */
export class NumberPick
  extends Pick<number>
  implements ArithmeticMethods<number, NumberPick>
{
  /**
   * Validates that the number is greater than the specified value.
   *
   * @param min - Minimum value (exclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  gt(min: number): undefined | NumberPick {
    if (this.value <= min) return undefined;
    return this;
  }

  /**
   * Validates that the number is greater than or equal to the specified value.
   *
   * @param min - Minimum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  gte(min: number): undefined | NumberPick {
    if (this.value < min) return undefined;
    return this;
  }

  /**
   * Validates that the number is less than the specified value.
   *
   * @param max - Maximum value (exclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  lt(max: number): undefined | NumberPick {
    if (this.value >= max) return undefined;
    return this;
  }

  /**
   * Validates that the number is less than or equal to the specified value.
   *
   * @param max - Maximum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  lte(max: number): undefined | NumberPick {
    if (this.value > max) return undefined;
    return this;
  }

  /**
   * Validates that the number is within a range.
   *
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  between(min: number, max: number): undefined | NumberPick {
    if (this.value < min || this.value > max) return undefined;
    return this;
  }

  /**
   * Validates that the number is positive (greater than 0).
   *
   * @returns This instance if it's positive, or undefined if not
   */
  positive(): undefined | NumberPick {
    if (this.value <= 0) return undefined;
    return this;
  }

  /**
   * Validates that the number is negative (less than 0).
   *
   * @returns This instance if it's negative, or undefined if not
   */
  negative(): undefined | NumberPick {
    if (this.value >= 0) return undefined;
    return this;
  }

  /**
   * Validates that the number is an integer.
   *
   * @returns A new IntegerPick instance if it's an integer, or undefined if not
   */
  integer(): undefined | IntegerPick {
    if (!Number.isInteger(this.value)) return undefined;
    return new IntegerPick(this.value);
  }

  /**
   * Validates that the number is finite.
   *
   * @returns This instance if it's finite, or undefined if not
   */
  finite(): undefined | NumberPick {
    if (!Number.isFinite(this.value)) return undefined;
    return this;
  }

  /**
   * Validates that the number is a multiple of the specified value.
   *
   * @param divisor - The divisor
   * @returns This instance if it's a multiple, or undefined if not
   */
  multipleOf(divisor: number): undefined | NumberPick {
    if (this.value % divisor !== 0) return undefined;
    return this;
  }

  /**
   * Validates that the number is divisible by the specified divisor.
   * This is an alias for `multipleOf()` with more intuitive naming.
   *
   * @param divisor - The divisor to check
   * @returns This instance if it's divisible by the divisor, or undefined if not
   *
   * @example
   * ```typescript
   * pick(10).number()?.divisibleBy(2)?.valueOf(); // 10
   * pick(4).number()?.divisibleBy(2)?.valueOf(); // 4
   * pick(5).number()?.divisibleBy(2); // undefined
   * ```
   */
  divisibleBy(divisor: number): undefined | NumberPick {
    return this.multipleOf(divisor);
  }

  /**
   * Validates that the number is even.
   *
   * @returns This instance if it's even, or undefined if not
   *
   * @example
   * ```typescript
   * pick(4).number()?.even()?.valueOf(); // 4
   * pick(5).number()?.even(); // undefined
   * pick(4.5).number()?.even(); // undefined (not an integer)
   * ```
   */
  even(): undefined | NumberPick {
    if (!Number.isInteger(this.value)) return undefined;
    if (this.value % 2 !== 0) return undefined;
    return this;
  }

  /**
   * Validates that the number is odd.
   *
   * @returns This instance if it's odd, or undefined if not
   *
   * @example
   * ```typescript
   * pick(5).number()?.odd()?.valueOf(); // 5
   * pick(4).number()?.odd(); // undefined
   * pick(5.5).number()?.odd(); // undefined (not an integer)
   * ```
   */
  odd(): undefined | NumberPick {
    if (!Number.isInteger(this.value)) return undefined;
    if (this.value % 2 === 0) return undefined;
    return this;
  }
}

/**
 * Specialized class for working with URLs.
 * Extends Pick<URL> without additional methods.
 */
export class URLPick<T extends URL | string> extends Pick<T> {}

/**
 * Specialized class for working with dates (Date).
 * Extends Pick<Date | number | string> with specific methods for date validation.
 */
export class DatePick<T extends Date | number | string> extends Pick<T> {
  #valueDate?: Date;

  private getDate(): Date | undefined {
    if (this.#valueDate !== undefined) {
      return this.#valueDate;
    }

    if (this.value instanceof Date) {
      this.#valueDate = this.value;
      return this.#valueDate;
    }

    const date = new Date(this.value);
    if (isNaN(date.getTime())) return undefined;

    this.#valueDate = date;
    return this.#valueDate;
  }

  /**
   * Validates that the date is after a minimum date.
   *
   * @param min - Minimum date (can be Date, timestamp, or string)
   * @returns This instance if the date is after, or undefined if it doesn't meet the condition
   */
  after(min: Date | number | string): undefined | DatePick<T> {
    const date = this.getDate();
    if (!date) return undefined;

    const minDate = new Date(min);
    if (isNaN(minDate.getTime())) return undefined;
    if (date.getTime() <= minDate.getTime()) return undefined;
    return this;
  }

  /**
   * Validates that the date is before a maximum date.
   *
   * @param max - Maximum date (can be Date, timestamp, or string)
   * @returns This instance if the date is before, or undefined if it doesn't meet the condition
   */
  before(max: Date | number | string): undefined | DatePick<T> {
    const date = this.getDate();
    if (!date) return undefined;

    const maxDate = new Date(max);
    if (isNaN(maxDate.getTime())) return undefined;
    if (date.getTime() >= maxDate.getTime()) return undefined;
    return this;
  }

  /**
   * Validates that the date is within a range.
   *
   * @param min - Minimum date
   * @param max - Maximum date
   * @returns This instance if the date is in range, or undefined if it doesn't meet the condition
   */
  between(
    min: Date | number | string,
    max: Date | number | string,
  ): undefined | DatePick<T> {
    return this.after(min)?.before(max);
  }
}

export const pick = <T = unknown>(value: T) => new Pick(value);
pick.utils = Utils;
