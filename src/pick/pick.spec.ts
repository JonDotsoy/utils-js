import { describe, it, expect, expectTypeOf } from "bun:test";
import {
  pick,
  type Pick,
  IntegerPick,
  BigIntPick,
  BooleanPick,
  ArrayPick,
  RecordPick,
  StringPick,
  NumberPick,
  DatePick,
} from "./pick";

// Reglas: Pick o cualquier clase que erede de Pick nunca deben modificar el valor
// pick(new Date(...)).date().value instanceof Date
// pick(124342).date().value === 124342
// pick(124342).date().valueDate instaceof Date
// pick(124342).date().valueOf() === 124342
// pick(124342).date() instanceof DatePick

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
      const result = pick("hello").string();
      expect(result?.valueOf()).toBe("hello");
    });

    it("should return undefined for non-strings", () => {
      expect(pick(123).string()).toBeUndefined();
      expect(pick(true).string()).toBeUndefined();
      expect(pick({}).string()).toBeUndefined();
    });
  });

  describe("isNumber", () => {
    it("should validate numbers correctly", () => {
      const result = pick(123).number();
      expect(result?.valueOf()).toBe(123);
    });

    it("should validate decimal numbers", () => {
      const result = pick(3.14).number();
      expect(result?.valueOf()).toBe(3.14);
    });

    it("should return undefined for non-numbers", () => {
      expect(pick("123").number()).toBeUndefined();
      expect(pick(true).number()).toBeUndefined();
      expect(pick({}).number()).toBeUndefined();
    });
  });

  describe("isInteger", () => {
    it("should validate integers correctly", () => {
      const result = pick(42).integer();
      expect(result?.valueOf()).toBe(42);
    });

    it("should return undefined for decimal numbers", () => {
      expect(pick(3.14).integer()).toBeUndefined();
    });

    it("should return undefined for non-numbers", () => {
      expect(pick("42").integer()).toBeUndefined();
      expect(pick(true).integer()).toBeUndefined();
    });
  });

  describe("isBigInt", () => {
    it("should validate bigints correctly", () => {
      const result = pick(123n).bigInt();
      expect(result?.valueOf()).toBe(123n);
    });

    it("should return undefined for regular numbers", () => {
      expect(pick(123).bigInt()).toBeUndefined();
    });

    it("should return undefined for non-bigints", () => {
      expect(pick("123").bigInt()).toBeUndefined();
      expect(pick(true).bigInt()).toBeUndefined();
    });
  });

  describe("isBoolean", () => {
    it("should validate booleans correctly", () => {
      const resultTrue = pick(true).boolean();
      expect(resultTrue?.valueOf()).toBe(true);

      const resultFalse = pick(false).boolean();
      expect(resultFalse?.valueOf()).toBe(false);
    });

    it("should return undefined for non-booleans", () => {
      expect(pick(1).boolean()).toBeUndefined();
      expect(pick("true").boolean()).toBeUndefined();
      expect(pick({}).boolean()).toBeUndefined();
    });
  });

  describe("isArray", () => {
    it("should validate arrays correctly", () => {
      const arr = [1, 2, 3];
      const result = pick(arr).array();
      expect(result?.valueOf()).toEqual([1, 2, 3]);
    });

    it("should return undefined for non-arrays", () => {
      expect(pick("string").array()).toBeUndefined();
      expect(pick(123).array()).toBeUndefined();
      expect(pick({}).array()).toBeUndefined();
    });
  });

  describe("isRecord", () => {
    it("should validate objects correctly", () => {
      const obj = { key: "value" };
      const result = pick(obj).record();
      expect(result?.valueOf()).toEqual({ key: "value" });
    });

    it("should return undefined for primitives", () => {
      expect(pick("string").record()).toBeUndefined();
      expect(pick(123).record()).toBeUndefined();
      expect(pick(null).record()).toBeUndefined();
    });
  });

  describe("isNative", () => {
    it("should validate native types", () => {
      expect(pick("string").native()?.valueOf()).toBe("string");
      expect(pick(123).native()?.valueOf()).toBe(123);
      expect(pick(true).native()?.valueOf()).toBe(true);
      expect(pick([1, 2]).native()?.valueOf()).toEqual([1, 2]);
      expect(pick({ a: 1 }).native()?.valueOf()).toEqual({ a: 1 });
    });

    it("should return undefined for non-native values", () => {
      expect(pick(null).native()).toBeUndefined();
      expect(pick(undefined).native()).toBeUndefined();
    });
  });

  describe("isEnumOf", () => {
    it("should validate enum values", () => {
      const colors = ["red", "green", "blue"] as const;
      const result = pick("red").enum([...colors]);
      expect(result?.valueOf()).toBe("red");
    });

    it("should return undefined for values not included", () => {
      const colors = ["red", "green", "blue"] as const;
      const result = pick("yellow").enum([...colors]);
      expect(result).toBeUndefined();
    });

    it("should return undefined for non-strings", () => {
      const result = pick(123).enum(["red", "green"]);
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
        ?.string()
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
      const result = pick(["hello", "world"]).every((v) => v.string());
      expect(result?.valueOf()).toEqual(["hello", "world"]);
    });

    it("should return undefined if not all elements pass validation", () => {
      const result = pick(["hello", 123]).every((v) => v.string());
      expect(result).toBeUndefined();
    });

    it("should return undefined if value is not an array", () => {
      const result = pick("string").every((v) => v.string());
      expect(result).toBeUndefined();
    });

    it("should work with numeric arrays", () => {
      const result = pick([1, 2, 3]).every((v) => v.number());
      expect(result?.valueOf()).toEqual([1, 2, 3]);
    });

    it("should return undefined for mixed type arrays", () => {
      const result = pick([1, "two", 3]).every((v) => v.number());
      expect(result).toBeUndefined();
    });

    it("should work with empty arrays", () => {
      const result = pick([]).every((v) => v.string());
      expect(result?.valueOf()).toEqual([]);
    });

    it("should allow chaining after every", () => {
      const result = pick(["a", "b", "c"])
        .every((v) => v.string())
        ?.pipe((arr) => arr.map((s) => s.toUpperCase()));
      expect(result?.valueOf()).toEqual(["A", "B", "C"]);
    });

    it("should work with complex validations", () => {
      const data = [{ name: "Alice" }, { name: "Bob" }, { name: "Charlie" }];
      const result = pick(data)
        .every((v) => v.record())
        ?.valueOf();
      expect(result).toEqual(data);
    });
  });

  describe("oneOf", () => {
    it("should return the first successful validation", () => {
      const result = pick("hello").oneOf([(v) => v.string(), (v) => v.array()]);
      expectTypeOf(result).toEqualTypeOf<
        Pick<string | unknown[]> | undefined
      >();
      expect(result?.valueOf()).toBe("hello");
    });

    it("should try validators in order", () => {
      const result = pick(123).oneOf([(v) => v.string(), (v) => v.array()]);
      expect(result).toBeUndefined();
    });

    it("should work with property access", () => {
      const obj = { version: "1.0.0" };
      const result = pick(obj)
        .property("version")
        ?.oneOf([(v) => v.string(), (v) => v.array()]);
      expect(result?.valueOf()).toBe("1.0.0");
    });

    it("should handle numeric values", () => {
      const obj = { version: 2 };
      const result = pick(obj)
        .property("version")
        ?.oneOf([(v) => v.string(), (v) => v.array()]);
      expect(result).toBeUndefined();
    });

    it("should work with multiple type validators", () => {
      const testString = pick({ value: "test" })
        .property("value")
        ?.oneOf([(v) => v.string(), (v) => v.record()]);
      expect(testString?.valueOf()).toBe("test");

      const testObject = pick({ value: { nested: true } })
        .property("value")
        ?.oneOf([(v) => v.string(), (v) => v.record()]);
      expect(testObject?.valueOf()).toEqual({ nested: true });
    });

    it("should return undefined if all validators fail", () => {
      const result = pick(null).oneOf([
        (v) => v.string(),
        (v) => v.array(),
        (v) => v.record(),
      ]);
      expect(result).toBeUndefined();
    });

    it("should work with enum validators", () => {
      const result = pick("red").oneOf([
        (v) => v.enum(["red", "green", "blue"]),
        (v) => v.string(),
      ]);
      expect(result?.valueOf()).toBe("red");
    });

    it("should allow chaining after oneOf", () => {
      const result = pick({ items: [1, 2, 3] })
        .property("items")
        ?.oneOf([(v) => v.array(), (v) => v.string()])
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
        ?.array()
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
        ?.array()
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
      const result = pick("hello").string();
      expectTypeOf(result).toEqualTypeOf<StringPick | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<string>();
      }
    });

    it("should have correct types for isNumber", () => {
      const result = pick(123).number();
      expectTypeOf(result).toEqualTypeOf<NumberPick | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<number>();
      }
    });

    it("should have correct types for isInteger", () => {
      const result = pick(42).integer();
      expectTypeOf(result).toEqualTypeOf<IntegerPick | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<number>();
      }
    });

    it("should have correct types for isBigInt", () => {
      const result = pick(123n).bigInt();
      expectTypeOf(result).toEqualTypeOf<BigIntPick | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<bigint>();
      }
    });

    it("should have correct types for isBoolean", () => {
      const result = pick(true).boolean();
      expectTypeOf(result).toEqualTypeOf<BooleanPick | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<boolean>();
      }
    });

    it("should have correct types for isArray", () => {
      const result = pick([1, 2, 3]).array();
      expectTypeOf(result).toEqualTypeOf<ArrayPick<unknown> | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<Array<unknown>>();
      }
    });

    it("should have correct types for isRecord", () => {
      const result = pick({ key: "value" }).record();
      expectTypeOf(result).toEqualTypeOf<RecordPick | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<Record<string, unknown>>();
      }
    });

    it("should have correct types for isEnumOf", () => {
      const result = pick("red").enum(["red", "green", "blue"]);
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
        (v: Pick<string>) => v.string(),
        (v: Pick<string>) => v.array(),
      ]);
      expectTypeOf(result).toEqualTypeOf<
        Pick<string | unknown[]> | undefined
      >();
    });

    it("should have correct types for oneOf with string or record", () => {
      const result = pick({ key: "value" }).oneOf([
        (v: Pick<{ key: string }>) => v.string(),
        (v: Pick<{ key: string }>) => v.record(),
      ]);
      expectTypeOf(result).toEqualTypeOf<
        Pick<string | Record<string, unknown>> | undefined
      >();
    });

    it("should have correct types for complex chaining", () => {
      const data = { users: [{ name: "Alice" }] };
      const result = pick(data)
        .property("users")
        ?.array()
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
      const result = pick(["a", "b", "c"]).every((v) => v.string());
      expectTypeOf(result).toEqualTypeOf<Pick<string[]> | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<string[]>();
      }
    });

    it("should have correct types for every with records", () => {
      const result = pick([{ a: 1 }, { b: 2 }]).every((v) => v.record());
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
      const result = pick([[1], [2], [3]]).every((v) => v.array());
      expectTypeOf(result).toEqualTypeOf<Pick<unknown[][]> | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<unknown[][]>();
      }
    });
  });

  describe("email", () => {
    it("should validate email format", () => {
      const result = pick("user@example.com").email();
      expect(result?.valueOf()).toBe("user@example.com");
    });

    it("should validate complex email addresses", () => {
      expect(pick("test.user+tag@example.co.uk").email()?.valueOf()).toBe(
        "test.user+tag@example.co.uk",
      );
      expect(pick("user_name@sub-domain.example.com").email()?.valueOf()).toBe(
        "user_name@sub-domain.example.com",
      );
    });

    it("should return undefined for invalid emails", () => {
      expect(pick("invalid").email()).toBeUndefined();
      expect(pick("@example.com").email()).toBeUndefined();
      expect(pick("test@").email()).toBeUndefined();
      expect(pick("test@domain").email()).toBeUndefined();
      expect(pick("test @domain.com").email()).toBeUndefined();
      expect(pick("test@domain .com").email()).toBeUndefined();
    });

    it("should return undefined for non-strings", () => {
      expect(pick(123).email()).toBeUndefined();
      expect(pick(true).email()).toBeUndefined();
      expect(pick({}).email()).toBeUndefined();
      expect(pick(null).email()).toBeUndefined();
    });

    it("should allow chaining after email validation", () => {
      const result = pick("user@example.com")
        .email()
        ?.pipe((email) => email.toLowerCase())
        .valueOf();
      expect(result).toBe("user@example.com");
    });

    it("should have correct types", () => {
      const result = pick("test@example.com").email();
      expectTypeOf(result).toEqualTypeOf<StringPick | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<string>();
      }
    });
  });
});

