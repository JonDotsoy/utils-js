export type TryReturnType<T> =
  T extends Promise<infer V>
    ? Promise<GenericResult<unknown, Awaited<V>>>
    : T extends (...args: infer P) => Promise<infer U>
      ? Promise<GenericResult<unknown, Awaited<U>>>
      : T extends (...args: infer P) => infer U
        ? GenericResult<unknown, U>
        : GenericResult<unknown, any>;

/**
 * Represents a successful result with a value and no error.
 * Can be destructured as [ok, error, value] where ok is true and error is null.
 */
export type OkResult<T> = [true, null, T] & { ok: true; error: null; value: T };

/**
 * Represents an error result with an error and no value.
 * Can be destructured as [ok, error, value] where ok is false and value is null.
 */
export type ErrorResult<E> = [false, E, null] & {
  ok: false;
  error: E;
  value: null;
};

/**
 * Union type representing either a successful result or an error result.
 * @template E The error type
 * @template T The success value type
 */
export type GenericResult<E, T> = OkResult<T> | ErrorResult<E>;

/**
 * A Result class that encapsulates either a successful value or an error.
 * Results can be destructured as tuples [ok, error, value] and provide type-safe error handling.
 *
 * @template O The ok status type (boolean)
 * @template E The error type
 * @template T The success value type
 *
 * @example
 * // Synchronous function
 * const [ok, error, value] = Result.try(() => JSON.parse('{}'));
 *
 * @example
 * // Asynchronous function
 * const [ok, error, value] = await Result.try(async () => fetch('/api/data'));
 *
 * @example
 * // Direct Promise
 * const [ok, error, value] = await Result.try(Promise.resolve(42));
 *
 * @example
 * // Creating results manually
 * const success = Result.ok(42);
 * const failure = Result.error(new Error('Something went wrong'));
 */
export class Result<O extends boolean, E, T> {
  /**
   * Creates a new Result instance.
   * @param ok The success status (true if successful, false if error)
   * @param error The error value (null if successful)
   * @param value The success value (null if error)
   */
  constructor(
    readonly ok: O,
    readonly error: E,
    readonly value: T,
  ) {}

  *[Symbol.iterator](): Generator<E | T, void, unknown> {
    yield this.error;
    yield this.value;
  }

  /**
   * Creates a successful result with the given value.
   * @template T The type of the success value
   * @param value The success value
   * @returns An OkResult that can be destructured as [ok, error, value]
   *
   * @example
   * const [ok, error, value] = Result.ok(42);
   * console.log(ok); // true
   * console.log(error); // null
   * console.log(value); // 42
   */
  static ok = <T>(value: T): OkResult<T> => {
    return new Result<true, null, T>(true, null, value) as any;
  };

  /**
   * Creates an error result with the given error.
   * @template E The type of the error
   * @param error The error value
   * @returns An ErrorResult that can be destructured as [ok, error, value]
   *
   * @example
   * const [ok, error, value] = Result.error(new Error('Failed'));
   * console.log(ok); // false
   * console.log(error); // Error: Failed
   * console.log(value); // null
   */
  static error = <E>(error: E): ErrorResult<E> => {
    return new Result<false, E, null>(false, error, null) as any;
  };

  private static tryPromise = async <V>(value: Promise<V>) => {
    try {
      const resolved = await value;
      return Result.ok(resolved);
    } catch (error) {
      return Result.error(error as Error);
    }
  };

  /**
   * Safely executes a function, Promise, or async function and returns a Result.
   * Catches any thrown errors and wraps them in an ErrorResult.
   *
   * @template T The input type (Promise, function, or async function)
   * @param value The Promise, function, or async function to execute
   * @param params Additional parameters to pass to the function (if applicable)
   * @returns A Result that can be destructured as [ok, error, value]
   *
   * @example
   * // Synchronous function
   * const [ok, error, value] = Result.try(() => JSON.parse('{}'));
   * if (!ok) {
   *   console.error('Parse failed:', error.message);
   * } else {
   *   console.log('Parsed:', value);
   * }
   *
   * @example
   * // Asynchronous function
   * const [ok, error, data] = await Result.try(async () => {
   *   const response = await fetch('/api/data');
   *   return response.json();
   * });
   *
   * @example
   * // Direct Promise
   * const [ok, error, result] = await Result.try(Promise.resolve(42));
   *
   * @example
   * // Function with parameters
   * const [ok, error, parsed] = Result.try(JSON.parse, '{"key": "value"}');
   *
   * @example
   * // Chained Promise operations
   * const [ok, error, data] = await Result.try(
   *   fetch('/api/data').then(res => res.json())
   * );
   */
  static try = <
    T extends
      | Promise<unknown>
      | ((...args: any[]) => unknown | Promise<unknown>),
  >(
    value: T,
    ...params: T extends (...args: infer P) => any ? P : []
  ): TryReturnType<T> => {
    try {
      if (value instanceof Promise) {
        return this.tryPromise(value) as any;
      }
      const pending = value(...params);
      if (pending instanceof Promise) {
        return this.tryPromise(pending) as any;
      }
      return Result.ok(pending) as any;
    } catch (error) {
      return Result.error(error as Error) as any;
    }
  };

  /**
   * Type guard to check if a value is a Result instance.
   * @param value The value to check
   * @returns True if the value is a Result instance
   *
   * @example
   * const maybeResult = getSomeValue();
   * if (Result.isResult(maybeResult)) {
   *   // TypeScript now knows maybeResult is a Result
   *   const [ok, error, value] = maybeResult;
   * }
   */
  static isResult(value: unknown): value is Result<boolean, any, any> {
    return value instanceof Result;
  }
}

/**
 * Convenience alias for Result.try. Safely executes functions, Promises, or async functions
 * and returns a Result that can be destructured as [ok, error, value].
 *
 * This function provides a clean, functional approach to error handling without try-catch blocks.
 *
 * @example
 * // Synchronous operation
 * const [ok, parseError, data] = result(() => JSON.parse(jsonString));
 * if (!ok) {
 *   console.error('JSON parsing failed:', parseError.message);
 *   return;
 * }
 * console.log('Parsed data:', data);
 *
 * @example
 * // Asynchronous operation
 * const [ok, fetchError, response] = await result(async () => {
 *   const res = await fetch('/api/users');
 *   return res.json();
 * });
 *
 * @example
 * // Direct Promise handling
 * const [ok, promiseError, value] = await result(Promise.resolve(42));
 *
 * @example
 * // Function with parameters
 * const [ok, error, parsed] = result(JSON.parse, '{"name": "John"}');
 *
 * @example
 * // Complex async chain
 * const [ok, error, userData] = await result(
 *   fetch('/api/user/123')
 *     .then(res => res.json())
 *     .then(user => ({ ...user, fullName: `${user.first} ${user.last}` }))
 * );
 *
 * @see {@link Result.try} for the underlying implementation
 */
export const result = Result.try;

/**
 * Convenience alias for Result.ok. Creates a successful result with the given value.
 * @see {@link Result.ok} for the underlying implementation
 */
export const ok = Result.ok;

/**
 * Convenience alias for Result.error. Creates an error result with the given error.
 * @see {@link Result.error} for the underlying implementation
 */
export const error = Result.error;
