import { describe, it, expect } from "vitest";
import { Meter } from "./meter";

describe("Meter.parse", () => {
  describe("specific requested cases", () => {
    it('should parse "1cm" to 10 millimeters', () => {
      const result = Meter.parse("1cm");
      expect(result.millimeter).toBe(10);
    });

    it('should parse "12 km" to 12000000 millimeters', () => {
      const result = Meter.parse("12 km");
      expect(result.millimeter).toBe(12_000_000);
    });

    it("should parse 1234 to 1234 millimeters", () => {
      const result = Meter.parse(1234);
      expect(result.millimeter).toBe(1234);
    });

    it('should parse "123 kilometer" to 123000000 millimeters', () => {
      const result = Meter.parse("123 kilometer");
      expect(result.millimeter).toBe(123_000_000);
    });
  });

  describe("short unit formats", () => {
    it("should parse kilometers (km)", () => {
      const result = Meter.parse("5km");
      expect(result.millimeter).toBe(5_000_000);
    });

    it("should parse hectometers (hm)", () => {
      const result = Meter.parse("3hm");
      expect(result.millimeter).toBe(300_000);
    });

    it("should parse decameters (dam)", () => {
      const result = Meter.parse("2dam");
      expect(result.millimeter).toBe(20_000);
    });

    it("should parse meters (m)", () => {
      const result = Meter.parse("10m");
      expect(result.millimeter).toBe(10_000);
    });

    it("should parse decimeters (dm)", () => {
      const result = Meter.parse("15dm");
      expect(result.millimeter).toBe(1_500);
    });

    it("should parse centimeters (cm)", () => {
      const result = Meter.parse("25cm");
      expect(result.millimeter).toBe(250);
    });

    it("should parse millimeters (mm)", () => {
      const result = Meter.parse("100mm");
      expect(result.millimeter).toBe(100);
    });

    it("should parse micrometers (µm)", () => {
      const result = Meter.parse("500µm");
      expect(result.millimeter).toBe(0.5);
    });

    it("should parse nanometers (nm)", () => {
      const result = Meter.parse("1000nm");
      expect(result.millimeter).toBe(0.001);
    });

    it("should parse picometers (pm)", () => {
      const result = Meter.parse("1000pm");
      expect(result.millimeter).toBeCloseTo(0.000001, 10);
    });
  });

  describe("long unit formats", () => {
    it("should parse kilometer", () => {
      const result = Meter.parse("2 kilometer");
      expect(result.millimeter).toBe(2_000_000);
    });

    it("should parse hectometer", () => {
      const result = Meter.parse("4 hectometer");
      expect(result.millimeter).toBe(400_000);
    });

    it("should parse decameter", () => {
      const result = Meter.parse("6 decameter");
      expect(result.millimeter).toBe(60_000);
    });

    it("should parse meter", () => {
      const result = Meter.parse("8 meter");
      expect(result.millimeter).toBe(8_000);
    });

    it("should parse decimeter", () => {
      const result = Meter.parse("20 decimeter");
      expect(result.millimeter).toBe(2_000);
    });

    it("should parse centimeter", () => {
      const result = Meter.parse("30 centimeter");
      expect(result.millimeter).toBe(300);
    });

    it("should parse millimeter", () => {
      const result = Meter.parse("50 millimeter");
      expect(result.millimeter).toBe(50);
    });

    it("should parse micrometer", () => {
      const result = Meter.parse("2000 micrometer");
      expect(result.millimeter).toBe(2);
    });

    it("should parse nanometer", () => {
      const result = Meter.parse("5000 nanometer");
      expect(result.millimeter).toBe(0.005);
    });

    it("should parse picometer", () => {
      const result = Meter.parse("10000 picometer");
      expect(result.millimeter).toBe(0.00001);
    });
  });

  describe("numeric inputs", () => {
    it("should parse integer as millimeters", () => {
      const result = Meter.parse(500);
      expect(result.millimeter).toBe(500);
    });

    it("should parse decimal as millimeters", () => {
      const result = Meter.parse(123.45);
      expect(result.millimeter).toBe(123.45);
    });

    it("should parse zero", () => {
      const result = Meter.parse(0);
      expect(result.millimeter).toBe(0);
    });

    it("should parse negative number", () => {
      const result = Meter.parse(-100);
      expect(result.millimeter).toBe(-100);
    });
  });

  describe("edge cases - whitespace variations", () => {
    it("should parse with no whitespace", () => {
      const result = Meter.parse("10cm");
      expect(result.millimeter).toBe(100);
    });

    it("should parse with single space", () => {
      const result = Meter.parse("10 cm");
      expect(result.millimeter).toBe(100);
    });

    it("should parse with multiple spaces", () => {
      const result = Meter.parse("10  cm");
      expect(result.millimeter).toBe(100);
    });

    it("should parse with leading whitespace", () => {
      const result = Meter.parse("  10cm");
      expect(result.millimeter).toBe(100);
    });

    it("should parse with trailing whitespace", () => {
      const result = Meter.parse("10cm  ");
      expect(result.millimeter).toBe(100);
    });

    it("should parse with surrounding whitespace", () => {
      const result = Meter.parse("  10 cm  ");
      expect(result.millimeter).toBe(100);
    });
  });

  describe("edge cases - decimal values", () => {
    it("should parse decimal with short unit", () => {
      const result = Meter.parse("1.5m");
      expect(result.millimeter).toBe(1_500);
    });

    it("should parse decimal with long unit", () => {
      const result = Meter.parse("2.5 meter");
      expect(result.millimeter).toBe(2_500);
    });

    it("should parse small decimal", () => {
      const result = Meter.parse("0.001km");
      expect(result.millimeter).toBe(1000);
    });

    it("should parse decimal starting with dot", () => {
      const result = Meter.parse(".5m");
      expect(result.millimeter).toBe(500);
    });
  });

  describe("edge cases - negative values", () => {
    it("should parse negative with short unit", () => {
      const result = Meter.parse("-5cm");
      expect(result.millimeter).toBe(-50);
    });

    it("should parse negative with long unit", () => {
      const result = Meter.parse("-10 meter");
      expect(result.millimeter).toBe(-10_000);
    });

    it("should parse negative with whitespace", () => {
      const result = Meter.parse("-3 km");
      expect(result.millimeter).toBe(-3_000_000);
    });
  });

  describe("edge cases - string without unit", () => {
    it("should parse string number without unit as millimeters", () => {
      const result = Meter.parse("500");
      expect(result.millimeter).toBe(500);
    });

    it("should parse string decimal without unit as millimeters", () => {
      const result = Meter.parse("123.45");
      expect(result.millimeter).toBe(123.45);
    });
  });

  describe("error handling - invalid units", () => {
    it("should throw error for unknown unit", () => {
      expect(() => Meter.parse("10 xyz")).toThrow();
    });

    it("should throw error for invalid short unit", () => {
      expect(() => Meter.parse("10 abc")).toThrow();
    });

    it("should throw error for misspelled unit", () => {
      expect(() => Meter.parse("10 kilometre")).toThrow();
    });
  });

  describe("error handling - invalid formats", () => {
    it("should throw error for non-numeric string", () => {
      expect(() => Meter.parse("abc")).toThrow();
    });

    it("should throw error for unit without value", () => {
      expect(() => Meter.parse("cm")).toThrow();
    });

    it("should throw error for empty string", () => {
      expect(() => Meter.parse("")).toThrow();
    });

    it("should throw error for only whitespace", () => {
      expect(() => Meter.parse("   ")).toThrow();
    });

    it("should throw error for multiple numbers", () => {
      expect(() => Meter.parse("10 20 cm")).toThrow();
    });
  });

  describe("error handling - null and undefined", () => {
    it("should throw error for null", () => {
      expect(() => Meter.parse(null as any)).toThrow();
    });

    it("should throw error for undefined", () => {
      expect(() => Meter.parse(undefined as any)).toThrow();
    });
  });
});
