import { SymbolResult } from "../symbol-result/symbol-result.js";

type PairResult<T> = [null, T] | [Error, null];
type Result<T> =
  T extends Promise<any>
    ? Promise<PairResult<Awaited<T>>>
    : PairResult<Awaited<T>>;
type FunctionExpression<T> = () => T;
type ObjectExpression<T> = { [SymbolResult]: FunctionExpression<T> };
type Expression<T> = ObjectExpression<T> | FunctionExpression<T>;

const isObjectExpression = <T>(
  expression: Expression<T>,
): expression is ObjectExpression<T> =>
  typeof expression === "object" &&
  expression !== null &&
  typeof expression[SymbolResult] === "function";

const executeExpression = <T>(expression: FunctionExpression<T>) => {
  try {
    const valueResult = expression();
    if (valueResult instanceof Promise) {
      return valueResult
        .then((value) => [null, value])
        .catch((error) => [error, null]);
    }
    return [null, valueResult];
  } catch (error) {
    return [error, null];
  }
};

const makeResolveExpression = () => {
  return <T>(expression: Expression<T>): any => {
    const realExpression = isObjectExpression(expression)
      ? expression[SymbolResult]
      : expression;
    return executeExpression(realExpression);
  };
};

/**
 * @example
 * const asyncExpression = fetch("https://example.com");
 *
 * const [error, response] = await result(asyncExpression);
 *
 * if (error) {
 *   console.error(error);
 *   return;
 * }
 */
export const result: <T>(expression: Expression<T>) => Result<T> =
  makeResolveExpression();
