import type { Extension } from "typescript";
import { SymbolResult } from "../symbol-result/symbol-result.js";

type PairResult<T> = [null, T] | [Error, null];
type SPairResult<T> = PairResult<T> | [null, ObjectWithPairResultExpression<T>];
type FunctionExpression<T> = () => T;
type ObjectWithPairResultExpression<T> = {
  [SymbolResult]: () => SPairResult<T> | Promise<SPairResult<T>>;
};
type Expression<T> = ObjectWithPairResultExpression<T> | FunctionExpression<T>;

export type Result<T> =
  T extends Promise<any>
    ? Promise<PairResult<Awaited<T>>>
    : PairResult<Awaited<T>>;

type InferValue<T> =
  T extends FunctionExpression<infer R>
    ? Awaited<R>
    : T extends [any, { [SymbolResult]: () => infer R }]
      ? InferValue<Awaited<R>>
      : T extends { [SymbolResult]: () => infer R }
        ? InferValue<Awaited<R>>
        : T extends (infer R)[]
          ? InferValue<Exclude<Awaited<R>, null>>
          : T;

export type ValueResult<T> = [null, InferValue<T>] | [Error, null];

const isObjectWithPairResultExpression = <T>(
  expression: Expression<T>,
): expression is ObjectWithPairResultExpression<T> =>
  typeof expression === "object" &&
  expression !== null &&
  typeof expression[SymbolResult] === "function";

const executeSPairResult = ([error, value]: SPairResult<any>): any => {
  if (isObjectWithPairResultExpression(value)) {
    return executePairResultExpression(value);
  }
  return [error, value];
};

const executePairResultExpression = <T>(
  expression: ObjectWithPairResultExpression<T>,
) => {
  const valueResult = expression[SymbolResult]();
  if (valueResult instanceof Promise) {
    return valueResult
      .then((value) => executeSPairResult(value))
      .catch((error) => [error, null]);
  }
  return executeSPairResult(valueResult);
};

const executeFunctionExpression = <T>(expression: FunctionExpression<T>) => {
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
    if (isObjectWithPairResultExpression(expression)) {
      return executePairResultExpression(expression);
    }
    return executeFunctionExpression(expression);
  };
};

/**
 * @example
 * const asyncExpression = () => fetch("https://example.com");
 *
 * const [error, response] = await result(asyncExpression);
 *
 * if (error) {
 *   console.error(error);
 *   return;
 * }
 */
export const result: <T, E extends Expression<T>>(
  expression: E,
) => ValueResult<E> = makeResolveExpression();
