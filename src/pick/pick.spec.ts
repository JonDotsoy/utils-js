import { describe, it, expect, expectTypeOf } from "bun:test";
import { pick, type Pick, DatePick } from "./pick";

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
      expectTypeOf(result).toEqualTypeOf<Pick<string> | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<string>();
      }
    });

    it("should have correct types for isNumber", () => {
      const result = pick(123).number();
      expectTypeOf(result).toEqualTypeOf<Pick<number> | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<number>();
      }
    });

    it("should have correct types for isInteger", () => {
      const result = pick(42).integer();
      expectTypeOf(result).toEqualTypeOf<Pick<number> | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<number>();
      }
    });

    it("should have correct types for isBigInt", () => {
      const result = pick(123n).bigInt();
      expectTypeOf(result).toEqualTypeOf<Pick<bigint> | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<bigint>();
      }
    });

    it("should have correct types for isBoolean", () => {
      const result = pick(true).boolean();
      expectTypeOf(result).toEqualTypeOf<Pick<boolean> | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<boolean>();
      }
    });

    it("should have correct types for isArray", () => {
      const result = pick([1, 2, 3]).array();
      expectTypeOf(result).toEqualTypeOf<Pick<Array<unknown>> | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<Array<unknown>>();
      }
    });

    it("should have correct types for isRecord", () => {
      const result = pick({ key: "value" }).record();
      expectTypeOf(result).toEqualTypeOf<
        Pick<Record<string, unknown>> | undefined
      >();
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
      expectTypeOf(result).toEqualTypeOf<Pick<number> | undefined>();
    });

    it("should work after date range validation", () => {
      const date = new Date("2024-06-15");
      const result = pick(date)
        .date()
        ?.after(new Date(2020, 0, 1))
        ?.before(new Date(2025, 11, 31))
        ?.number();

      expect(result?.valueOf()).toBe(date.getTime());
      expectTypeOf(result).toEqualTypeOf<Pick<number> | undefined>();
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
