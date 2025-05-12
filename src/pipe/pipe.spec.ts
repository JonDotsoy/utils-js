import { test, expect } from "bun:test";
import { pipe, type Pipe, type PipeAsync } from "./pipe.js";
import { expectTypeOf } from "expect-type";

test("should return the final result", () => {
  const a = 1;

  const b = pipe(a)
    .pipe((a) => a + 1)
    .value();

  expect(b).toEqual(2);
});

test("should return the final result async", async () => {
  const a = 1;

  const b = await pipe(a)
    .pipe((a) => a + 1)
    .pipe(async (a) => a + 1)
    .pipe((a) => a + 1)
    .value();

  expect(b).toEqual(4);
});
test("should handle multiple synchronous pipes", () => {
  const a = 2;

  const b = pipe(a)
    .pipe((a) => a * 2)
    .pipe((a) => a + 3)
    .pipe((a) => a - 1)
    .value();

  expect(b).toEqual(6);
});

test("should handle multiple asynchronous pipes", async () => {
  const a = 3;

  const b = await pipe(a)
    .pipe(async (a) => a * 2)
    .pipe(async (a) => a + 4)
    .pipe(async (a) => a - 3)
    .value();

  expect(b).toEqual(7);
});

test("should handle mixed synchronous and asynchronous pipes", async () => {
  const a = 5;

  const b = await pipe(a)
    .pipe((a) => a * 2)
    .pipe(async (a) => a + 11)
    .pipe((a) => a / 3)
    .value();

  expect(b).toEqual(7);
});

test("should work with initial promise value", async () => {
  const a = Promise.resolve(4);

  const b = await pipe(a)
    .pipe((a) => a + 2)
    .pipe(async (a) => a * 3)
    .value();

  expect(b).toEqual(18);
});

test("should handle no transformations", () => {
  const a = 7;

  const b = pipe(a).value();

  expect(b).toEqual(7);
});

test("should handle no transformations with async value", async () => {
  const a = Promise.resolve(8);

  const b = await pipe(a).value();

  expect(b).toEqual(8);
});

test("should handle then method with synchronous value", () => {
  const a = 10;

  const result = pipe(a).then((value) => value * 2);

  return result.then((b) => {
    expect(b).toEqual(20);
  });
});

test("should handle then method with asynchronous value", async () => {
  const a = Promise.resolve(15);

  const result = pipe(a).then((value) => value + 5);

  const b = await result;
  expect(b).toEqual(20);
});

test("should handle then method with rejection", async () => {
  const a = Promise.reject("Error");

  const result = pipe(a).then(
    () => "Success",
    (reason) => reason,
  );

  const b = await result;
  expect(b).toEqual("Error");
});

test("should chain then calls with synchronous values", () => {
  const a = 5;

  const result = pipe(a)
    .then((value) => value + 3)
    .then((value) => value * 2);

  return result.then((b) => {
    expect(b).toEqual(16);
  });
});

test("should chain then calls with asynchronous values", async () => {
  const a = Promise.resolve(7);

  const result = pipe(a)
    .then((value) => value - 2)
    .then((value) => Promise.resolve(value * 3));

  const b = await result;
  expect(b).toEqual(15);
});

test("should handle synchronous pipes without using value()", async () => {
  const a = 3;

  const result = await pipe(a)
    .pipe((a) => a + 2)
    .pipe((a) => a * 3);

  expect(result).toEqual(15);
});

test("should handle asynchronous pipes without using value()", async () => {
  const a = 4;

  const result = pipe(a)
    .pipe(async (a) => a * 2)
    .pipe(async (a) => a + 5);

  const b = await result;
  expect(b).toEqual(13);
});

test("should handle mixed synchronous and asynchronous pipes without using value()", async () => {
  const a = 6;

  const result = await pipe(a)
    .pipe((a) => a - 1)
    .pipe(async (a) => a * 2)
    .pipe((a) => a + 3);

  expect(result).toEqual(13);
});

test("should handle initial promise value without using value()", async () => {
  const a = Promise.resolve(5);

  const result = pipe(a)
    .pipe((a) => a + 3)
    .pipe(async (a) => a * 2);

  const b = await result;
  expect(b).toEqual(16);
});

test("should handle no transformations without using value()", async () => {
  const a = 9;

  const result = await pipe(a);

  expect(result).toEqual(9);
});

test("should handle no transformations with async value without using value()", async () => {
  const a = Promise.resolve(10);

  const result = pipe(a);

  const b = await result;
  expect(b).toEqual(10);
});

test("should infer correct type for synchronous pipe", () => {
  const a = 1;

  const result = pipe(a)
    .pipe((a) => a + 1)
    .pipe((a) => a.toString());

  expectTypeOf(result).toEqualTypeOf<Pipe<string>>();
});

test("should infer correct type for asynchronous pipe", async () => {
  const a = 1;

  const result = pipe(a)
    .pipe(async (a) => a + 1)
    .pipe(async (a) => a.toString());

  expectTypeOf(result).toEqualTypeOf<PipeAsync<string>>();
});

test("should infer correct type for mixed synchronous and asynchronous pipe", async () => {
  const a = 1;

  const result = pipe(a)
    .pipe((a) => a + 1)
    .pipe(async (a) => a.toString())
    .pipe((a) => a.length);

  expectTypeOf(result).toEqualTypeOf<PipeAsync<number>>();
});

test("should infer correct type for initial promise value", async () => {
  const a = Promise.resolve(1);

  const result = pipe(a)
    .pipe((a) => a + 1)
    .pipe(async (a) => a.toString());

  expectTypeOf(result).toEqualTypeOf<PipeAsync<string>>();
});

test("should infer correct type for no transformations", () => {
  const a = 1;

  const result = pipe(a);

  expectTypeOf(result).toEqualTypeOf<Pipe<number>>();
});

test("should infer correct type for no transformations with async value", async () => {
  const a = Promise.resolve(1);

  const result = pipe(a);

  expectTypeOf(result).toEqualTypeOf<PipeAsync<number>>();
});

test("should infer correct type for await pipe with synchronous value", async () => {
  const a = 1;

  const result = await pipe(a);

  expectTypeOf(result).toEqualTypeOf<number>();
});

test("should infer correct type for await pipe with asynchronous value", async () => {
  const a = Promise.resolve(1);

  const result = await pipe(a);

  expectTypeOf(result).toEqualTypeOf<number>();
});
