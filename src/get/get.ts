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

type types = "string" | "number" | "boolean" | "function" | "bigint" | "symbol";

const createValidatorPrimitiveType =
  <T>(type: types[number]) =>
  (obj: unknown, ...paths: PropertyKey[]): undefined | T => {
    const value = get(obj, ...paths);
    if (typeof value !== type) return undefined;
    return value as T;
  };

const createValidatorCustomType =
  <T>(test: (value: unknown) => boolean) =>
  (obj: unknown, ...paths: PropertyKey[]): undefined | T => {
    const value = get(obj, ...paths);
    if (!test(value)) return undefined;
    return value as T;
  };

/** Validates that a value is an string */
get.string = createValidatorPrimitiveType<string>("string");
/** Validates that a value is an number */
get.number = createValidatorPrimitiveType<number>("number");
/** Validates that a value is an boolean */
get.boolean = createValidatorPrimitiveType<boolean>("boolean");
/** Validates that a value is an function */
get.function = createValidatorPrimitiveType<Function>("function");
/** Validates that a value is an BigInt */
get.bigint = createValidatorPrimitiveType<bigint>("bigint");
/** Validates that a value is an symbol */
get.symbol = createValidatorPrimitiveType<symbol>("symbol");
/** Validates that a value is an Array */
get.array = createValidatorCustomType<Array<unknown>>((value) =>
  Array.isArray(value),
);

/** Validates that a value is an Date */
get.date = createValidatorCustomType<Date>((value) => {
  if (value instanceof Date) return true;
  if (typeof value === "string") return !isNaN(Date.parse(value));
  return false;
});

/** Validates that a value is an object */
get.record = createValidatorCustomType<Record<any, any>>(
  (value) => typeof value === "object" && value !== null,
);
