import { describe, it, expect, expectTypeOf } from "bun:test";
import { pick, type Pick } from "./pick";

describe("pick", () => {
  describe("property", () => {
    it("should get a property from an object", () => {
      const obj = { name: "John", age: 30 };
      const result = pick(obj).property("name");
      expect(result?.valueOf()).toBe("John");
    });

    it("should return undefined if property does not exist", () => {
      const obj = { name: "John" };
      const result = pick(obj).property("age");
      expect(result).toBeUndefined();
    });

    it("should return undefined if value is not an object", () => {
      const result = pick("string").property("length");
      expect(result).toBeUndefined();
    });

    it("should work with symbols as keys", () => {
      const sym = Symbol("test");
      const obj = { [sym]: "value" };
      const result = pick(obj).property(sym);
      expect(result?.valueOf()).toBe("value");
    });
  });

  describe("isString", () => {
    it("should validate strings correctly", () => {
      const result = pick("hello").isString();
      expect(result?.valueOf()).toBe("hello");
    });

    it("should return undefined for non-strings", () => {
      expect(pick(123).isString()).toBeUndefined();
      expect(pick(true).isString()).toBeUndefined();
      expect(pick({}).isString()).toBeUndefined();
    });
  });

  describe("isNumber", () => {
    it("should validate numbers correctly", () => {
      const result = pick(123).isNumber();
      expect(result?.valueOf()).toBe(123);
    });

    it("should validate decimal numbers", () => {
      const result = pick(3.14).isNumber();
      expect(result?.valueOf()).toBe(3.14);
    });

    it("should return undefined for non-numbers", () => {
      expect(pick("123").isNumber()).toBeUndefined();
      expect(pick(true).isNumber()).toBeUndefined();
      expect(pick({}).isNumber()).toBeUndefined();
    });
  });

  describe("isInteger", () => {
    it("should validate integers correctly", () => {
      const result = pick(42).isInteger();
      expect(result?.valueOf()).toBe(42);
    });

    it("should return undefined for decimal numbers", () => {
      expect(pick(3.14).isInteger()).toBeUndefined();
    });

    it("should return undefined for non-numbers", () => {
      expect(pick("42").isInteger()).toBeUndefined();
      expect(pick(true).isInteger()).toBeUndefined();
    });
  });

  describe("isBigInt", () => {
    it("should validate bigints correctly", () => {
      const result = pick(123n).isBigInt();
      expect(result?.valueOf()).toBe(123n);
    });

    it("should return undefined for regular numbers", () => {
      expect(pick(123).isBigInt()).toBeUndefined();
    });

    it("should return undefined for non-bigints", () => {
      expect(pick("123").isBigInt()).toBeUndefined();
      expect(pick(true).isBigInt()).toBeUndefined();
    });
  });

  describe("isBoolean", () => {
    it("should validate booleans correctly", () => {
      const resultTrue = pick(true).isBoolean();
      expect(resultTrue?.valueOf()).toBe(true);

      const resultFalse = pick(false).isBoolean();
      expect(resultFalse?.valueOf()).toBe(false);
    });

    it("should return undefined for non-booleans", () => {
      expect(pick(1).isBoolean()).toBeUndefined();
      expect(pick("true").isBoolean()).toBeUndefined();
      expect(pick({}).isBoolean()).toBeUndefined();
    });
  });

  describe("isArray", () => {
    it("should validate arrays correctly", () => {
      const arr = [1, 2, 3];
      const result = pick(arr).isArray();
      expect(result?.valueOf()).toEqual([1, 2, 3]);
    });

    it("should return undefined for non-arrays", () => {
      expect(pick("string").isArray()).toBeUndefined();
      expect(pick(123).isArray()).toBeUndefined();
      expect(pick({}).isArray()).toBeUndefined();
    });
  });

  describe("isRecord", () => {
    it("should validate objects correctly", () => {
      const obj = { key: "value" };
      const result = pick(obj).isRecord();
      expect(result?.valueOf()).toEqual({ key: "value" });
    });

    it("should return undefined for primitives", () => {
      expect(pick("string").isRecord()).toBeUndefined();
      expect(pick(123).isRecord()).toBeUndefined();
      expect(pick(null).isRecord()).toBeUndefined();
    });
  });

  describe("isNative", () => {
    it("should validate native types", () => {
      expect(pick("string").isNative()?.valueOf()).toBe("string");
      expect(pick(123).isNative()?.valueOf()).toBe(123);
      expect(pick(true).isNative()?.valueOf()).toBe(true);
      expect(pick([1, 2]).isNative()?.valueOf()).toEqual([1, 2]);
      expect(pick({ a: 1 }).isNative()?.valueOf()).toEqual({ a: 1 });
    });

    it("should return undefined for non-native values", () => {
      expect(pick(null).isNative()).toBeUndefined();
      expect(pick(undefined).isNative()).toBeUndefined();
    });
  });

  describe("isEnumOf", () => {
    it("should validate enum values", () => {
      const colors = ["red", "green", "blue"] as const;
      const result = pick("red").isEnumOf([...colors]);
      expect(result?.valueOf()).toBe("red");
    });

    it("should return undefined for values not included", () => {
      const colors = ["red", "green", "blue"] as const;
      const result = pick("yellow").isEnumOf([...colors]);
      expect(result).toBeUndefined();
    });

    it("should return undefined for non-strings", () => {
      const result = pick(123).isEnumOf(["red", "green"]);
      expect(result).toBeUndefined();
    });
  });

  describe("pipe", () => {
    it("should transform the value", () => {
      const result = pick(5)
        .pipe((n) => n * 2)
        .valueOf();
      expect(result).toBe(10);
    });

    it("should allow chaining transformations", () => {
      const result = pick({ name: "john" })
        .property("name")
        ?.isString()
        ?.pipe((name) => name.toUpperCase())
        .valueOf();
      expect(result).toBe("JOHN");
    });
  });

  describe("find", () => {
    it("should find an element in an array", () => {
      const arr = [1, 2, 3, 4, 5];
      const result = pick(arr).find((n) => n > 3);
      expect(result?.valueOf()).toBe(4);
    });

    it("should return undefined if not an array", () => {
      const result = pick("string").find(() => true);
      expect(result).toBeUndefined();
    });

    it("should return undefined if element is not found", () => {
      const arr = [1, 2, 3];
      const result = pick(arr).find((n) => n > 10);
      expect(result?.valueOf()).toBeUndefined();
    });
  });

  describe("filter", () => {
    it("should filter array elements", () => {
      const arr = [1, 2, 3, 4, 5];
      const result = pick(arr).filter((n) => n > 3);
      expect(result?.valueOf()).toEqual([4, 5]);
    });

    it("should return undefined if not an array", () => {
      const result = pick("string").filter(() => true);
      expect(result).toBeUndefined();
    });

    it("should return empty array if no matches", () => {
      const arr = [1, 2, 3];
      const result = pick(arr).filter((n) => n > 10);
      expect(result?.valueOf()).toEqual([]);
    });
  });

  describe("every", () => {
    it("should validate all elements in an array", () => {
      const result = pick(["hello", "world"]).every((v) => v.isString());
      expect(result?.valueOf()).toEqual(["hello", "world"]);
    });

    it("should return undefined if not all elements pass validation", () => {
      const result = pick(["hello", 123]).every((v) => v.isString());
      expect(result).toBeUndefined();
    });

    it("should return undefined if value is not an array", () => {
      const result = pick("string").every((v) => v.isString());
      expect(result).toBeUndefined();
    });

    it("should work with numeric arrays", () => {
      const result = pick([1, 2, 3]).every((v) => v.isNumber());
      expect(result?.valueOf()).toEqual([1, 2, 3]);
    });

    it("should return undefined for mixed type arrays", () => {
      const result = pick([1, "two", 3]).every((v) => v.isNumber());
      expect(result).toBeUndefined();
    });

    it("should work with empty arrays", () => {
      const result = pick([]).every((v) => v.isString());
      expect(result?.valueOf()).toEqual([]);
    });

    it("should allow chaining after every", () => {
      const result = pick(["a", "b", "c"])
        .every((v) => v.isString())
        ?.pipe((arr) => arr.map((s) => s.toUpperCase()));
      expect(result?.valueOf()).toEqual(["A", "B", "C"]);
    });

    it("should work with complex validations", () => {
      const data = [{ name: "Alice" }, { name: "Bob" }, { name: "Charlie" }];
      const result = pick(data)
        .every((v) => v.isRecord())
        ?.valueOf();
      expect(result).toEqual(data);
    });
  });

  describe("oneOf", () => {
    it("should return the first successful validation", () => {
      const result = pick("hello").oneOf([
        (v) => v.isString(),
        (v) => v.isArray(),
      ]);
      expectTypeOf(result).toEqualTypeOf<
        Pick<string | unknown[]> | undefined
      >();
      expect(result?.valueOf()).toBe("hello");
    });

    it("should try validators in order", () => {
      const result = pick(123).oneOf([(v) => v.isString(), (v) => v.isArray()]);
      expect(result).toBeUndefined();
    });

    it("should work with property access", () => {
      const obj = { version: "1.0.0" };
      const result = pick(obj)
        .property("version")
        ?.oneOf([(v) => v.isString(), (v) => v.isArray()]);
      expect(result?.valueOf()).toBe("1.0.0");
    });

    it("should handle numeric values", () => {
      const obj = { version: 2 };
      const result = pick(obj)
        .property("version")
        ?.oneOf([(v) => v.isString(), (v) => v.isArray()]);
      expect(result).toBeUndefined();
    });

    it("should work with multiple type validators", () => {
      const testString = pick({ value: "test" })
        .property("value")
        ?.oneOf([(v) => v.isString(), (v) => v.isRecord()]);
      expect(testString?.valueOf()).toBe("test");

      const testObject = pick({ value: { nested: true } })
        .property("value")
        ?.oneOf([(v) => v.isString(), (v) => v.isRecord()]);
      expect(testObject?.valueOf()).toEqual({ nested: true });
    });

    it("should return undefined if all validators fail", () => {
      const result = pick(null).oneOf([
        (v) => v.isString(),
        (v) => v.isArray(),
        (v) => v.isRecord(),
      ]);
      expect(result).toBeUndefined();
    });

    it("should work with enum validators", () => {
      const result = pick("red").oneOf([
        (v) => v.isEnumOf(["red", "green", "blue"]),
        (v) => v.isString(),
      ]);
      expect(result?.valueOf()).toBe("red");
    });

    it("should allow chaining after oneOf", () => {
      const result = pick({ items: [1, 2, 3] })
        .property("items")
        ?.oneOf([(v) => v.isArray(), (v) => v.isString()])
        ?.filter((n: any) => n > 1)
        ?.valueOf();
      expect(result).toEqual([2, 3]);
    });
  });

  describe("valueOf", () => {
    it("should return the original value", () => {
      const obj = { key: "value" };
      expect(pick(obj).valueOf()).toBe(obj);
    });
  });

  describe("complex chaining", () => {
    it("should allow chaining multiple operations", () => {
      const data = {
        users: [
          { name: "Alice", age: 25 },
          { name: "Bob", age: 30 },
          { name: "Charlie", age: 35 },
        ],
      };

      const result = pick(data)
        .property("users")
        ?.isArray()
        ?.filter((user: any) => user.age >= 30)
        ?.valueOf();

      expect(result).toEqual([
        { name: "Bob", age: 30 },
        { name: "Charlie", age: 35 },
      ]);
    });

    it("should handle chains that return undefined", () => {
      const data = { name: "John" };
      const result = pick(data)
        .property("users")
        ?.isArray()
        ?.filter(() => true);

      expect(result).toBeUndefined();
    });
  });

  describe("pick.utils", () => {
    it("should expose utilities", () => {
      expect(pick.utils.isString("test")).toBe(true);
      expect(pick.utils.isNumber(123)).toBe(true);
      expect(pick.utils.isBoolean(true)).toBe(true);
      expect(pick.utils.isArray([1, 2])).toBe(true);
      expect(pick.utils.isRecord({})).toBe(true);
    });
  });

  describe("type checking", () => {
    it("should have correct types for isString", () => {
      const result = pick("hello").isString();
      expectTypeOf(result).toEqualTypeOf<Pick<string> | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<string>();
      }
    });

    it("should have correct types for isNumber", () => {
      const result = pick(123).isNumber();
      expectTypeOf(result).toEqualTypeOf<Pick<number> | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<number>();
      }
    });

    it("should have correct types for isInteger", () => {
      const result = pick(42).isInteger();
      expectTypeOf(result).toEqualTypeOf<Pick<number> | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<number>();
      }
    });

    it("should have correct types for isBigInt", () => {
      const result = pick(123n).isBigInt();
      expectTypeOf(result).toEqualTypeOf<Pick<bigint> | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<bigint>();
      }
    });

    it("should have correct types for isBoolean", () => {
      const result = pick(true).isBoolean();
      expectTypeOf(result).toEqualTypeOf<Pick<boolean> | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<boolean>();
      }
    });

    it("should have correct types for isArray", () => {
      const result = pick([1, 2, 3]).isArray();
      expectTypeOf(result).toEqualTypeOf<Pick<Array<unknown>> | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<Array<unknown>>();
      }
    });

    it("should have correct types for isRecord", () => {
      const result = pick({ key: "value" }).isRecord();
      expectTypeOf(result).toEqualTypeOf<
        Pick<Record<string, unknown>> | undefined
      >();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<Record<string, unknown>>();
      }
    });

    it("should have correct types for isEnumOf", () => {
      const result = pick("red").isEnumOf(["red", "green", "blue"]);
      expectTypeOf(result).toEqualTypeOf<
        Pick<"red" | "green" | "blue"> | undefined
      >();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<
          "red" | "green" | "blue"
        >();
      }
    });

    it("should have correct types for property", () => {
      const obj = { name: "John", age: 30 };
      const result = pick(obj).property("name");
      expectTypeOf(result).toEqualTypeOf<Pick<unknown> | undefined>();
    });

    it("should have correct types for pipe", () => {
      const result = pick(5)
        .pipe((n) => n * 2)
        .valueOf();
      expectTypeOf(result).toEqualTypeOf<number>();

      const stringResult = pick("hello")
        .pipe((s) => s.toUpperCase())
        .valueOf();
      expectTypeOf(stringResult).toEqualTypeOf<string>();
    });

    it("should have correct types for find", () => {
      const arr = [1, 2, 3];
      const result = pick(arr).find((n) => n > 2);
      expectTypeOf(result).toEqualTypeOf<Pick<number> | undefined>();
    });

    it("should have correct types for filter", () => {
      const arr = [1, 2, 3];
      const result = pick(arr).filter((n) => n > 2);
      if (result) {
        expectTypeOf(result.valueOf()).toMatchTypeOf<number[]>();
      }
    });

    it("should have correct types for oneOf with string or array", () => {
      const result = pick("hello").oneOf([
        (v: Pick<string>) => v.isString(),
        (v: Pick<string>) => v.isArray(),
      ]);
      expectTypeOf(result).toEqualTypeOf<
        Pick<string | unknown[]> | undefined
      >();
    });

    it("should have correct types for oneOf with string or record", () => {
      const result = pick({ key: "value" }).oneOf([
        (v: Pick<{ key: string }>) => v.isString(),
        (v: Pick<{ key: string }>) => v.isRecord(),
      ]);
      expectTypeOf(result).toEqualTypeOf<
        Pick<string | Record<string, unknown>> | undefined
      >();
    });

    it("should have correct types for complex chaining", () => {
      const data = { users: [{ name: "Alice" }] };
      const result = pick(data)
        .property("users")
        ?.isArray()
        ?.filter((user: any) => user.name === "Alice")
        ?.valueOf();
      if (result) {
        expectTypeOf(result).toMatchTypeOf<unknown[]>();
      }
    });

    it("should have correct types for valueOf", () => {
      const str = pick("hello").valueOf();
      expectTypeOf(str).toEqualTypeOf<string>();

      const num = pick(123).valueOf();
      expectTypeOf(num).toEqualTypeOf<number>();

      const obj = pick({ key: "value" }).valueOf();
      expectTypeOf(obj).toEqualTypeOf<{ key: string }>();
    });

    it("should have correct types for every with strings", () => {
      const result = pick(["a", "b", "c"]).every((v) => v.isString());
      expectTypeOf(result).toEqualTypeOf<Pick<string[]> | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<string[]>();
      }
    });

    it("should have correct types for every with records", () => {
      const result = pick([{ a: 1 }, { b: 2 }]).every((v) => v.isRecord());
      expectTypeOf(result).toEqualTypeOf<
        Pick<Record<string, unknown>[]> | undefined
      >();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<
          Record<string, unknown>[]
        >();
      }
    });

    it("should have correct types for every with arrays", () => {
      const result = pick([[1], [2], [3]]).every((v) => v.isArray());
      expectTypeOf(result).toEqualTypeOf<Pick<unknown[][]> | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<unknown[][]>();
      }
    });
  });
});
