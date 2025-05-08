/**
 * Represents the basic primitive types in JavaScript.
 * These types are the fundamental building blocks of data in the language.
 *
 * - `"string"`: Represents textual data.
 * - `"number"`: Represents numeric data, including integers and floating-point numbers.
 * - `"boolean"`: Represents a logical value, either `true` or `false`.
 * - `"function"`: Represents a callable function.
 * - `"bigint"`: Represents large integers that are beyond the safe integer limit of `number`.
 * - `"symbol"`: Represents a unique and immutable value often used as object keys.
 */
type primitiveTypes =
  | "string"
  | "number"
  | "boolean"
  | "function"
  | "bigint"
  | "symbol";

/**
 * A utility type for retrieving a deeply nested property value from an object.
 *
 * @template T - The expected type of the property value.
 * @param obj - The object from which to retrieve the property value.
 * @param paths - A sequence of property keys representing the path to the desired property.
 * @returns The value of the property at the specified path, or `undefined` if the path does not exist.
 */
type ValueExtractor<T = unknown> = (
  obj: unknown,
  ...paths: PropertyKey[]
) => undefined | T;

const invokeSafely = <T>(cb: () => T) => {
  try {
    return cb();
  } catch (e) {
    return undefined;
  }
};

/**
 * Recursively retrieves a property from an object by following the specified path.
 *
 * @param {unknown} obj - The object to retrieve the property from.
 * @param {...PropertyKey[]} paths - The path(s) of properties to follow. If no paths are provided, returns the entire object.
 * @returns {unknown} The retrieved value or undefined if the path is invalid.
 */
export const get = (obj: unknown, ...paths: PropertyKey[]): unknown => {
  if (paths.length === 0) return obj;
  const isObj = typeof obj === "object" && obj !== null;
  if (!isObj) return undefined;
  const [path, ...nextPaths] = paths;
  return get(Reflect.get(obj, path), ...nextPaths);
};

const createValidatorPrimitiveType =
  <T>(type: primitiveTypes[number]): ValueExtractor<T> =>
  (obj: unknown, ...paths: PropertyKey[]): undefined | T => {
    const value = get(obj, ...paths);
    if (typeof value !== type) return undefined;
    return value as T;
  };

/**
 * Creates a custom type validator function that retrieves a value from an object
 * at the specified property paths and validates it using the provided test function.
 *
 * @template T - The expected type of the validated value.
 * @param test - A function that takes a value of unknown type and returns a boolean
 * indicating whether the value satisfies the desired condition.
 * @returns A function that takes an object and a sequence of property keys (paths),
 * retrieves the value at the specified path, validates it using the test function,
 * and returns the value cast to type `T` if valid, or `undefined` if invalid.
 *
 * @example
 * ```typescript
 * const isString = (value: unknown): value is string => typeof value === 'string';
 * const validateString = createValidatorCustomType<string>(isString);
 *
 * const obj = { a: { b: 'hello' } };
 * const result = validateString(obj, 'a', 'b'); // result: 'hello'
 *
 * const invalidResult = validateString(obj, 'a', 'c'); // invalidResult: undefined
 * ```
 */
const createValidatorCustomType =
  <T>(test: (value: unknown) => boolean): ValueExtractor<T> =>
  (obj: unknown, ...paths: PropertyKey[]): undefined | T => {
    const value = get(obj, ...paths);
    if (!test(value)) return undefined;
    return value as T;
  };

/** Validates that a value is an string */
const getString: ValueExtractor<string> =
  createValidatorPrimitiveType<string>("string");
/** Validates that a value is an number */
const getNumber: ValueExtractor<number> = (obj, ...paths) => {
  const value = get(obj, ...paths);
  if (typeof value === "number") return value;
  return invokeSafely(() => {
    const v = Number(value);
    if (isNaN(v)) return undefined;
    return v;
  });
};
/** Validates that a value is an boolean */
const getBoolean: ValueExtractor<boolean> =
  createValidatorPrimitiveType<boolean>("boolean");
/** Validates that a value is an function */
const getFunction: ValueExtractor<Function> =
  createValidatorPrimitiveType<Function>("function");
/** Validates that a value is an BigInt */
const getBigint: ValueExtractor<bigint> =
  createValidatorPrimitiveType<bigint>("bigint");
/** Validates that a value is an symbol */
const getSymbol: ValueExtractor<symbol> =
  createValidatorPrimitiveType<symbol>("symbol");
/** Validates that a value is an Array */
const getArray: ValueExtractor<Array<unknown>> = createValidatorCustomType<
  Array<unknown>
>((value) => Array.isArray(value));

/** Validates that a value is an Date */
/**
 * A custom validator function to check if a value is a valid date or a string
 * that can be parsed into a valid date. It also supports numeric values that
 * represent valid timestamps.
 *
 * @param value - The value to validate. It can be of type `Date`, `string`, or `number`.
 * @returns `true` if the value is a valid date, a parsable date string, or a valid timestamp; otherwise, `false`.
 */
const getDate = createValidatorCustomType<Date | string>((value) => {
  if (value instanceof Date) return true;
  if (typeof value === "string") return !isNaN(Date.parse(value));
  if (typeof value === "number") return !isNaN(value);
  return false;
});

/** Validates that a value is an object */
/**
 * A utility function that validates and extracts a value as a `Record<any, any>`.
 *
 * This function uses a custom validator to ensure the input value is an object
 * and not `null`. It is designed to work with the `ValueExtractor` type.
 *
 * @typeParam T - The type of the record's keys and values.
 *
 * @example
 * ```typescript
 * const result = getRecord({ key: "value" });
 * // result is a valid Record<any, any>
 * ```
 *
 * @returns A validated `Record<any, any>` if the input value passes the validation.
 */
const getRecord: ValueExtractor<Record<any, any>> = createValidatorCustomType<
  Record<any, any>
>((value) => typeof value === "object" && value !== null);

// Alias
/** Validates that a value is an object */
/**
 * Alias for the `getRecord` function.
 * Provides a shorthand reference to retrieve records or objects.
 */
const getObject = getRecord;

//
/**
 * Creates a type-safe value extractor by validating a value against a custom test function.
 *
 * @template T - The type of the value to be extracted.
 * @param test - A function that takes an unknown value and returns a boolean indicating
 * whether the value satisfies the desired condition.
 * @returns A `ValueExtractor` for the specified type `T` that uses the provided test function
 * to validate values.
 */
const getIs = <T>(test: (value: unknown) => boolean): ValueExtractor<T> =>
  createValidatorCustomType<T>(test);

get.string = getString;
get.number = getNumber;
get.boolean = getBoolean;
get.function = getFunction;
get.bigint = getBigint;
get.symbol = getSymbol;
get.array = getArray;
get.is = getIs;
get.date = getDate;
get.record = getRecord;
get.object = getObject;

export default get;