describe("IntegerPick", () => {
  describe("validations", () => {
    it("should validate greater than", () => {
      expect(pick(10).integer()?.gt(5)?.valueOf()).toBe(10);
    });

    it("should validate greater than or equal", () => {
      expect(pick(10).integer()?.gte(10)?.valueOf()).toBe(10);
    });

    it("should validate less than", () => {
      expect(pick(5).integer()?.lt(10)?.valueOf()).toBe(5);
    });

    it("should validate less than or equal", () => {
      expect(pick(10).integer()?.lte(10)?.valueOf()).toBe(10);
    });

    it("should validate between", () => {
      expect(pick(5).integer()?.between(1, 10)?.valueOf()).toBe(5);
    });

    it("should validate positive", () => {
      expect(pick(5).integer()?.positive()?.valueOf()).toBe(5);
      expect(pick(0).integer()?.positive()).toBeUndefined();
    });

    it("should validate negative", () => {
      expect(pick(-5).integer()?.negative()?.valueOf()).toBe(-5);
      expect(pick(0).integer()?.negative()).toBeUndefined();
    });

    it("should validate multipleOf", () => {
      expect(pick(10).integer()?.multipleOf(5)?.valueOf()).toBe(10);
      expect(pick(11).integer()?.multipleOf(5)).toBeUndefined();
    });

    it("should validate even", () => {
      expect(pick(10).integer()?.even()?.valueOf()).toBe(10);
      expect(pick(11).integer()?.even()).toBeUndefined();
    });

    it("should validate odd", () => {
      expect(pick(11).integer()?.odd()?.valueOf()).toBe(11);
      expect(pick(10).integer()?.odd()).toBeUndefined();
    });
  });

  describe("chaining", () => {
    it("should chain multiple validations", () => {
      const result = pick(10).integer()?.positive()?.even()?.between(1, 20);
      expect(result?.valueOf()).toBe(10);
    });

    it("should return undefined if any validation fails", () => {
      const result = pick(11).integer()?.positive()?.even();
      expect(result).toBeUndefined();
    });
  });
});

