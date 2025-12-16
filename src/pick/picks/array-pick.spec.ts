import { describe, it, expect, expectTypeOf } from "bun:test";
import { pick } from "../pick.js";
import { ArrayPick } from "./array-pick.js";
import { Pick } from "./pick.js";

describe("ArrayPick", () => {
  describe("constructor", () => {
    it("should create ArrayPick with an array", () => {
      const arr = [1, 2, 3];
      const arrayPick = new ArrayPick(arr);
      expect(arrayPick.value).toBe(arr);
    });

    it("should work with different array types", () => {
      expect(new ArrayPick([1, 2, 3]).value).toEqual([1, 2, 3]);
      expect(new ArrayPick(["a", "b", "c"]).value).toEqual(["a", "b", "c"]);
      expect(new ArrayPick([true, false]).value).toEqual([true, false]);
    });

    it("should work with empty arrays", () => {
      const arrayPick = new ArrayPick([]);
      expect(arrayPick.value).toEqual([]);
    });
  });

  describe("minLength", () => {
    it("should validate minimum length", () => {
      const result = pick([1, 2, 3]).array()?.minLength(2);
      expect(result?.valueOf()).toEqual([1, 2, 3]);
    });

    it("should return undefined if too short", () => {
      const result = pick([1]).array()?.minLength(2);
      expect(result).toBeUndefined();
    });

    it("should accept exact minimum length", () => {
      const result = pick([1, 2, 3]).array()?.minLength(3);
      expect(result?.valueOf()).toEqual([1, 2, 3]);
    });

    it("should work with empty arrays", () => {
      expect(pick([]).array()?.minLength(0)?.valueOf()).toEqual([]);
      expect(pick([]).array()?.minLength(1)).toBeUndefined();
    });
  });

  describe("maxLength", () => {
    it("should validate maximum length", () => {
      const result = pick([1, 2]).array()?.maxLength(5);
      expect(result?.valueOf()).toEqual([1, 2]);
    });

    it("should return undefined if too long", () => {
      const result = pick([1, 2, 3, 4, 5, 6]).array()?.maxLength(5);
      expect(result).toBeUndefined();
    });

    it("should accept exact maximum length", () => {
      const result = pick([1, 2, 3]).array()?.maxLength(3);
      expect(result?.valueOf()).toEqual([1, 2, 3]);
    });

    it("should work with empty arrays", () => {
      expect(pick([]).array()?.maxLength(0)?.valueOf()).toEqual([]);
      expect(pick([]).array()?.maxLength(5)?.valueOf()).toEqual([]);
    });
  });

  describe("length", () => {
    it("should validate exact length", () => {
      const result = pick([1, 2, 3]).array()?.length(3);
      expect(result?.valueOf()).toEqual([1, 2, 3]);
    });

    it("should return undefined if length doesn't match", () => {
      expect(pick([1, 2]).array()?.length(3)).toBeUndefined();
      expect(pick([1, 2, 3, 4]).array()?.length(3)).toBeUndefined();
    });

    it("should work with empty arrays", () => {
      expect(pick([]).array()?.length(0)?.valueOf()).toEqual([]);
      expect(pick([]).array()?.length(1)).toBeUndefined();
    });
  });

  describe("notEmpty", () => {
    it("should validate non-empty arrays", () => {
      const result = pick([1]).array()?.notEmpty();
      expect(result?.valueOf()).toEqual([1]);
    });

    it("should return undefined for empty arrays", () => {
      const result = pick([]).array()?.notEmpty();
      expect(result).toBeUndefined();
    });

    it("should work with arrays of different types", () => {
      expect(pick(["a"]).array()?.notEmpty()?.valueOf()).toEqual(["a"]);
      expect(pick([null]).array()?.notEmpty()?.valueOf()).toEqual([null]);
      expect(pick([undefined]).array()?.notEmpty()?.valueOf()).toEqual([
        undefined,
      ]);
    });
  });

  describe("includes", () => {
    it("should validate that array includes an element", () => {
      const result = pick([1, 2, 3]).array()?.includes(2);
      expect(result?.valueOf()).toEqual([1, 2, 3]);
    });

    it("should return undefined if element is not included", () => {
      const result = pick([1, 2, 3]).array()?.includes(5);
      expect(result).toBeUndefined();
    });

    it("should work with strings", () => {
      expect(pick(["a", "b", "c"]).array()?.includes("b")?.valueOf()).toEqual([
        "a",
        "b",
        "c",
      ]);
      expect(pick(["a", "b", "c"]).array()?.includes("d")).toBeUndefined();
    });

    it("should work with objects (reference equality)", () => {
      const obj = { id: 1 };
      expect(pick([obj]).array()?.includes(obj)?.valueOf()).toEqual([obj]);
      expect(pick([obj]).array()?.includes({ id: 1 })).toBeUndefined();
    });

    it("should distinguish between similar values", () => {
      expect(pick([0]).array()?.includes(false)).toBeUndefined();
      expect(pick([""]).array()?.includes(false)).toBeUndefined();
      expect(pick([null]).array()?.includes(undefined)).toBeUndefined();
    });
  });

  describe("first", () => {
    it("should get the first element", () => {
      const result = pick([1, 2, 3]).array()?.first();
      expect(result?.valueOf()).toBe(1);
    });

    it("should return undefined for empty arrays", () => {
      const result = pick([]).array()?.first();
      expect(result).toBeUndefined();
    });

    it("should return Pick instance", () => {
      const result = pick(["a", "b", "c"]).array()?.first();
      expect(result).toBeInstanceOf(Pick);
      expect(result?.valueOf()).toBe("a");
    });

    it("should work with different types", () => {
      expect(pick([true, false]).array()?.first()?.valueOf()).toBe(true);
      expect(
        pick([{ id: 1 }])
          .array()
          ?.first()
          ?.valueOf(),
      ).toEqual({ id: 1 });
    });
  });

  describe("last", () => {
    it("should get the last element", () => {
      const result = pick([1, 2, 3]).array()?.last();
      expect(result?.valueOf()).toBe(3);
    });

    it("should return undefined for empty arrays", () => {
      const result = pick([]).array()?.last();
      expect(result).toBeUndefined();
    });

    it("should return Pick instance", () => {
      const result = pick(["a", "b", "c"]).array()?.last();
      expect(result).toBeInstanceOf(Pick);
      expect(result?.valueOf()).toBe("c");
    });

    it("should work with single element arrays", () => {
      expect(pick([42]).array()?.last()?.valueOf()).toBe(42);
    });
  });

  describe("at", () => {
    it("should get element at positive index", () => {
      const result = pick([1, 2, 3]).array()?.at(1);
      expect(result?.valueOf()).toBe(2);
    });

    it("should get element at negative index", () => {
      const result = pick([1, 2, 3]).array()?.at(-1);
      expect(result?.valueOf()).toBe(3);
    });

    it("should return undefined for out of bounds index", () => {
      expect(pick([1, 2, 3]).array()?.at(10)).toBeUndefined();
      expect(pick([1, 2, 3]).array()?.at(-10)).toBeUndefined();
    });

    it("should return Pick instance", () => {
      const result = pick(["a", "b", "c"]).array()?.at(0);
      expect(result).toBeInstanceOf(Pick);
    });

    it("should work with index 0", () => {
      expect(pick([1, 2, 3]).array()?.at(0)?.valueOf()).toBe(1);
    });
  });

  describe("filter (deprecated)", () => {
    it("should filter array elements", () => {
      const result = pick([1, 2, 3, 4, 5])
        .array()
        ?.filter((n) => n > 3);
      expect(result?.valueOf()).toEqual([4, 5]);
    });

    it("should return empty array if no matches", () => {
      const result = pick([1, 2, 3])
        .array()
        ?.filter((n) => n > 10);
      expect(result?.valueOf()).toEqual([]);
    });

    it("should work with strings", () => {
      const result = pick(["apple", "banana", "cherry"])
        .array()
        ?.filter((s) => s.startsWith("a"));
      expect(result?.valueOf()).toEqual(["apple"]);
    });

    it("should not mutate original array", () => {
      const original = [1, 2, 3, 4, 5];
      const arrayPick = pick(original).array();
      arrayPick?.filter((n) => n > 3);
      expect(original).toEqual([1, 2, 3, 4, 5]);
    });

    it("should return new ArrayPick instance", () => {
      const original = pick([1, 2, 3]).array();
      const filtered = original?.filter((n) => n > 1);
      expect(filtered).toBeInstanceOf(ArrayPick);
      expect(filtered).not.toBe(original);
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

    it("should return undefined if any validation fails", () => {
      const result = pick([1, 2, 3]).array()?.minLength(5);
      expect(result).toBeUndefined();
    });

    it("should chain with first/last/at", () => {
      const result = pick([1, 2, 3, 4, 5])
        .array()
        ?.minLength(3)
        ?.last()
        ?.valueOf();
      expect(result).toBe(5);
    });

    it("should chain with pipe", () => {
      const result = pick([1, 2, 3])
        .array()
        ?.pipe((arr) => arr.map((n) => n * 2))
        .valueOf();
      expect(result).toEqual([2, 4, 6]);
    });

    it("should chain with enum", () => {
      const arr = [1, 2, 3];
      const result = pick(arr)
        .array()
        ?.enum([arr, [4, 5, 6]]);
      expect(result?.valueOf()).toBe(arr);
    });
  });

  describe("type checking", () => {
    it("should have correct types for array()", () => {
      const result = pick([1, 2, 3]).array();
      expectTypeOf(result).toEqualTypeOf<ArrayPick<unknown> | undefined>();
    });

    it("should have correct types for validations", () => {
      const result = pick([1, 2, 3]).array()?.minLength(2);
      expectTypeOf(result).toEqualTypeOf<ArrayPick<unknown> | undefined>();
    });

    it("should have correct types for first()", () => {
      const result = pick([1, 2, 3]).array()?.first();
      expectTypeOf(result).toEqualTypeOf<Pick<unknown> | undefined>();
    });

    it("should have correct types for last()", () => {
      const result = pick([1, 2, 3]).array()?.last();
      expectTypeOf(result).toEqualTypeOf<Pick<unknown> | undefined>();
    });

    it("should have correct types for at()", () => {
      const result = pick([1, 2, 3]).array()?.at(0);
      expectTypeOf(result).toEqualTypeOf<Pick<unknown> | undefined>();
    });

    it("should have correct types for filter()", () => {
      const result = pick([1, 2, 3])
        .array()
        ?.filter((n) => n > 1);
      expectTypeOf(result).toEqualTypeOf<ArrayPick<unknown>>();
    });
  });

  describe("immutability", () => {
    it("should not modify the original array", () => {
      const original = [1, 2, 3];
      const arrayPick = pick(original).array();
      arrayPick?.minLength(2);
      expect(original).toEqual([1, 2, 3]);
    });

    it("should maintain array reference", () => {
      const original = [1, 2, 3];
      const arrayPick = pick(original).array();
      expect(arrayPick?.valueOf()).toBe(original);
    });

    it("should not mutate when using filter", () => {
      const original = [1, 2, 3, 4, 5];
      pick(original)
        .array()
        ?.filter((n) => n > 3);
      expect(original).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe("edge cases", () => {
    it("should handle arrays with null values", () => {
      const result = pick([null, null]).array()?.notEmpty();
      expect(result?.valueOf()).toEqual([null, null]);
    });

    it("should handle arrays with undefined values", () => {
      const result = pick([undefined, undefined]).array()?.length(2);
      expect(result?.valueOf()).toEqual([undefined, undefined]);
    });

    it("should handle arrays with mixed types", () => {
      const mixed = [1, "two", true, null, undefined];
      const result = pick(mixed).array()?.length(5);
      expect(result?.valueOf()).toEqual(mixed);
    });

    it("should handle nested arrays", () => {
      const nested = [
        [1, 2],
        [3, 4],
      ];
      const result = pick(nested).array()?.first();
      expect(result?.valueOf()).toEqual([1, 2]);
    });

    it("should handle arrays with objects", () => {
      const objects = [{ id: 1 }, { id: 2 }];
      const result = pick(objects).array()?.length(2);
      expect(result?.valueOf()).toEqual(objects);
    });

    it("should handle large arrays", () => {
      const large = Array.from({ length: 1000 }, (_, i) => i);
      const result = pick(large).array()?.minLength(1000);
      expect(result?.valueOf()).toEqual(large);
    });

    it("should handle arrays with NaN", () => {
      const result = pick([NaN, NaN]).array()?.length(2);
      expect(result?.valueOf()).toEqual([NaN, NaN]);
    });

    it("should handle arrays with Infinity", () => {
      const result = pick([Infinity, -Infinity]).array()?.notEmpty();
      expect(result?.valueOf()).toEqual([Infinity, -Infinity]);
    });
  });

  describe("real-world scenarios", () => {
    it("should validate user list", () => {
      const users = [
        { name: "Alice", age: 25 },
        { name: "Bob", age: 30 },
      ];
      const result = pick(users).array()?.minLength(1)?.notEmpty();
      expect(result?.valueOf()).toEqual(users);
    });

    it("should get first user from list", () => {
      const users = [
        { name: "Alice", age: 25 },
        { name: "Bob", age: 30 },
      ];
      const firstUser = pick(users).array()?.first()?.valueOf();
      expect(firstUser).toEqual({ name: "Alice", age: 25 });
    });

    it("should validate array length range", () => {
      const validatePageSize = (items: unknown) =>
        pick(items).array()?.minLength(1)?.maxLength(100);

      expect(validatePageSize([1, 2, 3])?.valueOf()).toEqual([1, 2, 3]);
      expect(validatePageSize([])).toBeUndefined();
      expect(validatePageSize(Array(101).fill(1))).toBeUndefined();
    });

    it("should filter and validate results", () => {
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = pick(numbers)
        .array()
        ?.filter((n) => n % 2 === 0)
        .notEmpty();
      expect(result?.valueOf()).toEqual([2, 4, 6, 8, 10]);
    });

    it("should get last item from history", () => {
      const history = ["page1", "page2", "page3"];
      const currentPage = pick(history).array()?.notEmpty()?.last()?.valueOf();
      expect(currentPage).toBe("page3");
    });

    it("should validate required fields array", () => {
      const requiredFields = ["name", "email", "password"];
      const result = pick(requiredFields)
        .array()
        ?.minLength(1)
        ?.includes("email");
      expect(result?.valueOf()).toEqual(requiredFields);
    });

    it("should process tags array", () => {
      const tags = ["javascript", "typescript", "nodejs"];
      const result = pick(tags)
        .array()
        ?.minLength(1)
        ?.maxLength(10)
        ?.pipe((arr) => arr.map((tag) => tag.toUpperCase()));
      expect(result?.valueOf()).toEqual(["JAVASCRIPT", "TYPESCRIPT", "NODEJS"]);
    });

    it("should validate pagination results", () => {
      const items = Array.from({ length: 20 }, (_, i) => ({ id: i + 1 }));
      const page = pick(items).array()?.minLength(1)?.maxLength(50);
      expect(page?.valueOf()).toEqual(items);
    });

    it("should get element by index with validation", () => {
      const items = ["first", "second", "third"];
      const secondItem = pick(items).array()?.minLength(2)?.at(1)?.valueOf();
      expect(secondItem).toBe("second");
    });

    it("should validate and transform array", () => {
      const scores = [85, 92, 78, 95, 88];
      const result = pick(scores)
        .array()
        ?.minLength(1)
        ?.pipe((arr) => ({
          count: arr.length,
          average: arr.reduce((a, b) => a + b, 0) / arr.length,
        }));
      expect(result?.valueOf()).toEqual({
        count: 5,
        average: 87.6,
      });
    });
  });
});
