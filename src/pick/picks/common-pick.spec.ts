import { describe, it, expect, expectTypeOf } from "bun:test";
import { CommonPick } from "./common-pick.js";
import type { ButtonHTMLAttributes } from "react";

describe("CommonPick", () => {
  describe("constructor", () => {
    it("should create CommonPick with a value", () => {
      const pick = new CommonPick("hello");
      expect(pick.value).toBe("hello");
    });

    it("should create CommonPick with different types", () => {
      expect(new CommonPick(123).value).toBe(123);
      expect(new CommonPick(true).value).toBe(true);
      expect(new CommonPick(null).value).toBe(null);
      expect(new CommonPick(undefined).value).toBe(undefined);
    });

    it("should create CommonPick with objects", () => {
      const obj = { name: "John" };
      const pick = new CommonPick(obj);
      expect(pick.value).toBe(obj);
    });

    it("should create CommonPick with arrays", () => {
      const arr = [1, 2, 3];
      const pick = new CommonPick(arr);
      expect(pick.value).toBe(arr);
    });
  });

  describe("valueOf", () => {
    it("should return the encapsulated value", () => {
      const pick = new CommonPick("hello");
      expect(pick.valueOf()).toBe("hello");
    });

    it("should return the same reference for objects", () => {
      const obj = { name: "John" };
      const pick = new CommonPick(obj);
      expect(pick.valueOf()).toBe(obj);
    });

    it("should return the same reference for arrays", () => {
      const arr = [1, 2, 3];
      const pick = new CommonPick(arr);
      expect(pick.valueOf()).toBe(arr);
    });

    it("should work with primitive values", () => {
      expect(new CommonPick(123).valueOf()).toBe(123);
      expect(new CommonPick(true).valueOf()).toBe(true);
      expect(new CommonPick(null).valueOf()).toBe(null);
      expect(new CommonPick(undefined).valueOf()).toBe(undefined);
    });
  });

  describe("enum", () => {
    it("should validate boolean enum values", () => {
      const result = new CommonPick(true).enum([true]);
      expect(result?.valueOf()).toBe(true);
    });

    it("should validate string enum values", () => {
      const result = new CommonPick("foo").enum(["taz", "biz", "foo"]);
      expect(result?.valueOf()).toBe("foo");
    });

    it("should validate mixed type enum values", () => {
      const result = new CommonPick(3).enum(["taz", 3, "foo", true]);
      expect(result?.valueOf()).toBe(3);
    });

    it("should return undefined for values not in enum", () => {
      expect(new CommonPick("bar").enum(["foo", "baz"])).toBeUndefined();
      expect(new CommonPick(5).enum([1, 2, 3])).toBeUndefined();
      expect(new CommonPick(false).enum([true])).toBeUndefined();
    });

    it("should work with number enums", () => {
      const result = new CommonPick(2).enum([1, 2, 3]);
      expect(result?.valueOf()).toBe(2);
    });

    it("should work with string enums", () => {
      const result = new CommonPick("active").enum([
        "active",
        "inactive",
        "pending",
      ]);
      expect(result?.valueOf()).toBe("active");
    });

    it("should work with boolean enums", () => {
      expect(new CommonPick(true).enum([true, false])?.valueOf()).toBe(true);
      expect(new CommonPick(false).enum([true, false])?.valueOf()).toBe(false);
    });

    it("should work with single value enum", () => {
      const result = new CommonPick("only").enum(["only"]);
      expect(result?.valueOf()).toBe("only");
    });

    it("should return undefined for empty enum", () => {
      const result = new CommonPick("value").enum([]);
      expect(result).toBeUndefined();
    });

    it("should work with null in enum", () => {
      const result = new CommonPick(null).enum([null, "value"]);
      expect(result?.valueOf()).toBe(null);
    });

    it("should work with undefined in enum", () => {
      const result = new CommonPick(undefined).enum([undefined, "value"]);
      expect(result?.valueOf()).toBe(undefined);
    });

    it("should distinguish between similar values", () => {
      expect(new CommonPick(0).enum([false, null, undefined])).toBeUndefined();
      expect(new CommonPick("").enum([false, null, undefined])).toBeUndefined();
      expect(new CommonPick(false).enum([0, null, undefined])).toBeUndefined();
    });

    it("should work with object references", () => {
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      const obj3 = { id: 3 };

      const result = new CommonPick(obj2).enum([obj1, obj2, obj3]);
      expect(result?.valueOf()).toBe(obj2);
    });

    it("should not match different object instances with same content", () => {
      const obj = { id: 1 };
      const result = new CommonPick(obj).enum([{ id: 1 }, { id: 2 }]);
      expect(result).toBeUndefined();
    });

    it("should chain with pipe", () => {
      const result = new CommonPick("foo")
        .enum(["foo", "bar", "baz"])
        ?.pipe((s) => s.toUpperCase());
      expect(result?.valueOf()).toBe("FOO");
    });

    it("should work with readonly arrays", () => {
      const values = ["a", "b", "c"] as const;
      const result = new CommonPick("b").enum(values);
      expect(result?.valueOf()).toBe("b");
    });
  });

  describe("pipe", () => {
    it("should transform string values", () => {
      const pick = new CommonPick("hello");
      const result = pick.pipe((s) => s.toUpperCase());
      expect(result.valueOf()).toBe("HELLO");
    });

    it("should transform number values", () => {
      const pick = new CommonPick(5);
      const result = pick.pipe((n) => n * 2);
      expect(result.valueOf()).toBe(10);
    });

    it("should transform to different types", () => {
      const pick = new CommonPick("123");
      const result = pick.pipe((s) => parseInt(s, 10));
      expect(result.valueOf()).toBe(123);
    });

    it("should chain multiple transformations", () => {
      const pick = new CommonPick(5);
      const result = pick
        .pipe((n) => n * 2)
        .pipe((n) => n + 3)
        .pipe((n) => n.toString());
      expect(result.valueOf()).toBe("13");
    });

    it("should work with objects", () => {
      const pick = new CommonPick({ name: "john" });
      const result = pick.pipe((obj) => ({
        ...obj,
        name: obj.name.toUpperCase(),
      }));
      expect(result.valueOf()).toEqual({ name: "JOHN" });
    });

    it("should work with arrays", () => {
      const pick = new CommonPick([1, 2, 3]);
      const result = pick.pipe((arr) => arr.map((n) => n * 2));
      expect(result.valueOf()).toEqual([2, 4, 6]);
    });

    it("should return new CommonPick instance", () => {
      const pick = new CommonPick("hello");
      const result = pick.pipe((s) => s.toUpperCase());
      expect(result).toBeInstanceOf(CommonPick);
      expect(result).not.toBe(pick);
    });

    it("should handle complex transformations", () => {
      const pick = new CommonPick({ users: ["alice", "bob", "charlie"] });
      const result = pick.pipe((data) => ({
        count: data.users.length,
        names: data.users.map((u) => u.toUpperCase()),
      }));
      expect(result.valueOf()).toEqual({
        count: 3,
        names: ["ALICE", "BOB", "CHARLIE"],
      });
    });

    it("should handle transformations that return null or undefined", () => {
      const pick = new CommonPick("hello");
      const resultNull = pick.pipe(() => null);
      expect(resultNull.valueOf()).toBe(null);

      const resultUndefined = pick.pipe(() => undefined);
      expect(resultUndefined.valueOf()).toBe(undefined);
    });
  });

  describe("type checking", () => {
    it("should have correct types for valueOf", () => {
      const stringPick = new CommonPick("hello");
      expectTypeOf(stringPick.valueOf()).toEqualTypeOf<string>();

      const numberPick = new CommonPick(123);
      expectTypeOf(numberPick.valueOf()).toEqualTypeOf<number>();

      const booleanPick = new CommonPick(true);
      expectTypeOf(booleanPick.valueOf()).toEqualTypeOf<boolean>();
    });

    it("should have correct types for pipe", () => {
      const pick = new CommonPick("hello");
      const result = pick.pipe((s) => s.length);
      expectTypeOf(result).toEqualTypeOf<CommonPick<number>>();
      expectTypeOf(result.valueOf()).toEqualTypeOf<number>();
    });

    it("should infer correct types for chained pipes", () => {
      const pick = new CommonPick(5);
      const result = pick
        .pipe((n) => n * 2) // number -> number
        .pipe((n) => n.toString()) // number -> string
        .pipe((s) => s.length); // string -> number
      expectTypeOf(result.valueOf()).toEqualTypeOf<number>();
    });

    it("should work with generic types", () => {
      interface User {
        name: string;
        age: number;
      }
      const pick = new CommonPick<User>({ name: "John", age: 30 });
      expectTypeOf(pick.valueOf()).toEqualTypeOf<User>();
    });

    it("should have correct types for enum with strings", () => {
      const result = new CommonPick("foo").enum(["foo", "bar", "baz"]);
      expectTypeOf(result?.valueOf()).toEqualTypeOf<string | undefined>();
    });

    it("should have correct types for enum with numbers", () => {
      const result = new CommonPick(2).enum([1, 2, 3]);
      expectTypeOf(result?.valueOf()).toEqualTypeOf<number | undefined>();
    });

    it("should have correct types for enum with mixed types", () => {
      const result = new CommonPick(3).enum(["taz", 3, "foo", true] as const);
      expectTypeOf(result?.valueOf()).toEqualTypeOf<
        "taz" | 3 | "foo" | true | undefined
      >();
    });

    it("should have correct types for enum with booleans", () => {
      const result = new CommonPick(true).enum([true, false]);
      expectTypeOf(result?.valueOf()).toEqualTypeOf<boolean | undefined>();
    });
  });

  describe("immutability", () => {
    it("should not modify the original value", () => {
      const original = { name: "John", age: 30 };
      const pick = new CommonPick(original);
      pick.pipe((obj) => ({ ...obj, age: 31 }));
      expect(original.age).toBe(30);
    });

    it("should not modify the original array", () => {
      const original = [1, 2, 3];
      const pick = new CommonPick(original);
      pick.pipe((arr) => [...arr, 4]);
      expect(original).toEqual([1, 2, 3]);
    });

    it("should maintain value reference", () => {
      const obj = { name: "John" };
      const pick = new CommonPick(obj);
      expect(pick.value).toBe(obj);
      expect(pick.valueOf()).toBe(obj);
    });
  });

  describe("edge cases", () => {
    it("should handle empty strings", () => {
      const pick = new CommonPick("");
      expect(pick.valueOf()).toBe("");
      const result = pick.pipe((s) => s.length);
      expect(result.valueOf()).toBe(0);
    });

    it("should handle zero", () => {
      const pick = new CommonPick(0);
      expect(pick.valueOf()).toBe(0);
      const result = pick.pipe((n) => n + 1);
      expect(result.valueOf()).toBe(1);
    });

    it("should handle false", () => {
      const pick = new CommonPick(false);
      expect(pick.valueOf()).toBe(false);
      const result = pick.pipe((b) => !b);
      expect(result.valueOf()).toBe(true);
    });

    it("should handle empty arrays", () => {
      const pick = new CommonPick<number[]>([]);
      expect(pick.valueOf()).toEqual([]);
      const result = pick.pipe((arr) => arr.length);
      expect(result.valueOf()).toBe(0);
    });

    it("should handle empty objects", () => {
      const pick = new CommonPick({});
      expect(pick.valueOf()).toEqual({});
      const result = pick.pipe((obj) => Object.keys(obj).length);
      expect(result.valueOf()).toBe(0);
    });

    it("should handle NaN", () => {
      const pick = new CommonPick(NaN);
      expect(pick.valueOf()).toBeNaN();
    });

    it("should handle Infinity", () => {
      const pick = new CommonPick(Infinity);
      expect(pick.valueOf()).toBe(Infinity);
    });

    it("should handle negative Infinity", () => {
      const pick = new CommonPick(-Infinity);
      expect(pick.valueOf()).toBe(-Infinity);
    });

    it("should handle BigInt", () => {
      const pick = new CommonPick(123n);
      expect(pick.valueOf()).toBe(123n);
      const result = pick.pipe((n) => n * 2n);
      expect(result.valueOf()).toBe(246n);
    });

    it("should handle Symbols", () => {
      const sym = Symbol("test");
      const pick = new CommonPick(sym);
      expect(pick.valueOf()).toBe(sym);
    });

    it("should handle Date objects", () => {
      const date = new Date("2024-01-01");
      const pick = new CommonPick(date);
      expect(pick.valueOf()).toBe(date);
      const result = pick.pipe((d) => d.getFullYear());
      expect(result.valueOf()).toBe(2024);
    });

    it("should handle RegExp objects", () => {
      const regex = /test/i;
      const pick = new CommonPick(regex);
      expect(pick.valueOf()).toBe(regex);
      const result = pick.pipe((r) => r.test("TEST"));
      expect(result.valueOf()).toBe(true);
    });

    it("should handle Map objects", () => {
      const map = new Map([["key", "value"]]);
      const pick = new CommonPick(map);
      expect(pick.valueOf()).toBe(map);
      const result = pick.pipe((m) => m.get("key"));
      expect(result.valueOf()).toBe("value");
    });

    it("should handle Set objects", () => {
      const set = new Set([1, 2, 3]);
      const pick = new CommonPick(set);
      expect(pick.valueOf()).toBe(set);
      const result = pick.pipe((s) => s.size);
      expect(result.valueOf()).toBe(3);
    });
  });

  describe("real-world scenarios", () => {
    it("should extract and transform nested data", () => {
      const data = {
        user: {
          profile: {
            name: "John Doe",
            email: "john@example.com",
          },
        },
      };
      const pick = new CommonPick(data);
      const result = pick
        .pipe((d) => d.user.profile)
        .pipe((p) => p.name)
        .pipe((n) => n.toUpperCase());
      expect(result.valueOf()).toBe("JOHN DOE");
    });

    it("should process array data", () => {
      const numbers = [1, 2, 3, 4, 5];
      const pick = new CommonPick(numbers);
      const result = pick
        .pipe((arr) => arr.filter((n) => n % 2 === 0))
        .pipe((arr) => arr.map((n) => n * 2))
        .pipe((arr) => arr.reduce((sum, n) => sum + n, 0));
      expect(result.valueOf()).toBe(12); // (2 + 4) * 2 = 12
    });

    it("should format data for display", () => {
      const user = {
        firstName: "john",
        lastName: "doe",
        age: 30,
      };
      const pick = new CommonPick(user);
      const result = pick.pipe((u) => ({
        fullName: `${u.firstName} ${u.lastName}`.toUpperCase(),
        isAdult: u.age >= 18,
      }));
      expect(result.valueOf()).toEqual({
        fullName: "JOHN DOE",
        isAdult: true,
      });
    });

    it("should calculate statistics", () => {
      const scores = [85, 92, 78, 95, 88];
      const pick = new CommonPick(scores);
      const result = pick.pipe((arr) => ({
        count: arr.length,
        sum: arr.reduce((a, b) => a + b, 0),
        average: arr.reduce((a, b) => a + b, 0) / arr.length,
        max: Math.max(...arr),
        min: Math.min(...arr),
      }));
      expect(result.valueOf()).toEqual({
        count: 5,
        sum: 438,
        average: 87.6,
        max: 95,
        min: 78,
      });
    });

    it("should parse and validate JSON-like data", () => {
      const jsonString = '{"name":"John","age":30}';
      const pick = new CommonPick(jsonString);
      const result = pick
        .pipe((s) => JSON.parse(s))
        .pipe((obj) => ({
          ...obj,
          name: obj.name.toUpperCase(),
          isAdult: obj.age >= 18,
        }));
      expect(result.valueOf()).toEqual({
        name: "JOHN",
        age: 30,
        isAdult: true,
      });
    });

    it("should build query strings", () => {
      const params = {
        search: "hello world",
        page: 1,
        limit: 10,
      };
      const pick = new CommonPick(params);
      const result = pick.pipe((p) =>
        Object.entries(p)
          .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
          .join("&"),
      );
      expect(result.valueOf()).toBe("search=hello%20world&page=1&limit=10");
    });

    it("should normalize and sanitize input", () => {
      const input = "  Hello World!  ";
      const pick = new CommonPick(input);
      const result = pick
        .pipe((s) => s.trim())
        .pipe((s) => s.toLowerCase())
        .pipe((s) => s.replace(/[^a-z0-9\s]/g, ""))
        .pipe((s) => s.replace(/\s+/g, "-"));
      expect(result.valueOf()).toBe("hello-world");
    });
  });
});
