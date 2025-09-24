type OkResult<T> = [null, T] & { error: null; value: T };
type ErrorResult<E> = [E, null] & { error: E; value: null };
type GenericResult<E, T> = OkResult<T> | ErrorResult<E>;

export class Result<E, T> {
  constructor(
    public error: E,
    public value: T,
  ) {}

  *[Symbol.iterator](): Generator<E | T, void, unknown> {
    yield this.error;
    yield this.value;
  }

  static ok<T>(value: T): OkResult<T> {
    return new Result<null, T>(null, value) as any;
  }

  static error<E>(error: E): ErrorResult<E> {
    return new Result<E, null>(error, null) as any;
  }

  private static tryPromise = async <V>(value: Promise<V>) => {
    try {
      const resolved = await value;
      return Result.ok(resolved);
    } catch (error) {
      return Result.error(error as Error);
    }
  };

  static try = <
    V extends Promise<unknown> | (() => unknown | Promise<unknown>),
  >(
    value: V,
  ): V extends Promise<infer R>
    ? Promise<GenericResult<Error, Awaited<R>>>
    : V extends () => Promise<infer R>
      ? Promise<GenericResult<Error, Awaited<R>>>
      : V extends () => infer R
        ? GenericResult<Error, Awaited<R>>
        : never => {
    try {
      if (value instanceof Promise) {
        return this.tryPromise(value) as any;
      }
      const pending = value();
      if (pending instanceof Promise) {
        return this.tryPromise(pending) as any;
      }
      return Result.ok(pending) as any;
    } catch (error) {
      return Result.error(error as Error) as any;
    }
  };

  static isResult(value: unknown): value is Result<any, any> {
    return value instanceof Result;
  }
}

export const result = Result.try;
