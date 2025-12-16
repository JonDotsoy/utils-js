import { describe, it, expect, expectTypeOf } from "bun:test";
import { pick } from "../pick.js";
import { StringPick } from "./string-pick.js";
import { NumericPick } from "./numeric-pick.js";
import { URLPick } from "./url-pick.js";

describe("StringPick", () => {
  describe("basic validation", () => {
    it("should create StringPick from string value", () => {
      const result = pick("hello").string();
      expect(result).toBeInstanceOf(StringPick);
      expect(result?.valueOf()).toBe("hello");
    });

    it("should return undefined for non-string values", () => {
      expect(pick(123).string()).toBeUndefined();
      expect(pick(true).string()).toBeUndefined();
      expect(pick(null).string()).toBeUndefined();
      expect(pick({}).string()).toBeUndefined();
    });
  });

  describe("enum validation", () => {
    it("should validate enum values using pick().enum() before string()", () => {
      const colors = ["red", "green", "blue"] as const;
      const result = pick("red")
        .enum([...colors])
        ?.pipe((v) => v);
      expect(result?.valueOf()).toBe("red");
    });

    it("should validate enum and then apply string methods", () => {
      const colors = ["red", "green", "blue"] as const;
      const result = pick("red")
        .enum([...colors])
        ?.pipe((v) => v.toUpperCase());
      expect(result?.valueOf()).toBe("RED");
    });

    it("should return undefined for values not in enum", () => {
      const colors = ["red", "green", "blue"] as const;
      const result = pick("yellow").enum([...colors]);
      expect(result).toBeUndefined();
    });

    it("should work with oneOf to validate enum or other types", () => {
      const result = pick("red").oneOf([
        (v) => v.enum(["red", "green", "blue"]),
        (v) => v.string(),
      ]);
      expect(result?.valueOf()).toBe("red");
    });

    it("should validate enum with string methods using pipe", () => {
      const statuses = ["active", "inactive", "pending"] as const;
      const result = pick("active")
        .enum([...statuses])
        ?.pipe((status) => status.toUpperCase());
      expect(result?.valueOf()).toBe("ACTIVE");
    });

    it("should have correct types for enum", () => {
      const colors = ["red", "green", "blue"] as const;
      const result = pick("red").enum([...colors]);
      expectTypeOf(result?.valueOf()).toEqualTypeOf<
        "red" | "green" | "blue" | undefined
      >();
    });
  });

  describe("minLength", () => {
    it("should validate minimum length", () => {
      const result = pick("hello").string()?.minLength(3);
      expect(result?.valueOf()).toBe("hello");
    });

    it("should return undefined if too short", () => {
      const result = pick("hi").string()?.minLength(5);
      expect(result).toBeUndefined();
    });

    it("should accept exact minimum length", () => {
      const result = pick("hello").string()?.minLength(5);
      expect(result?.valueOf()).toBe("hello");
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

    it("should accept exact maximum length", () => {
      const result = pick("hello").string()?.maxLength(5);
      expect(result?.valueOf()).toBe("hello");
    });
  });

  describe("length", () => {
    it("should validate exact length", () => {
      const result = pick("hello").string()?.length(5);
      expect(result?.valueOf()).toBe("hello");
    });

    it("should return undefined if length doesn't match", () => {
      expect(pick("hello").string()?.length(3)).toBeUndefined();
      expect(pick("hello").string()?.length(10)).toBeUndefined();
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

  describe("uppercase", () => {
    it("should validate uppercase strings", () => {
      const result = pick("HELLO").string()?.uppercase();
      expect(result?.valueOf()).toBe("HELLO");
    });

    it("should validate uppercase with numbers", () => {
      const result = pick("HELLO123").string()?.uppercase();
      expect(result?.valueOf()).toBe("HELLO123");
    });

    it("should validate strings with only numbers", () => {
      const result = pick("123").string()?.uppercase();
      expect(result?.valueOf()).toBe("123");
    });

    it("should validate uppercase with special characters", () => {
      const result = pick("HELLO-WORLD!").string()?.uppercase();
      expect(result?.valueOf()).toBe("HELLO-WORLD!");
    });

    it("should return undefined for mixed case", () => {
      expect(pick("Hello").string()?.uppercase()).toBeUndefined();
      expect(pick("HeLLo").string()?.uppercase()).toBeUndefined();
    });

    it("should return undefined for lowercase", () => {
      expect(pick("hello").string()?.uppercase()).toBeUndefined();
    });

    it("should validate empty string as uppercase", () => {
      const result = pick("").string()?.uppercase();
      expect(result?.valueOf()).toBe("");
    });
  });

  describe("lowercase", () => {
    it("should validate lowercase strings", () => {
      const result = pick("hello").string()?.lowercase();
      expect(result?.valueOf()).toBe("hello");
    });

    it("should validate lowercase with numbers", () => {
      const result = pick("hello123").string()?.lowercase();
      expect(result?.valueOf()).toBe("hello123");
    });

    it("should validate strings with only numbers", () => {
      const result = pick("123").string()?.lowercase();
      expect(result?.valueOf()).toBe("123");
    });

    it("should validate lowercase with special characters", () => {
      const result = pick("hello-world!").string()?.lowercase();
      expect(result?.valueOf()).toBe("hello-world!");
    });

    it("should return undefined for mixed case", () => {
      expect(pick("Hello").string()?.lowercase()).toBeUndefined();
      expect(pick("HeLLo").string()?.lowercase()).toBeUndefined();
    });

    it("should return undefined for uppercase", () => {
      expect(pick("HELLO").string()?.lowercase()).toBeUndefined();
    });

    it("should validate empty string as lowercase", () => {
      const result = pick("").string()?.lowercase();
      expect(result?.valueOf()).toBe("");
    });
  });

  describe("email", () => {
    it("should validate email format", () => {
      const result = pick("user@example.com").string()?.email();
      expect(result?.valueOf()).toBe("user@example.com");
    });

    it("should validate complex email addresses", () => {
      expect(
        pick("test.user+tag@example.co.uk").string()?.email()?.valueOf(),
      ).toBe("test.user+tag@example.co.uk");
      expect(
        pick("user_name@sub-domain.example.com").string()?.email()?.valueOf(),
      ).toBe("user_name@sub-domain.example.com");
    });

    it("should return undefined for invalid email", () => {
      expect(pick("invalid").string()?.email()).toBeUndefined();
      expect(pick("@example.com").string()?.email()).toBeUndefined();
      expect(pick("test@").string()?.email()).toBeUndefined();
      expect(pick("test@domain").string()?.email()).toBeUndefined();
    });
  });

  describe("url", () => {
    it("should validate URL format", () => {
      const result = pick("https://example.com").string()?.url();
      expect(result).toBeInstanceOf(URLPick);
      expect(result?.valueOf()).toBe("https://example.com");
    });

    it("should return undefined for invalid URL", () => {
      expect(pick("not a url").string()?.url()).toBeUndefined();
      expect(pick("example.com").string()?.url()).toBeUndefined();
    });

    it("should allow chaining with URLPick methods", () => {
      const result = pick("http://localhost/foo")
        .string()
        ?.url()
        ?.pattern({ pathname: "/foo" });
      expect(result?.valueOf()).toBe("http://localhost/foo");
    });
  });

  describe("numeric", () => {
    it("should validate numeric strings (integers)", () => {
      const result = pick("1234").string()?.numeric();
      expect(result).toBeInstanceOf(NumericPick);
      expect(result?.valueOf()).toBe("1234");
    });

    it("should validate numeric strings (decimals)", () => {
      expect(pick("123.456").string()?.numeric()?.valueOf()).toBe("123.456");
      expect(pick("0.5").string()?.numeric()?.valueOf()).toBe("0.5");
    });

    it("should validate numeric strings with signs", () => {
      expect(pick("-123").string()?.numeric()?.valueOf()).toBe("-123");
      expect(pick("+123").string()?.numeric()?.valueOf()).toBe("+123");
      expect(pick("-123.456").string()?.numeric()?.valueOf()).toBe("-123.456");
    });

    it("should return undefined for non-numeric strings", () => {
      expect(pick("abc").string()?.numeric()).toBeUndefined();
      expect(pick("12a34").string()?.numeric()).toBeUndefined();
      expect(pick("12.34.56").string()?.numeric()).toBeUndefined();
    });

    it("should chain with NumericPick methods", () => {
      const result = pick("123").string()?.numeric()?.gt(100);
      expect(result?.valueOf()).toBe("123");
    });
  });

  describe("transformations (deprecated)", () => {
    it("should transform to uppercase (deprecated - use pipe instead)", () => {
      // Deprecated way
      const result = pick("hello").string()?.toUpperCase();
      expect(result?.valueOf()).toBe("HELLO");

      // Recommended way
      const recommended = pick("hello")
        .string()
        ?.pipe((s) => s.toUpperCase());
      expect(recommended?.valueOf()).toBe("HELLO");
    });

    it("should transform to lowercase (deprecated - use pipe instead)", () => {
      // Deprecated way
      const result = pick("HELLO").string()?.toLowerCase();
      expect(result?.valueOf()).toBe("hello");

      // Recommended way
      const recommended = pick("HELLO")
        .string()
        ?.pipe((s) => s.toLowerCase());
      expect(recommended?.valueOf()).toBe("hello");
    });

    it("should trim whitespace (deprecated - use pipe instead)", () => {
      // Deprecated way
      const result = pick("  hello  ").string()?.trim();
      expect(result?.valueOf()).toBe("hello");

      // Recommended way
      const recommended = pick("  hello  ")
        .string()
        ?.pipe((s) => s.trim());
      expect(recommended?.valueOf()).toBe("hello");
    });

    it("should chain transformations (deprecated - use pipe instead)", () => {
      // Deprecated way
      const result = pick("  HeLLo  ")
        .string()
        ?.trim()
        .toLowerCase()
        .toUpperCase();
      expect(result?.valueOf()).toBe("HELLO");

      // Recommended way
      const recommended = pick("  HeLLo  ")
        .string()
        ?.pipe((s) => s.trim().toLowerCase().toUpperCase());
      expect(recommended?.valueOf()).toBe("HELLO");
    });
  });

  describe("chaining", () => {
    it("should chain multiple validations", () => {
      const result = pick("hello")
        .string()
        ?.minLength(3)
        ?.maxLength(10)
        ?.startsWith("h");
      expect(result?.valueOf()).toBe("hello");
    });

    it("should return undefined if any validation fails", () => {
      const result = pick("hello").string()?.minLength(3)?.maxLength(3);
      expect(result).toBeUndefined();
    });

    it("should chain transformations and validations (use pipe for transformations)", () => {
      // Using pipe for transformations (recommended)
      const transformed = pick("  hello  ")
        .string()
        ?.pipe((s) => s.trim().toUpperCase())
        .valueOf();
      const result = pick(transformed).string()?.minLength(3);
      expect(result?.valueOf()).toBe("HELLO");
    });

    it("should work with pipe for custom transformations", () => {
      const result = pick("hello")
        .string()
        ?.pipe((s) => s.split("").reverse().join(""));
      expect(result?.valueOf()).toBe("olleh");
    });
  });

  describe("type checking", () => {
    it("should have correct types for string()", () => {
      const result = pick("hello").string();
      expectTypeOf(result).toEqualTypeOf<StringPick | undefined>();
      if (result) {
        expectTypeOf(result.valueOf()).toEqualTypeOf<string>();
      }
    });

    it("should have correct types for validations", () => {
      const result = pick("hello").string()?.minLength(3);
      expectTypeOf(result).toEqualTypeOf<StringPick | undefined>();
    });

    it("should have correct types for transformations", () => {
      const result = pick("hello").string()?.toUpperCase();
      expectTypeOf(result).toEqualTypeOf<StringPick>();
      expectTypeOf(result.valueOf()).toEqualTypeOf<string>();
    });

    it("should have correct types for url()", () => {
      const result = pick("https://example.com").string()?.url();
      expectTypeOf(result).toEqualTypeOf<URLPick<string> | undefined>();
    });

    it("should have correct types for numeric()", () => {
      const result = pick("123").string()?.numeric();
      expectTypeOf(result).toEqualTypeOf<NumericPick<string> | undefined>();
    });
  });

  describe("real-world scenarios", () => {
    it("should validate username format", () => {
      const validateUsername = (value: unknown) =>
        pick(value)
          .string()
          ?.minLength(3)
          ?.maxLength(20)
          ?.matches(/^[a-zA-Z0-9_]+$/);

      expect(validateUsername("john_doe")?.valueOf()).toBe("john_doe");
      expect(validateUsername("ab")).toBeUndefined(); // too short
      expect(validateUsername("john doe")).toBeUndefined(); // has space
    });

    it("should validate and normalize email", () => {
      const normalizeEmail = (value: unknown) => {
        const normalized = pick(value)
          .string()
          ?.pipe((s) => s.trim().toLowerCase())
          .valueOf();
        if (!normalized) return undefined;
        return pick(normalized).string()?.email();
      };

      expect(normalizeEmail("  USER@EXAMPLE.COM  ")?.valueOf()).toBe(
        "user@example.com",
      );
      expect(normalizeEmail("invalid")).toBeUndefined();
    });

    it("should validate URL with specific pattern", () => {
      const validateApiUrl = (value: unknown) =>
        pick(value)
          .string()
          ?.url()
          ?.pattern({ protocol: "https", pathname: "/api/*" });

      expect(validateApiUrl("https://example.com/api/users")?.valueOf()).toBe(
        "https://example.com/api/users",
      );
      expect(validateApiUrl("http://example.com/api/users")).toBeUndefined(); // wrong protocol
      expect(validateApiUrl("https://example.com/users")).toBeUndefined(); // wrong path
    });

    it("should validate and parse numeric string", () => {
      const validatePrice = (value: unknown) =>
        pick(value).string()?.numeric()?.gte(0)?.lte(1000000);

      expect(validatePrice("99.99")?.valueOf()).toBe("99.99");
      expect(validatePrice("-10")).toBeUndefined(); // negative
      expect(validatePrice("abc")).toBeUndefined(); // not numeric
    });

    it("should validate enum with case-insensitive matching", () => {
      const validateStatus = (value: unknown) => {
        const normalized = pick(value)
          .string()
          ?.pipe((s) => s.toLowerCase())
          .valueOf();
        if (!normalized) return undefined;
        return pick(normalized).enum(["active", "inactive", "pending"]);
      };

      expect(validateStatus("ACTIVE")?.valueOf()).toBe("active");
      expect(validateStatus("Pending")?.valueOf()).toBe("pending");
      expect(validateStatus("unknown")).toBeUndefined();
    });

    it("should validate uppercase constants", () => {
      const validateConstant = (value: unknown) =>
        pick(value)
          .string()
          ?.uppercase()
          ?.matches(/^[A-Z_]+$/);

      expect(validateConstant("MAX_VALUE")?.valueOf()).toBe("MAX_VALUE");
      expect(validateConstant("API_KEY")?.valueOf()).toBe("API_KEY");
      expect(validateConstant("maxValue")).toBeUndefined(); // not uppercase
      expect(validateConstant("MAX-VALUE")).toBeUndefined(); // has dash
    });

    it("should validate lowercase identifiers", () => {
      const validateIdentifier = (value: unknown) =>
        pick(value)
          .string()
          ?.lowercase()
          ?.matches(/^[a-z_]+$/);

      expect(validateIdentifier("user_name")?.valueOf()).toBe("user_name");
      expect(validateIdentifier("api_key")?.valueOf()).toBe("api_key");
      expect(validateIdentifier("userName")).toBeUndefined(); // not lowercase
      expect(validateIdentifier("user-name")).toBeUndefined(); // has dash
    });

    it("should chain case validation with other validations", () => {
      const validateCode = (value: unknown) =>
        pick(value)
          .string()
          ?.uppercase()
          ?.length(6)
          ?.matches(/^[A-Z0-9]+$/);

      expect(validateCode("ABC123")?.valueOf()).toBe("ABC123");
      expect(validateCode("XYZ789")?.valueOf()).toBe("XYZ789");
      expect(validateCode("abc123")).toBeUndefined(); // not uppercase
      expect(validateCode("ABC12")).toBeUndefined(); // wrong length
      expect(validateCode("ABC-12")).toBeUndefined(); // has dash
    });
  });
});
