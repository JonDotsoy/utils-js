import { expect, test } from "bun:test";
import { get } from "./get.js";

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