describe("BigIntPick", () => {
  describe("validations", () => {
    it("should validate greater than", () => {
      expect(pick(10n).bigInt()?.gt(5n)?.valueOf()).toBe(10n);
    });

    it("should validate greater than or equal", () => {
      expect(pick(10n).bigInt()?.gte(10n)?.valueOf()).toBe(10n);
    });

    it("should validate less than", () => {
      expect(pick(5n).bigInt()?.lt(10n)?.valueOf()).toBe(5n);
    });

    it("should validate less than or equal", () => {
      expect(pick(10n).bigInt()?.lte(10n)?.valueOf()).toBe(10n);
    });

    it("should validate between", () => {
      expect(pick(5n).bigInt()?.between(1n, 10n)?.valueOf()).toBe(5n);
    });

    it("should validate positive", () => {
      expect(pick(5n).bigInt()?.positive()?.valueOf()).toBe(5n);
      expect(pick(0n).bigInt()?.positive()).toBeUndefined();
    });

    it("should validate negative", () => {
      expect(pick(-5n).bigInt()?.negative()?.valueOf()).toBe(-5n);
      expect(pick(0n).bigInt()?.negative()).toBeUndefined();
    });
  });

  describe("chaining", () => {
    it("should chain multiple validations", () => {
      const result = pick(100n).bigInt()?.positive()?.between(1n, 1000n);
      expect(result?.valueOf()).toBe(100n);
    });
  });
});

describe("BooleanPick", () => {
  describe("validations", () => {
    it("should validate true", () => {
      expect(pick(true).boolean()?.true()?.valueOf()).toBe(true);
      expect(pick(false).boolean()?.true()).toBeUndefined();
    });

    it("should validate false", () => {
      expect(pick(false).boolean()?.false()?.valueOf()).toBe(false);
      expect(pick(true).boolean()?.false()).toBeUndefined();
    });
  });

  describe("transformations", () => {
    it("should invert boolean value", () => {
      expect(pick(true).boolean()?.not().valueOf()).toBe(false);
      expect(pick(false).boolean()?.not().valueOf()).toBe(true);
    });

    it("should chain not with validations", () => {
      expect(pick(true).boolean()?.not().false()?.valueOf()).toBe(false);
    });
  });
});

describe("ArrayPick", () => {
  describe("length validations", () => {
    it("should validate minLength", () => {
      expect(pick([1, 2, 3]).array()?.minLength(2)?.valueOf()).toEqual([
        1, 2, 3,
      ]);
      expect(pick([1]).array()?.minLength(2)).toBeUndefined();
    });

    it("should validate maxLength", () => {
      expect(pick([1, 2]).array()?.maxLength(5)?.valueOf()).toEqual([1, 2]);
      expect(pick([1, 2, 3, 4, 5, 6]).array()?.maxLength(5)).toBeUndefined();
    });

    it("should validate exact length", () => {
      expect(pick([1, 2, 3]).array()?.length(3)?.valueOf()).toEqual([1, 2, 3]);
      expect(pick([1, 2]).array()?.length(3)).toBeUndefined();
    });

    it("should validate notEmpty", () => {
      expect(pick([1]).array()?.notEmpty()?.valueOf()).toEqual([1]);
      expect(pick([]).array()?.notEmpty()).toBeUndefined();
    });
  });

  describe("element access", () => {
    it("should get first element", () => {
      expect(pick([1, 2, 3]).array()?.first()?.valueOf()).toBe(1);
      expect(pick([]).array()?.first()).toBeUndefined();
    });

    it("should get last element", () => {
      expect(pick([1, 2, 3]).array()?.last()?.valueOf()).toBe(3);
      expect(pick([]).array()?.last()).toBeUndefined();
    });

    it("should get element at index", () => {
      expect(pick([1, 2, 3]).array()?.at(1)?.valueOf()).toBe(2);
      expect(pick([1, 2, 3]).array()?.at(-1)?.valueOf()).toBe(3);
      expect(pick([1, 2, 3]).array()?.at(10)).toBeUndefined();
    });
  });

  describe("includes", () => {
    it("should validate includes", () => {
      expect(pick([1, 2, 3]).array()?.includes(2)?.valueOf()).toEqual([
        1, 2, 3,
      ]);
      expect(pick([1, 2, 3]).array()?.includes(5)).toBeUndefined();
    });
  });

  describe("chaining", () => {
    it("should chain multiple validations", () => {
      const result = pick([1, 2, 3, 4, 5])
        .array()
        ?.minLength(3)
        ?.maxLength(10)
        ?.includes(3);
      expect(result?.valueOf()).toEqual([1, 2, 3, 4, 5]);
    });
  });
});

