export class PipeAsync<T> {
  #value: Promise<T>;

  constructor(value: Promise<T>) {
    this.#value = value;
  }

  /**
   * Transforms the current value of the `PipeAsync` instance by applying the provided callback function.
   * The callback can return either a synchronous or asynchronous result.
   *
   * @template R - The type of the result after applying the callback function.
   * @param cb - A callback function that takes the current value of type `T` and returns a value of type `R` or a `Promise<R>`.
   * @returns A new `PipeAsync` instance containing the transformed value.
   */
  pipe<R>(cb: (value: T) => R | Promise<R>): PipeAsync<R> {
    const nextValue = this.#value.then((a) => cb(a));
    return new PipeAsync(nextValue);
  }

  /**
   * Attaches callbacks for the resolution and/or rejection of the promise.
   *
   * @typeParam TResult1 - The type of the value returned by the `onfulfilled` callback, or the type of the resolved value if `onfulfilled` is not provided.
   * @typeParam TResult2 - The type of the value returned by the `onrejected` callback, or the type of the rejected value if `onrejected` is not provided.
   *
   * @param onfulfilled - A callback to execute when the promise is resolved. This callback receives the resolved value as its argument.
   * @param onrejected - A callback to execute when the promise is rejected. This callback receives the reason for the rejection as its argument.
   *
   * @returns A new `Promise` that resolves to the return value of the `onfulfilled` callback if it is provided and the promise is resolved,
   * or to the return value of the `onrejected` callback if it is provided and the promise is rejected.
   */
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null,
  ): Promise<TResult1 | TResult2> {
    return this.#value.then(onfulfilled, onrejected);
  }

  valueOf() {
    return this.#value;
  }

  value() {
    return this.valueOf();
  }
}

export class Pipe<T> {
  #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  /**
   * Applies a transformation function to the current value in the pipe and returns a new pipe
   * with the transformed value. Supports both synchronous and asynchronous transformations.
   *
   * @template R - The return type of the callback function, which can be a value or a Promise.
   * @param cb - A callback function that takes the current value of the pipe and returns
   *             either a transformed value or a Promise resolving to a transformed value.
   * @returns A new pipe instance containing the transformed value. If the callback returns
   *          a Promise, the returned pipe will handle asynchronous operations.
   */
  pipe<R extends unknown | Promise<unknown>>(
    cb: (value: T) => R,
  ): R extends Promise<infer R> ? PipeAsync<R> : Pipe<R> {
    const nextValue = cb(this.#value);
    return makePipe(nextValue) as any;
  }

  /**
   * Attaches callbacks for the resolution and/or rejection of the promise.
   *
   * @typeParam TResult1 - The type of the value returned by the `onfulfilled` callback, or the type of the resolved value if `onfulfilled` is not provided.
   * @typeParam TResult2 - The type of the value returned by the `onrejected` callback, or the type of the rejected value if `onrejected` is not provided.
   *
   * @param onfulfilled - A callback to execute when the promise is resolved. This callback receives the resolved value as its argument.
   * @param onrejected - A callback to execute when the promise is rejected. This callback receives the reason for the rejection as its argument.
   *
   * @returns A new `Promise` that resolves to the return value of the `onfulfilled` callback if it is provided and the promise is resolved,
   * or to the return value of the `onrejected` callback if it is provided and the promise is rejected.
   */
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null,
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.#value).then(onfulfilled, onrejected);
  }

  valueOf() {
    return this.#value;
  }

  value() {
    return this.valueOf();
  }
}

type PipeResult<T> = T extends Promise<any> ? PipeAsync<Awaited<T>> : Pipe<T>;

const makePipe = <T extends unknown | Promise<unknown>>(
  initial: T,
): PipeResult<T> =>
  initial instanceof Promise
    ? (new PipeAsync(initial) as any)
    : (new Pipe(initial) as any);

/**
 * Creates a pipeline that allows chaining operations on a given initial value.
 *
 * @template T - The type of the initial value, which can be a synchronous value or a Promise.
 * @param initial - The initial value to start the pipeline with.
 * @returns A `PipeResult` instance that provides methods for chaining operations.
 *
 * @example
 * const a = 1;
 *
 * const b = pipe(a)
 *   .pipe(a => a + 1)
 *   .value();
 *
 * b // => 2;
 */
export const pipe = <T extends unknown | Promise<unknown>>(
  initial: T,
): PipeResult<T> => makePipe(initial);
