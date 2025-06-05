import { expect, test } from "bun:test";
import { get } from "./get.js";
import { z } from "zod/v4";

test("should return undefined when value is not a string", () => {
  const obj = { key: 3 };
  expect(get.string(obj, "key")).toBeUndefined();
});

test("should return the value as a string", () => {
  const obj = { key: "value" };
  expect(get.string(obj, "key")).toBe("value");
});

test("should return undefined when value is not a number", () => {
  const obj = { key: "value" };
  expect(get.number(obj, "key")).toBeUndefined();
});

test("should return the value as a number", () => {
  const obj = { key: 42 };
  expect(get.number(obj, "key")).toBe(42);
});

test("should return undefined when value is not a boolean", () => {
  const obj = { key: "true" };
  expect(get.boolean(obj, "key")).toBeUndefined();
});

test("should return the value as a boolean", () => {
  const obj = { key: false };
  expect(get.boolean(obj, "key")).toBe(false);
});

test("should return undefined when value is not a function", () => {
  const obj = { key: "value" };
  expect(get.function(obj, "key")).toBeUndefined();
});

test("should return the value as a function", () => {
  const obj = { key: () => {} };
  expect(get.function(obj, "key")).toBeInstanceOf(Function);
});

test("should return undefined when value is not a bigint", () => {
  const obj = { key: true };
  expect(get.bigint(obj, "key")).toBeUndefined();
});

test("should return the value as a bigint", () => {
  const obj = { key: 42n };
  expect(get.bigint(obj, "key")).toBe(42n);
});

test("should return undefined when value is not an array", () => {
  const obj = { key: true };
  expect(get.array(obj, "key")).toBeUndefined();
});

test("should return the value as an array", () => {
  const obj = { key: [1, 2, 3] };
  expect(get.array(obj, "key")).toEqual([1, 2, 3]);
});

test("should return undefined when value is not a symbol", () => {
  const obj = { key: true };
  expect(get.symbol(obj, "key")).toBeUndefined();
});

test("should return the value as a symbol", () => {
  const obj = { key: Symbol() };
  expect(get.symbol(obj, "key")).toBeSymbol();
});

test("should return undefined when value is not a date", () => {
  const obj = { key: true };
  expect(get.date(obj, "key")).toBeUndefined();
});

test("should return a Date instance when the value is a valid Date object", () => {
  const obj = { key: new Date("2022-01-01T00:00:00Z") };
  expect(get.date(obj, "key")).toBeInstanceOf(Date);
});

test("should return a Date instance when the value is a valid ISO date string", () => {
  const obj = { key: "2022-01-01T00:00:00Z" };
  expect(get.date(obj, "key")).toBeInstanceOf(Date);
});

test("should return a Date instance when the value is a valid timestamp", () => {
  const obj = { key: 12333553242 };
  expect(get.date(obj, "key")).toBeInstanceOf(Date);
});

test("should return undefined when value is an invalid date string", () => {
  const obj = { key: "invalid-date" };
  expect(get.date(obj, "key")).toBeUndefined();
});

test("should return the value as a date when value is a valid timestamp", () => {
  const obj = { key: 1640995200000 };
  expect(get.date(obj, "key")?.toISOString()).toBe("2022-01-01T00:00:00.000Z");
});

test("should return undefined when value is not a valid date for ISO string", () => {
  const obj = { key: "invalid-date" };
  expect(get.isoStringDate(obj, "key")).toBeUndefined();
});

test("should return ISO string when value is a valid Date object", () => {
  const obj = { key: new Date("2022-01-01T00:00:00Z") };
  expect(get.isoStringDate(obj, "key")).toBe("2022-01-01T00:00:00.000Z");
});

test("should return ISO string when value is a valid ISO date string", () => {
  const obj = { key: "2022-01-01T00:00:00Z" };
  expect(get.isoStringDate(obj, "key")).toBe("2022-01-01T00:00:00.000Z");
});

test("should return ISO string when value is a valid timestamp", () => {
  const obj = { key: 1640995200000 };
  expect(get.isoStringDate(obj, "key")).toBe("2022-01-01T00:00:00.000Z");
});

