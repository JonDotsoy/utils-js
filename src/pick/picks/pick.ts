import { DatePick } from "./date-pick.js";
import { URLPick } from "./url-pick.js";
import { NumberPick } from "./number-pick.js";
import { NumericPick } from "./numeric-pick.js";
import { StringPick } from "./string-pick.js";
import { RecordPick } from "./record-pick.js";
import { ArrayPick } from "./array-pick.js";
import { BooleanPick } from "./boolean-pick.js";
import { BigIntPick } from "./bigint-pick.js";
import { IntegerPick } from "./integer-pick.js";
import { Utils } from "../utils/utils.js";

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
  constructor(readonly value: T) { }

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
    key: K
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
  native(): undefined |
    Pick<string | number | boolean | Array<any> | Record<any, any>> {
    if (Utils.isString(this.value)) return new Pick(this.value);
    if (Utils.isNumber(this.value)) return new Pick(this.value);
    if (Utils.isBoolean(this.value)) return new Pick(this.value);
    if (Utils.isArray(this.value)) return new Pick(this.value);
    if (Utils.isRecord(this.value)) return new Pick(this.value);
    return undefined;
  }

  /** @deprecated Use native() instead */
  isNative(): undefined |
    Pick<string | number | boolean | Array<any> | Record<any, any>> {
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
    thisArg?: any
  ) {
    if (!Utils.isArray(this.value)) return undefined;
    return new Pick<T extends any[] ? T[number] : unknown>(
      this.value.find(filter, thisArg)
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
    thisArg?: any
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
      value: Pick<T extends any[] ? T[number] : never>
    ) => undefined | Pick<R>
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
    validators: Validators
  ): undefined |
    Pick<
      Validators[number] extends (value: Pick<T>) => undefined | Pick<infer R> ? R : never
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
   * Validates that the current value is numeric (either a number or a string representing a number).
   * Accepts both integers and decimal numbers.
   *
   * @returns A new NumericPick instance with the value typed as number or string, or undefined if it's not numeric
   *
   * @example
   * ```typescript
   * pick(1234).numeric()?.valueOf(); // 1234
   * pick("1234").numeric()?.valueOf(); // "1234"
   * pick("123.456").numeric()?.valueOf(); // "123.456"
   * pick("abc").numeric(); // undefined
   * pick(1234).numeric()?.gt(1000)?.valueOf(); // 1234
   * pick("50").numeric()?.between(0, 100)?.valueOf(); // "50"
   * ```
   */
  numeric(): undefined |
    NumericPick<T extends string | number ? T : string | number> {
    const result = this.oneOf([
      (v) => v.number(),
      (v) => v.string()?.numeric(),
    ]);
    if (result === undefined) return undefined;
    return new NumericPick<T extends string | number ? T : string | number>(
      result.valueOf() as any
    );
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
  date(): undefined |
    DatePick<T extends Date | string | number ? T : Date | string | number> {
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
    constructor: C
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
  url(): undefined | URLPick<T extends string | URL ? T : string | URL> {
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
  error(): undefined | Pick<T extends Error ? T : Error> {
    return this.instanceOf(Error) as Pick<T extends Error ? T : Error>;
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
