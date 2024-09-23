class PipeAsync<T> {
  #value: Promise<T>;

  constructor(value: Promise<T>) {
    this.#value = value;
  }

  pipe<R>(cb: (value: T) => R | Promise<R>): PipeAsync<R> {
    const nextValue = this.#value.then((a) => cb(a));
    return new PipeAsync(nextValue);
  }

  valueOf() {
    return this.#value;
  }

  value() {
    return this.valueOf();
  }
}

class Pipe<T> {
  #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  pipe<R extends unknown | Promise<unknown>>(
    cb: (value: T) => R,
  ): R extends Promise<infer R> ? PipeAsync<R> : Pipe<R> {
    const nextValue = cb(this.#value);
    return makePipe(nextValue) as any;
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
