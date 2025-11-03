import { describe, it, expect } from "vitest";
import { Meter, MeterFormat } from "./meter";

describe("MeterFormat", () => {
  describe("format method - requested cases", () => {
    it('should format "1km" with long display as "1 kilómetro"', () => {
      const formatter = new MeterFormat(undefined, { unitDisplay: "long" });
      const result = formatter.format("1km");
      expect(result).toBe("1 kilómetro");
    });

    it('should format "1 cm" with long display as "1 centímetro"', () => {
      const formatter = new MeterFormat(undefined, { unitDisplay: "long" });
      const result = formatter.format("1 cm");
      expect(result).toBe("1 centímetro");
    });

    it('should format "3 cm" with long display as "3 centímetros"', () => {
      const formatter = new MeterFormat(undefined, { unitDisplay: "long" });
      const result = formatter.format("3 cm");
      expect(result).toBe("3 centímetros");
    });

    it('should format "13 km" with long display as "13 kilómetros"', () => {
      const formatter = new MeterFormat(undefined, { unitDisplay: "long" });
      const result = formatter.format("13 km");
      expect(result).toBe("13 kilómetros");
    });

    it('should format "13 km" with short display as "13 km"', () => {
      const formatter = new MeterFormat();
      const result = formatter.format("13 km");
      expect(result).toBe("13 km");
    });

    it('should format 2_500 (millimeters) with long display as "2,5 metros"', () => {
      const formatter = new MeterFormat(undefined, { unitDisplay: "long" });
      const result = formatter.format(2_500);
      expect(result).toBe("2,5 metros");
    });

    it('should format 2_500 with en locale and long display as "2.5 meters"', () => {
      const formatter = new MeterFormat("en", { unitDisplay: "long" });
      const result = formatter.format(2_500);
      expect(result).toBe("2.5 meters");
    });

    it('should format 2_500 with en-us locale and long display as "2.5 meters"', () => {
      const formatter = new MeterFormat("en-us", { unitDisplay: "long" });
      const result = formatter.format(2_500);
      expect(result).toBe("2.5 meters");
    });

    it('should format "2.5 m" with ja-JP locale and long display as "2.5メートル"', () => {
      const formatter = new MeterFormat("ja-JP", { unitDisplay: "long" });
      const result = formatter.format("2.5 m");
      expect(result).toBe("2.5メートル");
    });

    it('should format with fixed unit "kilometer" in ja-JP locale', () => {
      const formatter = new MeterFormat("ja-JP", {
        unit: "kilometer",
        unitDisplay: "long",
      });
      const result = formatter.format("2500 m");
      expect(result).toBe("2.5キロメートル");
    });

    it('should format with fixed unit "kilometer" in es-CL locale', () => {
      const formatter = new MeterFormat("es-CL", {
        unit: "kilometer",
        unitDisplay: "long",
      });
      const result = formatter.format("2500 m");
      expect(result).toBe("2,5 kilómetros");
    });
  });

  describe("toLocaleString method", () => {
    it("should format using toLocaleString with default locale", () => {
      const result = Meter.parse("2m").toLocaleString();
      expect(result).toBe("2 m");
    });

    it("should format using toLocaleString with long display", () => {
      const result = Meter.parse("2m").toLocaleString(undefined, {
        unitDisplay: "long",
      });
      expect(result).toBe("2 metros");
    });

    it("should format using toLocaleString with en locale", () => {
      const result = Meter.parse("2500mm").toLocaleString("en", {
        unitDisplay: "long",
      });
      expect(result).toBe("2.5 meters");
    });

    it("should format using toLocaleString with ja-JP locale", () => {
      const result = Meter.parse("5000mm").toLocaleString("ja-JP", {
        unitDisplay: "long",
      });
      expect(result).toBe("5メートル");
    });

    it("should format using toLocaleString with fixed unit", () => {
      const result = Meter.parse("2500m").toLocaleString("es-CL", {
        unit: "kilometer",
        unitDisplay: "long",
      });
      expect(result).toBe("2,5 kilómetros");
    });

    it("should format using toLocaleString with centimeters", () => {
      const result = Meter.parse("50mm").toLocaleString("en", {
        unitDisplay: "long",
      });
      expect(result).toBe("5 centimeters");
    });
  });

  describe("all units with same value - Spanish", () => {
    const value = "1000000"; // 1,000,000 millimeters = 1 kilometer

    it("should format as kilometers", () => {
      const result = Meter.parse(value).toLocaleString("es-CL", {
        unit: "kilometer",
        unitDisplay: "long",
      });
      expect(result).toBe("1 kilómetro");
    });

    it("should format as meters", () => {
      const result = Meter.parse(value).toLocaleString("es-CL", {
        unit: "meter",
        unitDisplay: "long",
      });
      expect(result).toBe("1.000 metros");
    });

    it("should format as centimeters", () => {
      const result = Meter.parse(value).toLocaleString("es-CL", {
        unit: "centimeter",
        unitDisplay: "long",
      });
      expect(result).toBe("100.000 centímetros");
    });

    it("should format as millimeters", () => {
      const result = Meter.parse(value).toLocaleString("es-CL", {
        unit: "millimeter",
        unitDisplay: "long",
      });
      expect(result).toBe("1.000.000 milímetros");
    });

    it("should format as kilometers (short)", () => {
      const result = Meter.parse(value).toLocaleString("es-CL", {
        unit: "km",
        unitDisplay: "short",
      });
      expect(result).toBe("1 km");
    });

    it("should format as meters (short)", () => {
      const result = Meter.parse(value).toLocaleString("es-CL", {
        unit: "m",
        unitDisplay: "short",
      });
      expect(result).toBe("1.000 m");
    });

    it("should format as centimeters (short)", () => {
      const result = Meter.parse(value).toLocaleString("es-CL", {
        unit: "cm",
        unitDisplay: "short",
      });
      expect(result).toBe("100.000 cm");
    });

    it("should format as millimeters (short)", () => {
      const result = Meter.parse(value).toLocaleString("es-CL", {
        unit: "mm",
        unitDisplay: "short",
      });
      expect(result).toBe("1.000.000 mm");
    });
  });

  describe("all units with same value - English", () => {
    const value = "1000000"; // 1,000,000 millimeters = 1 kilometer

    it("should format as kilometers", () => {
      const result = Meter.parse(value).toLocaleString("en-US", {
        unit: "kilometer",
        unitDisplay: "long",
      });
      expect(result).toBe("1 kilometer");
    });

    it("should format as meters", () => {
      const result = Meter.parse(value).toLocaleString("en-US", {
        unit: "meter",
        unitDisplay: "long",
      });
      expect(result).toBe("1,000 meters");
    });

    it("should format as centimeters", () => {
      const result = Meter.parse(value).toLocaleString("en-US", {
        unit: "centimeter",
        unitDisplay: "long",
      });
      expect(result).toBe("100,000 centimeters");
    });

    it("should format as millimeters", () => {
      const result = Meter.parse(value).toLocaleString("en-US", {
        unit: "millimeter",
        unitDisplay: "long",
      });
      expect(result).toBe("1,000,000 millimeters");
    });

    it("should format as kilometers (short)", () => {
      const result = Meter.parse(value).toLocaleString("en-US", {
        unit: "km",
        unitDisplay: "short",
      });
      expect(result).toBe("1 km");
    });

    it("should format as meters (short)", () => {
      const result = Meter.parse(value).toLocaleString("en-US", {
        unit: "m",
        unitDisplay: "short",
      });
      expect(result).toBe("1,000 m");
    });

    it("should format as centimeters (short)", () => {
      const result = Meter.parse(value).toLocaleString("en-US", {
        unit: "cm",
        unitDisplay: "short",
      });
      expect(result).toBe("100,000 cm");
    });

    it("should format as millimeters (short)", () => {
      const result = Meter.parse(value).toLocaleString("en-US", {
        unit: "mm",
        unitDisplay: "short",
      });
      expect(result).toBe("1,000,000 mm");
    });
  });

  describe("all units with same value - Japanese", () => {
    const value = "1000000"; // 1,000,000 millimeters = 1 kilometer

    it("should format as kilometers", () => {
      const result = Meter.parse(value).toLocaleString("ja-JP", {
        unit: "kilometer",
        unitDisplay: "long",
      });
      expect(result).toBe("1キロメートル");
    });

    it("should format as meters", () => {
      const result = Meter.parse(value).toLocaleString("ja-JP", {
        unit: "meter",
        unitDisplay: "long",
      });
      expect(result).toBe("1,000メートル");
    });

    it("should format as centimeters", () => {
      const result = Meter.parse(value).toLocaleString("ja-JP", {
        unit: "centimeter",
        unitDisplay: "long",
      });
      expect(result).toBe("100,000センチメートル");
    });

    it("should format as millimeters", () => {
      const result = Meter.parse(value).toLocaleString("ja-JP", {
        unit: "millimeter",
        unitDisplay: "long",
      });
      expect(result).toBe("1,000,000ミリメートル");
    });

    it("should format as kilometers (short)", () => {
      const result = Meter.parse(value).toLocaleString("ja-JP", {
        unit: "km",
        unitDisplay: "short",
      });
      expect(result).toBe("1 km");
    });

    it("should format as meters (short)", () => {
      const result = Meter.parse(value).toLocaleString("ja-JP", {
        unit: "m",
        unitDisplay: "short",
      });
      expect(result).toBe("1,000 m");
    });

    it("should format as centimeters (short)", () => {
      const result = Meter.parse(value).toLocaleString("ja-JP", {
        unit: "cm",
        unitDisplay: "short",
      });
      expect(result).toBe("100,000 cm");
    });

    it("should format as millimeters (short)", () => {
      const result = Meter.parse(value).toLocaleString("ja-JP", {
        unit: "mm",
        unitDisplay: "short",
      });
      expect(result).toBe("1,000,000 mm");
    });
  });
});