describe("RecordPick", () => {
  describe("key validations", () => {
    it("should validate hasKey", () => {
      const obj = { name: "John", age: 30 };
      expect(pick(obj).record()?.hasKey("name")?.valueOf()).toEqual(obj);
      expect(pick(obj).record()?.hasKey("email")).toBeUndefined();
    });

    it("should validate hasKeys", () => {
      const obj = { name: "John", age: 30, city: "NYC" };
      expect(pick(obj).record()?.hasKeys(["name", "age"])?.valueOf()).toEqual(
        obj,
      );
      expect(pick(obj).record()?.hasKeys(["name", "email"])).toBeUndefined();
    });

    it("should validate notEmpty", () => {
      expect(pick({ a: 1 }).record()?.notEmpty()?.valueOf()).toEqual({ a: 1 });
      expect(pick({}).record()?.notEmpty()).toBeUndefined();
    });

    it("should validate minKeys", () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(pick(obj).record()?.minKeys(2)?.valueOf()).toEqual(obj);
      expect(pick({ a: 1 }).record()?.minKeys(2)).toBeUndefined();
    });

    it("should validate maxKeys", () => {
      const obj = { a: 1, b: 2 };
      expect(pick(obj).record()?.maxKeys(5)?.valueOf()).toEqual(obj);
      expect(pick({ a: 1, b: 2, c: 3 }).record()?.maxKeys(2)).toBeUndefined();
    });
  });

  describe("transformations", () => {
    it("should get keys", () => {
      const obj = { name: "John", age: 30 };
      const keys = pick(obj).record()?.keys().valueOf();
      expect(keys).toEqual(["name", "age"]);
    });

    it("should get values", () => {
      const obj = { name: "John", age: 30 };
      const values = pick(obj).record()?.values().valueOf();
      expect(values).toEqual(["John", 30]);
    });
  });

  describe("chaining", () => {
    it("should chain multiple validations", () => {
      const obj = { name: "John", age: 30, city: "NYC" };
      const result = pick(obj)
        .record()
        ?.notEmpty()
        ?.hasKey("name")
        ?.minKeys(2)
        ?.maxKeys(10);
      expect(result?.valueOf()).toEqual(obj);
    });

    it("should chain with keys transformation", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = pick(obj).record()?.keys().minLength(2)?.valueOf();
      expect(result).toEqual(["a", "b", "c"]);
    });
  });
});

describe("StringPick", () => {
  describe("minLength", () => {
    it("should validate minimum length", () => {
      const result = pick("hello").string()?.minLength(3);
      expect(result?.valueOf()).toBe("hello");
    });

    it("should return undefined if too short", () => {
      const result = pick("hi").string()?.minLength(5);
      expect(result).toBeUndefined();
    });
  });

  describe("maxLength", () => {
    it("should validate maximum length", () => {
      const result = pick("hello").string()?.maxLength(10);
      expect(result?.valueOf()).toBe("hello");
    });

    it("should return undefined if too long", () => {
      const result = pick("hello world").string()?.maxLength(5);
      expect(result).toBeUndefined();
    });
  });

  describe("length", () => {
    it("should validate exact length", () => {
      const result = pick("hello").string()?.length(5);
      expect(result?.valueOf()).toBe("hello");
    });

    it("should return undefined if length doesn't match", () => {
      const result = pick("hello").string()?.length(3);
      expect(result).toBeUndefined();
    });
  });

  describe("matches", () => {
    it("should validate regex pattern", () => {
      const result = pick("hello123")
        .string()
        ?.matches(/^[a-z]+\d+$/);
      expect(result?.valueOf()).toBe("hello123");
    });

    it("should accept string pattern", () => {
      const result = pick("hello").string()?.matches("^[a-z]+$");
      expect(result?.valueOf()).toBe("hello");
    });

    it("should return undefined if doesn't match", () => {
      const result = pick("hello").string()?.matches(/^\d+$/);
      expect(result).toBeUndefined();
    });
  });

  describe("startsWith", () => {
    it("should validate prefix", () => {
      const result = pick("hello world").string()?.startsWith("hello");
      expect(result?.valueOf()).toBe("hello world");
    });

    it("should return undefined if doesn't start with prefix", () => {
      const result = pick("hello world").string()?.startsWith("world");
      expect(result).toBeUndefined();
    });
  });

  describe("endsWith", () => {
    it("should validate suffix", () => {
      const result = pick("hello world").string()?.endsWith("world");
      expect(result?.valueOf()).toBe("hello world");
    });

    it("should return undefined if doesn't end with suffix", () => {
      const result = pick("hello world").string()?.endsWith("hello");
      expect(result).toBeUndefined();
    });
  });

  describe("includes", () => {
    it("should validate substring", () => {
      const result = pick("hello world").string()?.includes("lo wo");
      expect(result?.valueOf()).toBe("hello world");
    });

    it("should return undefined if doesn't include substring", () => {
      const result = pick("hello world").string()?.includes("xyz");
      expect(result).toBeUndefined();
    });
  });

  describe("notEmpty", () => {
    it("should validate non-empty string", () => {
      const result = pick("hello").string()?.notEmpty();
      expect(result?.valueOf()).toBe("hello");
    });

    it("should return undefined for empty string", () => {
      const result = pick("").string()?.notEmpty();
      expect(result).toBeUndefined();
    });
  });

  describe("email", () => {
    it("should validate email format", () => {
      const result = pick("test@example.com").string()?.email();
      expect(result?.valueOf()).toBe("test@example.com");
    });

    it("should return undefined for invalid email", () => {
      expect(pick("invalid").string()?.email()).toBeUndefined();
      expect(pick("@example.com").string()?.email()).toBeUndefined();
      expect(pick("test@").string()?.email()).toBeUndefined();
    });
  });

  describe("url", () => {
    it("should validate URL format", () => {
      const result = pick("https://example.com").string()?.url();
      expect(result?.valueOf()).toBe("https://example.com");
    });

    it("should return undefined for invalid URL", () => {
      expect(pick("not a url").string()?.url()).toBeUndefined();
      expect(pick("example.com").string()?.url()).toBeUndefined();
    });
  });

  describe("transformations", () => {
    it("should transform to uppercase", () => {
      const result = pick("hello").string()?.toUpperCase();
      expect(result?.valueOf()).toBe("HELLO");
    });

    it("should transform to lowercase", () => {
      const result = pick("HELLO").string()?.toLowerCase();
      expect(result?.valueOf()).toBe("hello");
    });

    it("should trim whitespace", () => {
      const result = pick("  hello  ").string()?.trim();
      expect(result?.valueOf()).toBe("hello");
    });
  });

  describe("chaining", () => {
    it("should chain multiple validations", () => {
      const result = pick("hello@example.com")
        .string()
        ?.minLength(5)
        ?.maxLength(50)
        ?.email();
      expect(result?.valueOf()).toBe("hello@example.com");
    });

    it("should return undefined if any validation fails", () => {
      const result = pick("hi").string()?.minLength(5)?.email();
      expect(result).toBeUndefined();
    });

    it("should chain transformations and validations", () => {
      const result = pick("  HELLO  ")
        .string()
        ?.trim()
        ?.toLowerCase()
        ?.minLength(3);
      expect(result?.valueOf()).toBe("hello");
    });
  });
});

