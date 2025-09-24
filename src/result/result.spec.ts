// @ts-nocheck
import { expect, test, mock, expectTypeOf } from "bun:test";
import { result, type deprecated_Result, Result } from "./result.js";
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

test("should create successful result with Result.ok()", async () => {
  const [error, value] = Result.ok(1);
  expect(error).toBeNull();
  expect(value).toEqual(1);
});

test("should create error result with Result.error()", async () => {
  const [error, value] = Result.error(new Error("Error"));
  expect(error).toBeInstanceOf(Error);
  expect(value).toBeNull();
});

test("should handle synchronous function with Result.try()", async () => {
  const [error, value] = Result.try(() => 1);
  expect(error).toEqual(null);
  expect(value).toEqual(1);
});

test("should handle asynchronous function with Result.try()", async () => {
  const [error, value] = await Result.try(async () => 1);
  expect(error).toEqual(null);
  expect(value).toEqual(1);
});

test("should handle Promise with Result.try()", async () => {
  const [error, value] = await Result.try(Promise.resolve(1));
  expect(error).toEqual(null);
  expect(value).toEqual(1);
});

test("should have correct types for synchronous Result.try()", async () => {
  const [error, value] = Result.try(() => 1);
  expectTypeOf(error).toEqualTypeOf<Error | null>();
  expectTypeOf(value).toEqualTypeOf<number | null>();
});

test("should have correct types for asynchronous Result.try()", async () => {
  const [error, value] = await Result.try(async () => 1);
  expectTypeOf(error).toEqualTypeOf<Error | null>();
  expectTypeOf(value).toEqualTypeOf<number | null>();
});

test("should have correct types for Promise Result.try()", async () => {
  const [error, value] = await Result.try(Promise.resolve(1));
  expectTypeOf(error).toEqualTypeOf<Error | null>();
  expectTypeOf(value).toEqualTypeOf<number | null>();
});

test("should handle function returning Promise with chained operations", async () => {
  const fetch = mock(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(1) }),
  );

  const [error, value] = await result(() => fetch().then((res) => res.json()));

  expect(error).toBeNull();
  expect(value).toEqual(1);
});

test("should handle Promise directly with chained operations", async () => {
  const fetch = mock(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(1) }),
  );

  const [error, value] = await result(fetch().then((res) => res.json()));

  expect(error).toBeNull();
  expect(value).toEqual(1);
});
