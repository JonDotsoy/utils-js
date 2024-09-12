import { test, expect } from "bun:test";
import { set } from "./set.js";

test("should set a value at a specified path within a nested object", () => {
  const data: any = {};

  set(data, ["a", "b", "c"], 1);

  expect(data.a.b.c).toBe(1);
});

test("should create a new object if the original object is null", () => {
  const data: any = null;

  const e: any = set(data, ["a", "b", "c"], 1);

  expect(data).not.toEqual(e);
  expect(e.a.b.c).toBe(1);
});

test("should modify an existing value at a specified path", () => {
  const data: any = { a: { b: 1 } };
  set(data, ["a", "b"], 2);
  expect(data).toEqual({ a: { b: 2 } });
});

test("should create missing objects along the path", () => {
  const data: any = { a: { b: 1 } };
  set(data, ["a", "c", "d"], 3);
  expect(data).toEqual({ a: { b: 1, c: { d: 3 } } });
});
