import { expect, test } from "bun:test";
import { result, type Result } from "./result.js";
import { SymbolResult } from "../symbol-result/symbol-result.js";

test("should handle synchronous function and return value without error", async () => {
  const expression = () => 1;

  const [error, value] = result(expression);

  expect(error).toBeNull();
  expect(value).toEqual(1);
});

test("should handle asynchronous function and return resolved value without error", async () => {
  const expression = () => Promise.resolve(1);

  const [error, value] = await result(expression);

  expect(error).toBeNull();
  expect(value).toEqual(1);
});

test("should handle object with SymbolResult async method and return resolved value without error", async () => {
  const expression = {
    [SymbolResult]: async () => [null, 1] satisfies Result<any>,
  };

  const [error, value] = await result(expression);

  expect(error).toBeNull();
  expect(value).toEqual(1);
});

test("should handle object with SymbolResult sync method and return value without error", async () => {
  const expression = { [SymbolResult]: (): Result<1> => [null, 1] };

  const [error, value] = result(expression);

  expect(error).toBeNull();
  expect(value).toEqual(1);
});

test("should handle object with SymbolResult async arrow function and return resolved value without error", async () => {
  const expression = { [SymbolResult]: async () => [null, 1] as Result<1> };

  const [error, value] = await result(expression);

  expect(error).toBeNull();
  expect(value).toEqual(1);
});

test("should handle thrown error in SymbolResult async method and return error with null value", async () => {
  const expression = {
    [SymbolResult]: async (): Promise<Result<number>> => {
      throw new Error("Error");
    },
  };

  const [error, value] = await result(expression);

  expect(error).toBeInstanceOf(Error);
  expect(value).toBeNull();
});

test("should handle nested SymbolResult with single level and return correct value", async () => {
  const expression = {
    [SymbolResult]: async () => {
      return [null, 3] satisfies Result<any>;
    },
  };

  const [error, value] = await result(expression);

  expect(error).toBeNull();
  expect(value).toEqual(3);
});

test("should handle nested SymbolResult with two levels and return correct value", async () => {
  const expression = {
    [SymbolResult]: async () => {
      return [
        null,
        {
          [SymbolResult]: () => {
            return [null, 3];
          },
        },
      ] satisfies Result<any>;
    },
  };

  const [error, value] = await result(expression);

  expect(error).toBeNull();
  expect(value).toEqual(3);
});

test("should handle nested SymbolResult with three levels and return correct value", async () => {
  const expression = {
    [SymbolResult]: async () => {
      return [
        null,
        {
          [SymbolResult]: () => {
            return [
              null,
              {
                [SymbolResult]: async () => {
                  return [null, 3];
                },
              },
            ];
          },
        },
      ] satisfies Result<any>;
    },
  };

  const [error, value] = await result(expression);

  expect(error).toBeNull();
  expect(value).toEqual(3);
});
