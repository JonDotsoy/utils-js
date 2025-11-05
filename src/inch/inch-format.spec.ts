import { describe, it, expect } from "vitest";
import { Inch, InchFormat } from "./inch";

describe("InchFormat", () => {
  describe("format method - requested cases", () => {
    it('should format "1mi" with long display as "1 mile"', () => {
      const formatter = new InchFormat(undefined, { unitDisplay: "long" });
      const result = formatter.format("1mi");
      expect(result).toBe("1 mile");
    });

    it('should format "1 in" with long display as "1 inch"', () => {
      const formatter = new InchFormat(undefined, { unitDisplay: "long" });
      const result = formatter.format("1 in");
      expect(result).toBe("1 inch");
    });

    it('should format "3 in" with long display as "3 inches"', () => {
      const formatter = new InchFormat(undefined, { unitDisplay: "long" });
      const result = formatter.format("3 in");
      expect(result).toBe("3 inches");
    });

    it('should format "13 mi" with long display as "13 miles"', () => {
      const formatter = new InchFormat(undefined, { unitDisplay: "long" });
      const result = formatter.format("13 mi");
      expect(result).toBe("13 miles");
    });

    it('should format "13 mi" with short display as "13 mi"', () => {
      const formatter = new InchFormat();
      const result = formatter.format("13 mi");
      expect(result).toBe("13 mi");
    });

    it('should format 24 (inches) with long display as "2 feet"', () => {
      const formatter = new InchFormat(undefined, { unitDisplay: "long" });
      const result = formatter.format(24);
      expect(result).toBe("2 feet");
    });

    it('should format 24 with en locale and long display as "2 feet"', () => {
      const formatter = new InchFormat("en", { unitDisplay: "long" });
      const result = formatter.format(24);
      expect(result).toBe("2 feet");
    });

    it('should format 24 with en-us locale and long display as "2 feet"', () => {
      const formatter = new InchFormat("en-us", { unitDisplay: "long" });
      const result = formatter.format(24);
      expect(result).toBe("2 feet");
    });

    it('should format "2.5 ft" with es-ES locale and long display', () => {
      const formatter = new InchFormat("es-ES", { unitDisplay: "long" });
      const result = formatter.format("2.5 ft");
      expect(result).toBe("2,5 pies");
    });

    it('should format with fixed unit "mile" in en-US locale', () => {
      const formatter = new InchFormat("en-US", {
        unit: "mile",
        unitDisplay: "long",
      });
      const result = formatter.format("63360 in");
      expect(result).toBe("1 mile");
    });

    it('should format with fixed unit "foot" in en-US locale', () => {
      const formatter = new InchFormat("en-US", {
        unit: "foot",
        unitDisplay: "long",
      });
      const result = formatter.format("30 in");
      expect(result).toBe("2.5 feet");
    });
  });

  describe("toLocaleString method", () => {
    it("should format using toLocaleString with default locale", () => {
      const result = Inch.parse("24in").toLocaleString();
      expect(result).toBe("2 ft");
    });

    it("should format using toLocaleString with long display", () => {
      const result = Inch.parse("24in").toLocaleString(undefined, {
        unitDisplay: "long",
      });
      expect(result).toBe("2 feet");
    });

    it("should format using toLocaleString with en locale", () => {
      const result = Inch.parse("36in").toLocaleString("en", {
        unitDisplay: "long",
      });
      expect(result).toBe("1 yard");
    });

    it("should format using toLocaleString with es-ES locale", () => {
      const result = Inch.parse("72in").toLocaleString("es-ES", {
        unitDisplay: "long",
      });
      expect(result).toBe("2 yardas");
    });

    it("should format using toLocaleString with fixed unit", () => {
      const result = Inch.parse("63360in").toLocaleString("en-US", {
        unit: "mile",
        unitDisplay: "long",
      });
      expect(result).toBe("1 mile");
    });

    it("should format using toLocaleString with feet", () => {
      const result = Inch.parse("12in").toLocaleString("en", {
        unitDisplay: "long",
      });
      expect(result).toBe("1 foot");
    });
  });

  describe("all units with same value - English US", () => {
    const value = "63360"; // 63,360 inches = 1 mile

    it("should format as miles", () => {
      const result = Inch.parse(value).toLocaleString("en-US", {
        unit: "mile",
        unitDisplay: "long",
      });
      expect(result).toBe("1 mile");
    });

    it("should format as yards", () => {
      const result = Inch.parse(value).toLocaleString("en-US", {
        unit: "yard",
        unitDisplay: "long",
      });
      expect(result).toBe("1,760 yards");
    });

    it("should format as feet", () => {
      const result = Inch.parse(value).toLocaleString("en-US", {
        unit: "foot",
        unitDisplay: "long",
      });
      expect(result).toBe("5,280 feet");
    });

    it("should format as inches", () => {
      const result = Inch.parse(value).toLocaleString("en-US", {
        unit: "inch",
        unitDisplay: "long",
      });
      expect(result).toBe("63,360 inches");
    });

    it("should format as miles (short)", () => {
      const result = Inch.parse(value).toLocaleString("en-US", {
        unit: "mi",
        unitDisplay: "short",
      });
      expect(result).toBe("1 mi");
    });

    it("should format as yards (short)", () => {
      const result = Inch.parse(value).toLocaleString("en-US", {
        unit: "yd",
        unitDisplay: "short",
      });
      expect(result).toBe("1,760 yd");
    });

    it("should format as feet (short)", () => {
      const result = Inch.parse(value).toLocaleString("en-US", {
        unit: "ft",
        unitDisplay: "short",
      });
      expect(result).toBe("5,280 ft");
    });

    it("should format as inches (short)", () => {
      const result = Inch.parse(value).toLocaleString("en-US", {
        unit: "in",
        unitDisplay: "short",
      });
      expect(result).toBe("63,360 in");
    });
  });

  describe("all units with same value - English UK", () => {
    const value = "63360"; // 63,360 inches = 1 mile

    it("should format as miles", () => {
      const result = Inch.parse(value).toLocaleString("en-GB", {
        unit: "mile",
        unitDisplay: "long",
      });
      expect(result).toBe("1 mile");
    });

    it("should format as yards", () => {
      const result = Inch.parse(value).toLocaleString("en-GB", {
        unit: "yard",
        unitDisplay: "long",
      });
      expect(result).toBe("1,760 yards");
    });

    it("should format as feet", () => {
      const result = Inch.parse(value).toLocaleString("en-GB", {
        unit: "foot",
        unitDisplay: "long",
      });
      expect(result).toBe("5,280 feet");
    });

    it("should format as inches", () => {
      const result = Inch.parse(value).toLocaleString("en-GB", {
        unit: "inch",
        unitDisplay: "long",
      });
      expect(result).toBe("63,360 inches");
    });

    it("should format as miles (short)", () => {
      const result = Inch.parse(value).toLocaleString("en-GB", {
        unit: "mi",
        unitDisplay: "short",
      });
      expect(result).toBe("1 mi");
    });

    it("should format as yards (short)", () => {
      const result = Inch.parse(value).toLocaleString("en-GB", {
        unit: "yd",
        unitDisplay: "short",
      });
      expect(result).toBe("1,760 yd");
    });

    it("should format as feet (short)", () => {
      const result = Inch.parse(value).toLocaleString("en-GB", {
        unit: "ft",
        unitDisplay: "short",
      });
      expect(result).toBe("5,280 ft");
    });

    it("should format as inches (short)", () => {
      const result = Inch.parse(value).toLocaleString("en-GB", {
        unit: "in",
        unitDisplay: "short",
      });
      expect(result).toBe("63,360 in");
    });
  });

  describe("all units with same value - Spanish", () => {
    const value = "63360"; // 63,360 inches = 1 mile

    it("should format as miles", () => {
      const result = Inch.parse(value).toLocaleString("es-ES", {
        unit: "mile",
        unitDisplay: "long",
      });
      expect(result).toBe("1 milla");
    });

    it("should format as yards", () => {
      const result = Inch.parse(value).toLocaleString("es-ES", {
        unit: "yard",
        unitDisplay: "long",
      });
      expect(result).toBe("1760 yardas");
    });

    it("should format as feet", () => {
      const result = Inch.parse(value).toLocaleString("es-ES", {
        unit: "foot",
        unitDisplay: "long",
      });
      expect(result).toBe("5280 pies");
    });

    it("should format as inches", () => {
      const result = Inch.parse(value).toLocaleString("es-ES", {
        unit: "inch",
        unitDisplay: "long",
      });
      expect(result).toBe("63.360 pulgadas");
    });

    it("should format as miles (short)", () => {
      const result = Inch.parse(value).toLocaleString("es-ES", {
        unit: "mi",
        unitDisplay: "short",
      });
      expect(result).toBe("1 mi");
    });

    it("should format as yards (short)", () => {
      const result = Inch.parse(value).toLocaleString("es-ES", {
        unit: "yd",
        unitDisplay: "short",
      });
      expect(result).toBe("1760 yd");
    });

    it("should format as feet (short)", () => {
      const result = Inch.parse(value).toLocaleString("es-ES", {
        unit: "ft",
        unitDisplay: "short",
      });
      expect(result).toBe("5280 ft");
    });

    it("should format as inches (short)", () => {
      const result = Inch.parse(value).toLocaleString("es-ES", {
        unit: "in",
        unitDisplay: "short",
      });
      expect(result).toBe("63.360 in");
    });
  });
});
