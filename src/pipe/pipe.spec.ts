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