describe("NumberPick", () => {
  describe("gt", () => {
    it("should validate greater than", () => {
      const result = pick(10).number()?.gt(5);
      expect(result?.valueOf()).toBe(10);
    });

    it("should return undefined if not greater", () => {
      expect(pick(5).number()?.gt(5)).toBeUndefined();
      expect(pick(3).number()?.gt(5)).toBeUndefined();
    });
  });

  describe("gte", () => {
    it("should validate greater than or equal", () => {
      expect(pick(10).number()?.gte(5)?.valueOf()).toBe(10);
      expect(pick(5).number()?.gte(5)?.valueOf()).toBe(5);
    });

    it("should return undefined if less than", () => {
      expect(pick(3).number()?.gte(5)).toBeUndefined();
    });
  });

  describe("lt", () => {
    it("should validate less than", () => {
      const result = pick(3).number()?.lt(5);
      expect(result?.valueOf()).toBe(3);
    });

    it("should return undefined if not less", () => {
      expect(pick(5).number()?.lt(5)).toBeUndefined();
      expect(pick(7).number()?.lt(5)).toBeUndefined();
    });
  });

  describe("lte", () => {
    it("should validate less than or equal", () => {
      expect(pick(3).number()?.lte(5)?.valueOf()).toBe(3);
      expect(pick(5).number()?.lte(5)?.valueOf()).toBe(5);
    });

    it("should return undefined if greater than", () => {
      expect(pick(7).number()?.lte(5)).toBeUndefined();
    });
  });

  describe("between", () => {
    it("should validate range", () => {
      expect(pick(5).number()?.between(1, 10)?.valueOf()).toBe(5);
      expect(pick(1).number()?.between(1, 10)?.valueOf()).toBe(1);
      expect(pick(10).number()?.between(1, 10)?.valueOf()).toBe(10);
    });

    it("should return undefined if outside range", () => {
      expect(pick(0).number()?.between(1, 10)).toBeUndefined();
      expect(pick(11).number()?.between(1, 10)).toBeUndefined();
    });
  });

  describe("positive", () => {
    it("should validate positive numbers", () => {
      expect(pick(5).number()?.positive()?.valueOf()).toBe(5);
      expect(pick(0.1).number()?.positive()?.valueOf()).toBe(0.1);
    });

    it("should return undefined for non-positive", () => {
      expect(pick(0).number()?.positive()).toBeUndefined();
      expect(pick(-5).number()?.positive()).toBeUndefined();
    });
  });

  describe("negative", () => {
    it("should validate negative numbers", () => {
      expect(pick(-5).number()?.negative()?.valueOf()).toBe(-5);
      expect(pick(-0.1).number()?.negative()?.valueOf()).toBe(-0.1);
    });

    it("should return undefined for non-negative", () => {
      expect(pick(0).number()?.negative()).toBeUndefined();
      expect(pick(5).number()?.negative()).toBeUndefined();
    });
  });

  describe("integer", () => {
    it("should validate integers", () => {
      expect(pick(5).number()?.integer()?.valueOf()).toBe(5);
      expect(pick(-10).number()?.integer()?.valueOf()).toBe(-10);
    });

    it("should return undefined for non-integers", () => {
      expect(pick(3.14).number()?.integer()).toBeUndefined();
      expect(pick(0.5).number()?.integer()).toBeUndefined();
    });
  });

  describe("finite", () => {
    it("should validate finite numbers", () => {
      expect(pick(123).number()?.finite()?.valueOf()).toBe(123);
      expect(pick(-456).number()?.finite()?.valueOf()).toBe(-456);
    });

    it("should return undefined for non-finite", () => {
      expect(pick(Infinity).number()?.finite()).toBeUndefined();
      expect(pick(-Infinity).number()?.finite()).toBeUndefined();
      expect(pick(NaN).number()?.finite()).toBeUndefined();
    });
  });

  describe("multipleOf", () => {
    it("should validate multiples", () => {
      expect(pick(10).number()?.multipleOf(5)?.valueOf()).toBe(10);
      expect(pick(15).number()?.multipleOf(3)?.valueOf()).toBe(15);
    });

    it("should return undefined for non-multiples", () => {
      expect(pick(10).number()?.multipleOf(3)).toBeUndefined();
      expect(pick(7).number()?.multipleOf(2)).toBeUndefined();
    });
  });

  describe("chaining", () => {
    it("should chain multiple validations", () => {
      const result = pick(50)
        .number()
        ?.positive()
        ?.between(1, 100)
        ?.multipleOf(10);
      expect(result?.valueOf()).toBe(50);
    });

    it("should return undefined if any validation fails", () => {
      const result = pick(55)
        .number()
        ?.positive()
        ?.between(1, 100)
        ?.multipleOf(10);
      expect(result).toBeUndefined();
    });

    it("should work with integer validation", () => {
      const result = pick(42).number()?.integer()?.gte(0)?.lte(100);
      expect(result?.valueOf()).toBe(42);
    });
  });
});

