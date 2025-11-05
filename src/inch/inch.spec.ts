import { describe, it, expect } from "vitest";
import { Inch } from "./inch";

describe("Inch.parse", () => {
  describe("specific requested cases", () => {
    it('should parse "1in" to 1 inch', () => {
      const result = Inch.parse("1in");
      expect(result.inch).toBe(1);
    });

    it('should parse "12 in" to 12 inches', () => {
      const result = Inch.parse("12 in");
      expect(result.inch).toBe(12);
    });

    it("should parse 1234 to 1234 inches", () => {
      const result = Inch.parse(1234);
      expect(result.inch).toBe(1234);
    });

    it('should parse "1 foot" to 12 inches', () => {
      const result = Inch.parse("1 foot");
      expect(result.inch).toBe(12);
    });
  });

  describe("short unit formats", () => {
    it("should parse miles (mi)", () => {
      const result = Inch.parse("1mi");
      expect(result.inch).toBe(63360);
    });

    it("should parse yards (yd)", () => {
      const result = Inch.parse("2yd");
      expect(result.inch).toBe(72);
    });

    it("should parse feet (ft)", () => {
      const result = Inch.parse("3ft");
      expect(result.inch).toBe(36);
    });

    it("should parse inches (in)", () => {
      const result = Inch.parse("10in");
      expect(result.inch).toBe(10);
    });
  });

  describe("long unit formats", () => {
    it("should parse mile", () => {
      const result = Inch.parse("2 mile");
      expect(result.inch).toBe(126720);
    });

    it("should parse yard", () => {
      const result = Inch.parse("4 yard");
      expect(result.inch).toBe(144);
    });

    it("should parse foot", () => {
      const result = Inch.parse("5 foot");
      expect(result.inch).toBe(60);
    });

    it("should parse inch", () => {
      const result = Inch.parse("8 inch");
      expect(result.inch).toBe(8);
    });
  });

  describe("numeric inputs", () => {
    it("should parse integer as inches", () => {
      const result = Inch.parse(500);
      expect(result.inch).toBe(500);
    });

    it("should parse decimal as inches", () => {
      const result = Inch.parse(123.45);
      expect(result.inch).toBe(123.45);
    });

    it("should parse zero", () => {
      const result = Inch.parse(0);
      expect(result.inch).toBe(0);
    });

    it("should parse negative number", () => {
      const result = Inch.parse(-100);
      expect(result.inch).toBe(-100);
    });
  });

  describe("edge cases - whitespace variations", () => {
    it("should parse with no whitespace", () => {
      const result = Inch.parse("10in");
      expect(result.inch).toBe(10);
    });

    it("should parse with single space", () => {
      const result = Inch.parse("10 in");
      expect(result.inch).toBe(10);
    });

    it("should parse with multiple spaces", () => {
      const result = Inch.parse("10  in");
      expect(result.inch).toBe(10);
    });

    it("should parse with leading whitespace", () => {
      const result = Inch.parse("  10in");
      expect(result.inch).toBe(10);
    });

    it("should parse with trailing whitespace", () => {
      const result = Inch.parse("10in  ");
      expect(result.inch).toBe(10);
    });

    it("should parse with surrounding whitespace", () => {
      const result = Inch.parse("  10 in  ");
      expect(result.inch).toBe(10);
    });
  });

  describe("edge cases - decimal values", () => {
    it("should parse decimal with short unit", () => {
      const result = Inch.parse("1.5ft");
      expect(result.inch).toBe(18);
    });

    it("should parse decimal with long unit", () => {
      const result = Inch.parse("2.5 foot");
      expect(result.inch).toBe(30);
    });

    it("should parse small decimal", () => {
      const result = Inch.parse("0.5mi");
      expect(result.inch).toBe(31680);
    });

    it("should parse decimal starting with dot", () => {
      const result = Inch.parse(".5ft");
      expect(result.inch).toBe(6);
    });
  });

  describe("edge cases - negative values", () => {
    it("should parse negative with short unit", () => {
      const result = Inch.parse("-5in");
      expect(result.inch).toBe(-5);
    });

    it("should parse negative with long unit", () => {
      const result = Inch.parse("-10 foot");
      expect(result.inch).toBe(-120);
    });

    it("should parse negative with whitespace", () => {
      const result = Inch.parse("-3 yd");
      expect(result.inch).toBe(-108);
    });
  });

  describe("edge cases - string without unit", () => {
    it("should parse string number without unit as inches", () => {
      const result = Inch.parse("500");
      expect(result.inch).toBe(500);
    });

    it("should parse string decimal without unit as inches", () => {
      const result = Inch.parse("123.45");
      expect(result.inch).toBe(123.45);
    });
  });

  describe("error handling - invalid units", () => {
    it("should throw error for unknown unit", () => {
      expect(() => Inch.parse("10 xyz")).toThrow();
    });

    it("should throw error for invalid short unit", () => {
      expect(() => Inch.parse("10 abc")).toThrow();
    });

    it("should throw error for metric unit", () => {
      expect(() => Inch.parse("10 meter")).toThrow();
    });
  });

  describe("error handling - invalid formats", () => {
    it("should throw error for non-numeric string", () => {
      expect(() => Inch.parse("abc")).toThrow();
    });

    it("should throw error for unit without value", () => {
      expect(() => Inch.parse("in")).toThrow();
    });

    it("should throw error for empty string", () => {
      expect(() => Inch.parse("")).toThrow();
    });

    it("should throw error for only whitespace", () => {
      expect(() => Inch.parse("   ")).toThrow();
    });

    it("should throw error for multiple numbers", () => {
      expect(() => Inch.parse("10 20 in")).toThrow();
    });
  });

  describe("error handling - null and undefined", () => {
    it("should throw error for null", () => {
      expect(() => Inch.parse(null as any)).toThrow();
    });

    it("should throw error for undefined", () => {
      expect(() => Inch.parse(undefined as any)).toThrow();
    });
  });
});
