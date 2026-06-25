import { describe, it, expect, expectTypeOf } from "bun:test";
import { Length } from "./length.js";

// ─── Length.from(object) ──────────────────────────────────────────────────────

describe("Length.from(object)", () => {
  it("combines meters and centimeters", () => {
    expect(Length.from({ meters: 1, centimeters: 50 }).total("mm")).toBeCloseTo(1_500, 6);
  });

  it("single unit: 1 km", () => {
    expect(Length.from({ kilometer: 1 }).total("mm")).toBeCloseTo(1_000_000, 6);
  });

  it("single unit: 1 ft", () => {
    expect(Length.from({ foot: 1 }).total("mm")).toBeCloseTo(304.8, 6);
  });

  it("mixed metric and imperial", () => {
    expect(Length.from({ meters: 1, inches: 1 }).total("mm")).toBeCloseTo(1_025.4, 4);
  });

  it("supports plural aliases", () => {
    expect(Length.from({ centimeters: 100 }).total("mm")).toBeCloseTo(1_000, 6);
  });
});

// ─── Length.from(number, unit) ────────────────────────────────────────────────

describe("Length.from(number, unit)", () => {
  it("default unit is millimeter", () => {
    expect(Length.from(100).total("mm")).toBe(100);
  });

  it("from kilometers", () => {
    expect(Length.from(1, "km").total("mm")).toBe(1_000_000);
  });

  it("from feet", () => {
    expect(Length.from(1, "ft").total("mm")).toBeCloseTo(304.8, 6);
  });

  it("from inches", () => {
    expect(Length.from(12, "in").total("mm")).toBeCloseTo(304.8, 6);
  });
});

// ─── Length.from(string) ─────────────────────────────────────────────────────

describe("Length.from(string)", () => {
  it("parses '1.5m'", () => {
    expect(Length.from("1.5m").total("mm")).toBeCloseTo(1_500, 6);
  });

  it("parses '100cm'", () => {
    expect(Length.from("100cm").total("mm")).toBeCloseTo(1_000, 6);
  });

  it("parses '5km'", () => {
    expect(Length.from("5km").total("mm")).toBeCloseTo(5_000_000, 6);
  });

  it("parses '6ft'", () => {
    expect(Length.from("6ft").total("mm")).toBeCloseTo(1_828.8, 4);
  });

  it("parses '12 in'", () => {
    expect(Length.from("12 in").total("ft")).toBeCloseTo(1, 6);
  });

  it("throws on invalid string", () => {
    expect(() => Length.from("abc")).toThrow();
  });
});

// ─── .total(unit) ────────────────────────────────────────────────────────────

describe(".total(unit)", () => {
  it("main example: Length.from({ meters: 1, centimeters: 50 }).total('in')", () => {
    const result = Length.from({ meters: 1, centimeters: 50 }).total("in");
    expect(result).toBeCloseTo(1_500 / 25.4, 4);
  });

  it("to mm", () => {
    expect(Length.from(1, "m").total("mm")).toBeCloseTo(1_000, 6);
  });

  it("to cm", () => {
    expect(Length.from(1, "m").total("cm")).toBeCloseTo(100, 6);
  });

  it("to m", () => {
    expect(Length.from(1_000, "mm").total("m")).toBeCloseTo(1, 6);
  });

  it("to km", () => {
    expect(Length.from(1_000_000, "mm").total("km")).toBeCloseTo(1, 6);
  });

  it("to in", () => {
    expect(Length.from(25.4, "mm").total("in")).toBeCloseTo(1, 6);
  });

  it("to ft", () => {
    expect(Length.from(304.8, "mm").total("ft")).toBeCloseTo(1, 6);
  });

  it("to yd", () => {
    expect(Length.from(914.4, "mm").total("yd")).toBeCloseTo(1, 6);
  });

  it("to mi", () => {
    expect(Length.from(1_609_344, "mm").total("mi")).toBeCloseTo(1, 6);
  });

  it("to nmi", () => {
    expect(Length.from(1_852_000, "mm").total("nmi")).toBeCloseTo(1, 6);
  });

  it("to nm (nanometer)", () => {
    expect(Length.from(1, "mm").total("nm")).toBeCloseTo(1_000_000, 0);
  });

  it("to µm", () => {
    expect(Length.from(1, "mm").total("µm")).toBeCloseTo(1_000, 6);
  });
});