describe("date", () => {
  describe("date validation", () => {
    it("should validate Date objects", () => {
      const date = new Date("2024-01-01");
      const result = pick(date).date();
      expect(result?.valueOf()).toEqual(date);
    });

    it("should validate timestamps (numbers)", () => {
      const timestamp = 1704067200000; // 2024-01-01
      const result = pick(timestamp).date();
      expect(result).toBeInstanceOf(DatePick);
      expect(result?.valueOf()).toBe(timestamp);
    });

    it("should validate date strings", () => {
      const dateString = "2024-01-01";
      const result = pick(dateString).date();
      expect(result).toBeInstanceOf(DatePick);
      expect(result?.valueOf()).toBe(dateString);
    });

    it("should return undefined for invalid date strings", () => {
      const result = pick("not a date").date();
      expect(result).toBeUndefined();
    });

    it("should return undefined for NaN", () => {
      const result = pick(NaN).date();
      expect(result).toBeUndefined();
    });

    it("should return undefined for invalid Date objects", () => {
      const invalidDate = new Date("invalid");
      const result = pick(invalidDate).date();
      expect(result).toBeUndefined();
    });

    it("should validate valid Date objects", () => {
      const date = new Date();
      const result = pick(date).date();
      expect(result?.valueOf()).toBeInstanceOf(Date);
      expect(result?.valueOf()).toEqual(date);
    });

    it("pick(new Date(...)).date().value instanceof Date", () => {
      const date = new Date("2024-01-01");
      const result = pick(date).date();
      expect(result?.value).toBeInstanceOf(Date);
    });

    it("pick(124342).date().value === 124342", () => {
      const timestamp = 124342;
      const result = pick(timestamp).date();
      // date() ahora acepta números (timestamps), y el valor original se mantiene
      expect(result?.value).toBe(124342);
    });

    it("pick(124342).date().valueOf() === 124342", () => {
      const timestamp = 124342;
      const result = pick(timestamp).date();
      // date() ahora acepta números (timestamps), y valueOf retorna el valor original
      expect(result?.valueOf()).toBe(124342);
    });

    it("pick(new Date()).date() instanceof DatePick", () => {
      const date = new Date();
      const result = pick(date).date();
      expect(result).toBeInstanceOf(DatePick);
    });

    it("pick(1234).date().after(...).before(...).valueOf() === 1234", () => {
      const timestamp = 1234;
      const result = pick(timestamp).date()?.after(0)?.before(10000);

      // El valor original se mantiene sin modificar después de las validaciones
      expect(result?.valueOf()).toBe(1234);
    });
  });

  describe("DatePick.after", () => {
    it("should validate date is after minimum date", () => {
      const date = new Date("2024-06-15");
      const result = pick(date).date()?.after(new Date("2024-01-01"));
      expect(result?.valueOf()).toEqual(date);
    });

    it("should return undefined if date is before minimum", () => {
      const date = new Date("2023-12-31");
      const result = pick(date).date()?.after(new Date("2024-01-01"));
      expect(result).toBeUndefined();
    });

    it("should accept timestamp as minimum", () => {
      const date = new Date("2024-06-15");
      const minTimestamp = new Date("2024-01-01").getTime();
      const result = pick(date).date()?.after(minTimestamp);
      expect(result?.valueOf()).toEqual(date);
    });

    it("should accept string as minimum", () => {
      const date = new Date("2024-06-15");
      const result = pick(date).date()?.after("2024-01-01");
      expect(result?.valueOf()).toEqual(date);
    });

    it("should return undefined for invalid minimum date", () => {
      const date = new Date("2024-06-15");
      const result = pick(date).date()?.after("invalid");
      expect(result).toBeUndefined();
    });
  });

  describe("DatePick.before", () => {
    it("should validate date is before maximum date", () => {
      const date = new Date("2024-06-15");
      const result = pick(date).date()?.before(new Date("2024-12-31"));
      expect(result?.valueOf()).toEqual(date);
    });

    it("should return undefined if date is after maximum", () => {
      const date = new Date("2025-01-01");
      const result = pick(date).date()?.before(new Date("2024-12-31"));
      expect(result).toBeUndefined();
    });

    it("should accept timestamp as maximum", () => {
      const date = new Date("2024-06-15");
      const maxTimestamp = new Date("2024-12-31").getTime();
      const result = pick(date).date()?.before(maxTimestamp);
      expect(result?.valueOf()).toEqual(date);
    });

    it("should accept string as maximum", () => {
      const date = new Date("2024-06-15");
      const result = pick(date).date()?.before("2024-12-31");
      expect(result?.valueOf()).toEqual(date);
    });
  });

  describe("DatePick.between", () => {
    it("should validate date is within range", () => {
      const date = new Date("2024-06-15");
      const result = pick(date)
        .date()
        ?.between(new Date("2024-01-01"), new Date("2024-12-31"));
      expect(result?.valueOf()).toEqual(date);
    });

    it("should return undefined if date is before range", () => {
      const date = new Date("2023-12-31");
      const result = pick(date)
        .date()
        ?.between(new Date("2024-01-01"), new Date("2024-12-31"));
      expect(result).toBeUndefined();
    });

    it("should return undefined if date is after range", () => {
      const date = new Date("2025-01-01");
      const result = pick(date)
        .date()
        ?.between(new Date("2024-01-01"), new Date("2024-12-31"));
      expect(result).toBeUndefined();
    });

    it("should accept timestamps", () => {
      const date = new Date("2024-06-15");
      const minTime = new Date("2024-01-01").getTime();
      const maxTime = new Date("2024-12-31").getTime();
      const result = pick(date).date()?.between(minTime, maxTime);
      expect(result?.valueOf()).toEqual(date);
    });
  });

  describe("DatePick.number", () => {
    it("should convert Date to timestamp", () => {
      const date = new Date("2024-01-01");
      const result = pick(date).date()?.number();
      expect(result?.valueOf()).toBe(date.getTime());
      expectTypeOf(result).toEqualTypeOf<NumberPick | undefined>();
    });

    it("should work after date range validation", () => {
      const date = new Date("2024-06-15");
      const result = pick(date)
        .date()
        ?.after(new Date(2020, 0, 1))
        ?.before(new Date(2025, 11, 31))
        ?.number();

      expect(result?.valueOf()).toBe(date.getTime());
      expectTypeOf(result).toEqualTypeOf<NumberPick | undefined>();
    });

    it("should return undefined if date validation fails", () => {
      const date = new Date("2019-12-31");
      const result = pick(date)
        .date()
        ?.after(new Date(2020, 0, 1))
        ?.number();

      expect(result).toBeUndefined();
    });

    it("should allow chaining number validations", () => {
      const date = new Date("2024-06-15");
      const timestamp = date.getTime();
      const result = pick(date).date()?.number()?.gt(0);

      expect(result?.valueOf()).toBe(timestamp);
    });
  });

  describe("date chaining", () => {
    it("should chain after and before", () => {
      const date = new Date("2024-06-15");
      const result = pick(date)
        .date()
        ?.after(new Date("2024-01-01"))
        ?.before(new Date("2024-12-31"));
      expect(result?.valueOf()).toEqual(date);
    });

    it("should work with timestamps", () => {
      const timestamp = Date.now();
      const result = pick(timestamp).date();
      expect(result).toBeInstanceOf(DatePick);
      expect(result?.valueOf()).toBe(timestamp);
    });

    it("should work with string input", () => {
      const dateString = "2024-06-15";
      const result = pick(dateString).date();
      expect(result).toBeInstanceOf(DatePick);
      expect(result?.valueOf()).toBe(dateString);
    });

    it("should return undefined if any validation fails", () => {
      const date = new Date("2024-06-15");
      const result = pick(date)
        .date()
        ?.after(new Date("2024-01-01"))
        ?.before(new Date("2024-06-01"));
      expect(result).toBeUndefined();
    });
  });

  describe("date type checking", () => {
    it("should have correct types for date", () => {
      const result = pick(new Date()).date();
      expectTypeOf(result).toEqualTypeOf<DatePick | undefined>();
    });

    it("should have correct types for after", () => {
      const result = pick(new Date()).date()?.after(new Date());
      expectTypeOf(result).toEqualTypeOf<DatePick | undefined>();
    });

    it("should have correct types for before", () => {
      const result = pick(new Date()).date()?.before(new Date());
      expectTypeOf(result).toEqualTypeOf<DatePick | undefined>();
    });

    it("should have correct types for between", () => {
      const result = pick(new Date()).date()?.between(new Date(), new Date());
      expectTypeOf(result).toEqualTypeOf<DatePick | undefined>();
    });
  });
});
describe("divisibleBy", () => {
  describe("NumberPick", () => {
    it("should validate divisible numbers", () => {
      expect(pick(10).number()?.divisibleBy(5)?.valueOf()).toBe(10);
      expect(pick(15).number()?.divisibleBy(3)?.valueOf()).toBe(15);
      expect(pick(100).number()?.divisibleBy(10)?.valueOf()).toBe(100);
    });

    it("should return undefined for non-divisible numbers", () => {
      expect(pick(10).number()?.divisibleBy(3)).toBeUndefined();
      expect(pick(7).number()?.divisibleBy(2)).toBeUndefined();
    });

    it("should return undefined for division by zero", () => {
      expect(pick(10).number()?.divisibleBy(0)).toBeUndefined();
    });

    it("should work with decimal divisors", () => {
      expect(pick(10).number()?.divisibleBy(2.5)?.valueOf()).toBe(10);
      expect(pick(7.5).number()?.divisibleBy(2.5)?.valueOf()).toBe(7.5);
    });
  });

  describe("IntegerPick", () => {
    it("should validate divisible integers", () => {
      expect(pick(12).integer()?.divisibleBy(3)?.valueOf()).toBe(12);
      expect(pick(20).integer()?.divisibleBy(5)?.valueOf()).toBe(20);
    });

    it("should return undefined for non-divisible integers", () => {
      expect(pick(10).integer()?.divisibleBy(3)).toBeUndefined();
      expect(pick(7).integer()?.divisibleBy(2)).toBeUndefined();
    });
  });

  describe("BigIntPick", () => {
    it("should validate divisible bigints", () => {
      expect(pick(100n).bigInt()?.divisibleBy(10n)?.valueOf()).toBe(100n);
      expect(pick(12345n).bigInt()?.divisibleBy(5n)?.valueOf()).toBe(12345n);
    });

    it("should return undefined for non-divisible bigints", () => {
      expect(pick(10n).bigInt()?.divisibleBy(3n)).toBeUndefined();
      expect(pick(7n).bigInt()?.divisibleBy(2n)).toBeUndefined();
    });

    it("should return undefined for division by zero", () => {
      expect(pick(10n).bigInt()?.divisibleBy(0n)).toBeUndefined();
    });
  });
});

