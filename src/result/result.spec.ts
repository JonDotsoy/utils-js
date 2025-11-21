import { expect, test, mock, expectTypeOf } from "bun:test";
import { result, Result, type GenericResult } from "./result.js";

test("should handle synchronous function and return value without error", async () => {
  const expression = () => 1;

  const [ok, error, value] = result(expression);

  expect(ok).toBe(true);
  expect(error).toBeNull();
  expect(value).toEqual(1);
});

test("should handle asynchronous function and return resolved value without error", async () => {
  const expression = () => Promise.resolve(1);

  const [ok, error, value] = await result(expression);

  expect(ok).toBe(true);
  expect(error).toBeNull();
  expect(value).toEqual(1);
});

test("should create successful result with Result.ok()", async () => {
  const [ok, error, value] = Result.ok(1);

  expect(ok).toBe(true);
  expect(error).toBeNull();
  expect(value).toEqual(1);
});

test("should create error result with Result.error()", async () => {
  const [ok, error, value] = Result.error(new Error("Error"));
  expect(ok).toBe(false);
  expect(error).toBeInstanceOf(Error);
  expect(value).toBeNull();
});

test("should handle synchronous function with Result.try()", async () => {
  const [ok, error, value] = Result.try(() => 1);

  expect(ok).toBe(true);
  expect(error).toEqual(null);
  expect(value).toEqual(1);
});

test("should handle asynchronous function with Result.try()", async () => {
  const [ok, error, value] = await Result.try(async () => 1);

  expect(ok).toBe(true);
  expect(error).toEqual(null);
  expect(value).toEqual(1);
});

test("should handle Promise with Result.try()", async () => {
  const [ok, error, value] = await Result.try(Promise.resolve(1));

  expect(ok).toBe(true);
  expect(error).toEqual(null);
  expect(value).toEqual(1);
});

test("should have correct types for synchronous Result.try()", async () => {
  const [ok, error, value] = Result.try(() => 1);
  expectTypeOf(error).toEqualTypeOf<unknown>();
  expectTypeOf(value).toEqualTypeOf<number | null>();
});

test("should have correct types for asynchronous Result.try()", async () => {
  const [ok, error, value] = await Result.try(async () => 1);
  expectTypeOf(error).toEqualTypeOf<unknown>();
  expectTypeOf(value).toEqualTypeOf<number | null>();
});

test("should have correct types for Promise Result.try()", async () => {
  const [ok, error, value] = await Result.try(Promise.resolve(1));
  expectTypeOf(error).toEqualTypeOf<unknown>();
  expectTypeOf(value).toEqualTypeOf<number | null>();
});

test("should handle function returning Promise with chained operations", async () => {
  const fetch = mock(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(1) }),
  );

  const [ok, error, value] = await result(() =>
    fetch().then((res) => res.json()),
  );

  expect(ok).toBe(true);
  expect(error).toBeNull();
  expect(value).toEqual(1);
});

test("should handle Promise directly with chained operations", async () => {
  const fetch = mock(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(1) }),
  );

  const [ok, error, value] = await result(fetch().then((res) => res.json()));

  expect(ok).toBe(true);
  expect(error).toBeNull();
  expect(value).toEqual(1);
});

test("should have correct value type for Result.ok()", async () => {
  const res = Result.ok(1);
  expectTypeOf(res.value).toEqualTypeOf<number>();
});

test("should have correct value type for synchronous result() function", async () => {
  const res = result(() => 1);
  expectTypeOf(res.value).toEqualTypeOf<number | null>();
});

test("should have correct error type for Result.error()", async () => {
  const res = Result.error(new Error("Error"));
  expectTypeOf(res.error).toEqualTypeOf<Error>();
});

test("should have correct error type for synchronous result() function", async () => {
  const res = result(() => 1);
  expectTypeOf(res.error).toEqualTypeOf<unknown>();
});

test("should handle function with arguments using result()", async () => {
  const res = await result(JSON.parse, '{"key": "value"}');

  expectTypeOf(res).toEqualTypeOf<GenericResult<unknown, unknown>>();
  expect(res.value).toEqual({ key: "value" });
});

test("should handle function that parses JSON successfully", async () => {
  const res = await result(() => JSON.parse('{"key": "value"}'));

  expectTypeOf(res).toEqualTypeOf<GenericResult<unknown, unknown>>();
  expect(res.value).toEqual({ key: "value" });
});

test("should catch and wrap thrown errors in result()", () => {
  const res = result((): number => {
    throw new Error("Failure");
  });

  expectTypeOf(res).toEqualTypeOf<GenericResult<unknown, number>>();
  expect(res.error).toBeInstanceOf(Error);
});