// ─── .total({ unit }) ────────────────────────────────────────────────────────

describe(".total({ unit })", () => {
  it("object form", () => {
    const result = Length.from({ meters: 1, centimeters: 50 }).total({ unit: "in" });
    expect(result).toBeCloseTo(1_500 / 25.4, 4);
  });

  it("string and object form return the same value", () => {
    const l = Length.from({ kilometers: 2 });
    expect(l.total("ft")).toBeCloseTo(l.total({ unit: "ft" }), 10);
  });
});

// ─── Unit aliases ─────────────────────────────────────────────────────────────

describe("unit aliases", () => {
  it("in and inch resolve the same", () => {
    expect(Length.from(1, "in").total("mm")).toBeCloseTo(Length.from(1, "inch").total("mm"), 10);
  });

  it("ft and foot resolve the same", () => {
    expect(Length.from(1, "ft").total("mm")).toBeCloseTo(Length.from(1, "foot").total("mm"), 10);
  });

  it("ft and feet resolve the same", () => {
    expect(Length.from(1, "ft").total("mm")).toBeCloseTo(Length.from(1, "feet").total("mm"), 10);
  });

  it("km and kilometer resolve the same", () => {
    expect(Length.from(1, "km").total("mm")).toBeCloseTo(Length.from(1, "kilometer").total("mm"), 10);
  });

  it("m and meter resolve the same", () => {
    expect(Length.from(1, "m").total("mm")).toBeCloseTo(Length.from(1, "meter").total("mm"), 10);
  });

  it("yd and yard resolve the same", () => {
    expect(Length.from(1, "yd").total("mm")).toBeCloseTo(Length.from(1, "yard").total("mm"), 10);
  });

  it("mi and mile resolve the same", () => {
    expect(Length.from(1, "mi").total("mm")).toBeCloseTo(Length.from(1, "mile").total("mm"), 10);
  });

  it("nmi and nautical-mile resolve the same", () => {
    expect(Length.from(1, "nmi").total("mm")).toBeCloseTo(Length.from(1, "nautical-mile").total("mm"), 10);
  });
});

// ─── valueOf ─────────────────────────────────────────────────────────────────

describe("valueOf", () => {
  it("returns millimeters", () => {
    expect(+Length.from(500, "mm")).toBe(500);
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────

describe("error handling", () => {
  it("throws on unknown unit", () => {
    expect(() => Length.from(1, "xyz" as any)).toThrow();
  });

  it("throws on unparseable string", () => {
    expect(() => Length.from("not-a-length")).toThrow();
  });
});

// ─── Type tests ───────────────────────────────────────────────────────────────

describe("types", () => {
  describe("Length.from argument types", () => {
    it("accepts `${number}mm` as first argument", () => {
      expectTypeOf(Length.from).toBeCallableWith(`${42}mm` as `${number}mm`);
    });

    it("accepts `${number}km` as first argument", () => {
      expectTypeOf(Length.from).toBeCallableWith(`${1.5}km` as `${number}km`);
    });

    it("accepts `${number}ft` as first argument", () => {
      expectTypeOf(Length.from).toBeCallableWith(`${6}ft` as `${number}ft`);
    });

    it("accepts LengthInput object as first argument", () => {
      expectTypeOf(Length.from).toBeCallableWith({ meters: 1, centimeters: 50 });
    });

    it("accepts number + unit alias as arguments", () => {
      expectTypeOf(Length.from).toBeCallableWith(10, "km");
    });

    it("first parameter accepts string", () => {
      expectTypeOf<Parameters<typeof Length.from>[0]>().toMatchTypeOf<string>();
    });
  });

  describe(".total argument types", () => {
    it("accepts unit alias string", () => {
      expectTypeOf(Length.from(1, "m").total).toBeCallableWith("ft");
    });

    it("accepts { unit } object", () => {
      expectTypeOf(Length.from(1, "m").total).toBeCallableWith({ unit: "ft" });
    });

    it("first parameter accepts string unit", () => {
      expectTypeOf<Parameters<Length["total"]>[0]>().toMatchTypeOf<string>();
    });

    it("first parameter accepts { unit: string } object", () => {
      expectTypeOf<Parameters<Length["total"]>[0]>().toMatchTypeOf<{ unit: string }>();
    });

    it("returns number", () => {
      expectTypeOf<ReturnType<Length["total"]>>().toEqualTypeOf<number>();
    });
  });
});
