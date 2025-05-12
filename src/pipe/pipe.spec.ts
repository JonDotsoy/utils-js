import { test, expect } from "bun:test";
import { pipe } from "./pipe.js";

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