describe("even", () => {
  describe("NumberPick", () => {
    it("should validate even numbers", () => {
      expect(pick(2).number()?.even()?.valueOf()).toBe(2);
      expect(pick(10).number()?.even()?.valueOf()).toBe(10);
      expect(pick(0).number()?.even()?.valueOf()).toBe(0);
      expect(pick(-4).number()?.even()?.valueOf()).toBe(-4);
    });

    it("should return undefined for odd numbers", () => {
      expect(pick(1).number()?.even()).toBeUndefined();
      expect(pick(5).number()?.even()).toBeUndefined();
      expect(pick(-3).number()?.even()).toBeUndefined();
    });

    it("should return undefined for non-integer numbers", () => {
      expect(pick(2.5).number()?.even()).toBeUndefined();
      expect(pick(3.14).number()?.even()).toBeUndefined();
    });
  });

  describe("IntegerPick", () => {
    it("should validate even integers", () => {
      expect(pick(4).integer()?.even()?.valueOf()).toBe(4);
      expect(pick(100).integer()?.even()?.valueOf()).toBe(100);
    });

    it("should return undefined for odd integers", () => {
      expect(pick(3).integer()?.even()).toBeUndefined();
      expect(pick(99).integer()?.even()).toBeUndefined();
    });
  });

  describe("BigIntPick", () => {
    it("should validate even bigints", () => {
      expect(pick(4n).bigInt()?.even()?.valueOf()).toBe(4n);
      expect(pick(100n).bigInt()?.even()?.valueOf()).toBe(100n);
      expect(pick(0n).bigInt()?.even()?.valueOf()).toBe(0n);
    });

    it("should return undefined for odd bigints", () => {
      expect(pick(3n).bigInt()?.even()).toBeUndefined();
      expect(pick(99n).bigInt()?.even()).toBeUndefined();
    });
  });
});

