import { expect, test } from "bun:test";
import { result } from "./result.js";
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
  const expression = { [SymbolResult]: () => Promise.resolve(1) };

  const [error, value] = await result(expression);

  expect(error).toBeNull();
  expect(value).toEqual(1);
});

test("should handle object with SymbolResult sync method and return value without error", async () => {
  const expression = { [SymbolResult]: () => 1 };

  const [error, value] = result(expression);

  expect(error).toBeNull();
  expect(value).toEqual(1);
});

test("should handle object with SymbolResult async arrow function and return resolved value without error", async () => {
  const expression = { [SymbolResult]: async () => 1 };

  const [error, value] = await result(expression);

  expect(error).toBeNull();
  expect(value).toEqual(1);
});

test("should handle thrown error in SymbolResult async method and return error with null value", async () => {
  const expression = {
    [SymbolResult]: async (): Promise<number> => {
      throw new Error("Error");
    },
  };

  const [error, value] = await result(expression);

  expect(error).toBeInstanceOf(Error);
  expect(value).toBeNull();
});
