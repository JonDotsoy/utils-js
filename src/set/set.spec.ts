import { test, expect } from "bun:test";
import { set } from "./set.js";

test("test", () => {
  const obj: any = {};

  set(obj, ["a", "b", "c"], 1);

  expect(obj.a.b.c).toBe(1);
});

test("test", () => {
  const obj: any = null;

  const e: any = set(obj, ["a", "b", "c"], 1);

  expect(obj).not.toEqual(e);
  expect(e.a.b.c).toBe(1);
});