describe("odd", () => {
  describe("NumberPick", () => {
    it("should validate odd numbers", () => {
      expect(pick(1).number()?.odd()?.valueOf()).toBe(1);
      expect(pick(5).number()?.odd()?.valueOf()).toBe(5);
      expect(pick(-3).number()?.odd()?.valueOf()).toBe(-3);
    });

    it("should return undefined for even numbers", () => {
      expect(pick(2).number()?.odd()).toBeUndefined();
      expect(pick(10).number()?.odd()).toBeUndefined();
      expect(pick(0).number()?.odd()).toBeUndefined();
      expect(pick(-4).number()?.odd()).toBeUndefined();
    });

    it("should return undefined for non-integer numbers", () => {
      expect(pick(1.5).number()?.odd()).toBeUndefined();
      expect(pick(3.14).number()?.odd()).toBeUndefined();
    });
  });

  describe("IntegerPick", () => {
    it("should validate odd integers", () => {
      expect(pick(3).integer()?.odd()?.valueOf()).toBe(3);
      expect(pick(99).integer()?.odd()?.valueOf()).toBe(99);
    });

    it("should return undefined for even integers", () => {
      expect(pick(4).integer()?.odd()).toBeUndefined();
      expect(pick(100).integer()?.odd()).toBeUndefined();
    });
  });

  describe("BigIntPick", () => {
    it("should validate odd bigints", () => {
      expect(pick(3n).bigInt()?.odd()?.valueOf()).toBe(3n);
      expect(pick(99n).bigInt()?.odd()?.valueOf()).toBe(99n);
    });

    it("should return undefined for even bigints", () => {
      expect(pick(4n).bigInt()?.odd()).toBeUndefined();
      expect(pick(100n).bigInt()?.odd()).toBeUndefined();
      expect(pick(0n).bigInt()?.odd()).toBeUndefined();
    });
  });
});

describe("instanceOf", () => {
  it("should validate Date instances", () => {
    const date = new Date();
    expect(pick(date).instanceOf(Date)?.valueOf()).toBe(date);
  });

  it("should validate Error instances", () => {
    const error = new Error("test");
    expect(pick(error).instanceOf(Error)?.valueOf()).toBe(error);
  });

  it("should validate Array instances", () => {
    const arr = [1, 2, 3];
    expect(pick(arr).instanceOf(Array)?.valueOf()).toBe(arr);
  });

  it("should validate Map instances", () => {
    const map = new Map();
    expect(pick(map).instanceOf(Map)?.valueOf()).toBe(map);
  });

  it("should validate Set instances", () => {
    const set = new Set([1, 2, 3]);
    expect(pick(set).instanceOf(Set)?.valueOf()).toBe(set);
  });

  it("should return undefined for non-instances", () => {
    expect(pick("string").instanceOf(Date)).toBeUndefined();
    expect(pick(123).instanceOf(Error)).toBeUndefined();
    expect(pick({}).instanceOf(Array)).toBeUndefined();
  });

  it("should work with custom classes", () => {
    class User {
      constructor(public name: string) {}
    }

    const user = new User("John");
    expect(pick(user).instanceOf(User)?.valueOf()).toBe(user);
    expect(pick({ name: "John" }).instanceOf(User)).toBeUndefined();
  });

  it("should work with inheritance", () => {
    class Animal {
      constructor(public name: string) {}
    }

    class Dog extends Animal {
      constructor(
        name: string,
        public breed: string,
      ) {
        super(name);
      }
    }

    const dog = new Dog("Rex", "Labrador");
    expect(pick(dog).instanceOf(Dog)?.valueOf()).toBe(dog);
    expect(pick(dog).instanceOf(Animal)?.valueOf()).toBe(dog);
  });

  it("should chain with other methods", () => {
    const date = new Date("2024-01-01");
    const year = pick(date)
      .instanceOf(Date)
      ?.pipe((d) => d.getFullYear())
      .valueOf();
    expect(year).toBe(2024);
  });

  it("should have correct types", () => {
    const result = pick(new Date()).instanceOf(Date);
    expectTypeOf(result).toEqualTypeOf<Pick<Date> | undefined>();
  });
});

describe("NumericalPick interface", () => {
  it("should have consistent API across NumberPick, IntegerPick, and BigIntPick", () => {
    // NumberPick
    expect(pick(10).number()?.gt(5)?.valueOf()).toBe(10);
    expect(pick(10).number()?.positive()?.valueOf()).toBe(10);
    expect(pick(10).number()?.even()?.valueOf()).toBe(10);
    expect(pick(10).number()?.divisibleBy(5)?.valueOf()).toBe(10);

    // IntegerPick
    expect(pick(10).integer()?.gt(5)?.valueOf()).toBe(10);
    expect(pick(10).integer()?.positive()?.valueOf()).toBe(10);
    expect(pick(10).integer()?.even()?.valueOf()).toBe(10);
    expect(pick(10).integer()?.divisibleBy(5)?.valueOf()).toBe(10);

    // BigIntPick
    expect(pick(10n).bigInt()?.gt(5n)?.valueOf()).toBe(10n);
    expect(pick(10n).bigInt()?.positive()?.valueOf()).toBe(10n);
    expect(pick(10n).bigInt()?.even()?.valueOf()).toBe(10n);
    expect(pick(10n).bigInt()?.divisibleBy(5n)?.valueOf()).toBe(10n);
  });

  it("should chain multiple numerical validations", () => {
    // NumberPick
    const num = pick(20)
      .number()
      ?.positive()
      ?.even()
      ?.divisibleBy(5)
      ?.between(10, 30);
    expect(num?.valueOf()).toBe(20);

    // IntegerPick
    const int = pick(20)
      .integer()
      ?.positive()
      ?.even()
      ?.divisibleBy(5)
      ?.between(10, 30);
    expect(int?.valueOf()).toBe(20);

    // BigIntPick
    const bigInt = pick(20n)
      .bigInt()
      ?.positive()
      ?.even()
      ?.divisibleBy(5n)
      ?.between(10n, 30n);
    expect(bigInt?.valueOf()).toBe(20n);
  });
});