test("should return undefined when value is not a valid date for numberDate", () => {
  const obj = { key: "invalid-date" };
  expect(get.numberDate(obj, "key")).toBeUndefined();
});

test("should return timestamp when value is a valid Date object", () => {
  const obj = { key: new Date("2022-01-01T00:00:00Z") };
  expect(get.numberDate(obj, "key")).toBe(1640995200000);
});

test("should return timestamp when value is a valid ISO date string", () => {
  const obj = { key: "2022-01-01T00:00:00Z" };
  expect(get.numberDate(obj, "key")).toBe(1640995200000);
});

test("should return timestamp when value is a valid timestamp", () => {
  const obj = { key: 1640995200000 };
  expect(get.numberDate(obj, "key")).toBe(1640995200000);
});

test("should return undefined when value is not a number or date for numberDate", () => {
  const obj = { key: true };
  expect(get.numberDate(obj, "key")).toBeUndefined();
});

test("should return the value as a date", () => {
  const obj = { key: "2022-01-01" };
  expect(new Date(get.date(obj, "key")!)?.toUTCString()).toEqual(
    "Sat, 01 Jan 2022 00:00:00 GMT",
  );
});

test("should return undefined when value is not an object", () => {
  const obj = { key: true };
  expect(get.record(obj, "key")).toBeUndefined();
});

test("should return the value as an object", () => {
  const obj = { key: { a: 1, b: 2 } };
  expect(get.record(obj, "key")).toEqual({ a: 1, b: 2 });
});

test("should return the value as an object", () => {
  const obj = { key: { key: { a: 1, b: 2 } } };
  expect(get.record(obj, "key", "key")).toEqual({ a: 1, b: 2 });
});

test("should parse a string to a number", () => {
  const obj = { key: "3" };
  expect(get.number(obj, "key")).toBe(3);
});

test("should return the value as a bigint when key is '1234'", () => {
  const obj = { "1234": 1234n };
  expect(get.bigint(obj, "1234")).toBe(1234n);
});

test("should return the value as a number when key is '123.4231'", () => {
  const obj = { key: "123.4231" };
  expect(get.number(obj, "key")).toBe(123.4231);
});

test("should return undefined when value is a malformed float string", () => {
  const obj = { key: "123.42.31" };
  expect(get.number(obj, "key")).toBeUndefined();
});

test("should extract and return value using get.parse with zod", () => {
  const obj = { val: 32 };
  const value = get.parse(
    obj,
    z.object({ val: z.number() }).transform((e) => e.val),
  );

  expect(value).toEqual(32);
});

test("should return the value when custom predicate returns true (get.is)", () => {
  const isEven = (v: unknown): v is number =>
    typeof v === "number" && v % 2 === 0;
  const getEven = get.is(isEven);
  const obj = { n: 4, m: 3 };
  expect(getEven(obj, "n")).toBe(4);
  expect(getEven(obj, "m")).toBeUndefined();
});

test("should extract and transform value using get.parse with zod", () => {
  const obj = { val: 32 };
  const result = get.parse(
    obj,
    z.object({ val: z.number() }).transform((e) => e.val),
  );
  expect(result).toBe(32);
});

test("should return undefined if zod parse fails in get.parse", () => {
  const obj = { val: "not-a-number" };
  const result = get.parse(
    obj,
    z.object({ val: z.number() }).transform((e) => e.val),
  );
  expect(result).toBeUndefined();
});

test("should extract value using get.parse with a custom safeParse object (success, strict ParseResult)", () => {
  const obj = { foo: 123 };
  const customParser = {
    safeParse(v: any) {
      if (v && typeof v.foo === "number") {
        return { success: true as const, data: v.foo };
      }
      return { success: false as const, error: "Not a number" };
    },
  };
  const result = get.parse(obj, customParser);
  expect(result).toBe(123);
});

test("should return undefined using get.parse with a custom safeParse object (failure, strict ParseResult)", () => {
  const obj = { foo: "bar" };
  const customParser = {
    safeParse(v: any) {
      if (v && typeof v.foo === "number") {
        return { success: true as const, data: v.foo };
      }
      return { success: false as const, error: "Not a number" };
    },
  };
  const result = get.parse(obj, customParser);
  expect(result).toBeUndefined();
});
