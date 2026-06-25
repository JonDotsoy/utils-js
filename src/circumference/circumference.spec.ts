import { describe, it, expect, expectTypeOf } from "bun:test";
import { Circumference } from "./circumference.js";

// ─── Circumference.from(object) ───────────────────────────────────────────────

describe("Circumference.from(object)", () => {
  it("combines meters and centimeters", () => {
    expect(Circumference.from({ meters: 1, centimeters: 50 }).total("mm")).toBeCloseTo(1_500, 6);
  });

  it("single unit: 1 m", () => {
    expect(Circumference.from({ meter: 1 }).total("mm")).toBeCloseTo(1_000, 6);
  });

  it("supports plural aliases", () => {
    expect(Circumference.from({ centimeters: 100 }).total("mm")).toBeCloseTo(1_000, 6);
  });
});

// ─── Circumference.from(number, unit) ────────────────────────────────────────

describe("Circumference.from(number, unit)", () => {
  it("default unit is millimeter", () => {
    expect(Circumference.from(314).total("mm")).toBe(314);
  });

  it("from cm", () => {
    expect(Circumference.from(100, "cm").total("mm")).toBeCloseTo(1_000, 6);
  });

  it("from inches", () => {
    expect(Circumference.from(1, "in").total("mm")).toBeCloseTo(25.4, 6);
  });
});

// ─── Circumference.from(string) ──────────────────────────────────────────────

describe("Circumference.from(string)", () => {
  it("parses '314mm'", () => {
    expect(Circumference.from("314mm").total("cm")).toBeCloseTo(31.4, 6);
  });

  it("parses '1m'", () => {
    expect(Circumference.from("1m").total("cm")).toBeCloseTo(100, 6);
  });

  it("parses '12in'", () => {
    expect(Circumference.from("12in").total("mm")).toBeCloseTo(304.8, 6);
  });

  it("throws on invalid string", () => {
    expect(() => Circumference.from("abc")).toThrow();
  });
});

// ─── Circumference.fromRadius ─────────────────────────────────────────────────

describe("Circumference.fromRadius", () => {
  it("fromRadius 1m → circumference in mm = 2π×1000", () => {
    expect(Circumference.fromRadius(1, "m").total("mm")).toBeCloseTo(2 * Math.PI * 1_000, 6);
  });

  it("fromRadius 5cm", () => {
    expect(Circumference.fromRadius(5, "cm").total("mm")).toBeCloseTo(2 * Math.PI * 50, 6);
  });

  it("fromRadius 1in", () => {
    expect(Circumference.fromRadius(1, "in").total("in")).toBeCloseTo(2 * Math.PI, 6);
  });

  it("radius round-trips back", () => {
    const c = Circumference.fromRadius(7, "cm");
    expect(c.radius("cm")).toBeCloseTo(7, 6);
  });
});

// ─── Circumference.fromDiameter ───────────────────────────────────────────────

describe("Circumference.fromDiameter", () => {
  it("fromDiameter 1m → circumference in mm = π×1000", () => {
    expect(Circumference.fromDiameter(1, "m").total("mm")).toBeCloseTo(Math.PI * 1_000, 6);
  });

  it("fromDiameter 10cm", () => {
    expect(Circumference.fromDiameter(10, "cm").total("mm")).toBeCloseTo(Math.PI * 100, 6);
  });

  it("diameter round-trips back", () => {
    const c = Circumference.fromDiameter(14, "cm");
    expect(c.diameter("cm")).toBeCloseTo(14, 6);
  });

  it("diameter = 2 × radius", () => {
    const c = Circumference.fromRadius(5, "cm");
    expect(c.diameter("cm")).toBeCloseTo(10, 6);
  });
});

// ─── .total(unit) ─────────────────────────────────────────────────────────────

describe(".total(unit)", () => {
  it("mm → cm", () => {
    expect(Circumference.from(1_000, "mm").total("cm")).toBeCloseTo(100, 6);
  });

  it("mm → m", () => {
    expect(Circumference.from(1_000, "mm").total("m")).toBeCloseTo(1, 6);
  });

  it("mm → in", () => {
    expect(Circumference.from(25.4, "mm").total("in")).toBeCloseTo(1, 6);
  });

  it("mm → ft", () => {
    expect(Circumference.from(304.8, "mm").total("ft")).toBeCloseTo(1, 6);
  });

  it("mm → km", () => {
    expect(Circumference.from(1_000_000, "mm").total("km")).toBeCloseTo(1, 6);
  });

  it("mm → yd", () => {
    expect(Circumference.from(914.4, "mm").total("yd")).toBeCloseTo(1, 6);
  });

  it("mm → mi", () => {
    expect(Circumference.from(1_609_344, "mm").total("mi")).toBeCloseTo(1, 6);
  });
});

// ─── .total({ unit }) ────────────────────────────────────────────────────────

describe(".total({ unit })", () => {
  it("object form", () => {
    expect(Circumference.from(1, "m").total({ unit: "cm" })).toBeCloseTo(100, 6);
  });

  it("string and object form return the same value", () => {
    const c = Circumference.fromRadius(5, "cm");
    expect(c.total("in")).toBeCloseTo(c.total({ unit: "in" }), 10);
  });
});

// ─── .radius() and .diameter() ────────────────────────────────────────────────

describe(".radius() and .diameter()", () => {
  it("radius in mm from circumference", () => {
    const c = Circumference.from(2 * Math.PI * 10, "mm");
    expect(c.radius("mm")).toBeCloseTo(10, 6);
  });

  it("diameter in cm from circumference", () => {
    const c = Circumference.from(Math.PI * 20, "mm");
    expect(c.diameter("mm")).toBeCloseTo(20, 6);
  });

  it("radius in inches", () => {
    const c = Circumference.fromRadius(2, "in");
    expect(c.radius("in")).toBeCloseTo(2, 6);
  });

  it("diameter in feet", () => {
    const c = Circumference.fromDiameter(3, "ft");
    expect(c.diameter("ft")).toBeCloseTo(3, 6);
  });
});

// ─── Unit aliases ─────────────────────────────────────────────────────────────

describe("unit aliases", () => {
  it("mm and millimeter resolve the same", () => {
    expect(Circumference.from(1, "mm").total("m")).toBeCloseTo(Circumference.from(1, "millimeter").total("m"), 10);
  });

  it("in and inch resolve the same", () => {
    expect(Circumference.from(1, "in").total("mm")).toBeCloseTo(Circumference.from(1, "inch").total("mm"), 10);
  });

  it("ft and foot resolve the same", () => {
    expect(Circumference.from(1, "ft").total("mm")).toBeCloseTo(Circumference.from(1, "foot").total("mm"), 10);
  });

  it("ft and feet resolve the same", () => {
    expect(Circumference.from(1, "ft").total("mm")).toBeCloseTo(Circumference.from(1, "feet").total("mm"), 10);
  });
});

// ─── toLocaleString ───────────────────────────────────────────────────────────

describe("toLocaleString", () => {
  it("infers millimeter for 5 mm", () => {
    expect(Circumference.from(5, "mm").toLocaleString("en-US")).toBe("5 mm");
  });

  it("infers centimeter for 50 mm", () => {
    expect(Circumference.from(50, "mm").toLocaleString("en-US")).toBe("5 cm");
  });

  it("infers meter for 2 000 mm", () => {
    expect(Circumference.from(2_000, "mm").toLocaleString("en-US")).toBe("2 m");
  });

  it("infers kilometer for 5 000 000 mm", () => {
    expect(Circumference.from(5_000_000, "mm").toLocaleString("en-US")).toBe("5 km");
  });

  it("unit: millimeter", () => {
    expect(Circumference.from(1, "mm").toLocaleString("en-US", { unit: "millimeter" })).toBe("1 mm");
  });

  it("unit: centimeter", () => {
    expect(Circumference.from(1, "cm").toLocaleString("en-US", { unit: "centimeter" })).toBe("1 cm");
  });

  it("unit: meter", () => {
    expect(Circumference.from(1, "m").toLocaleString("en-US", { unit: "meter" })).toBe("1 m");
  });

  it("unit: kilometer", () => {
    expect(Circumference.from(1, "km").toLocaleString("en-US", { unit: "kilometer" })).toBe("1 km");
  });

  it("unit: inch", () => {
    expect(Circumference.from(1, "inch").toLocaleString("en-US", { unit: "inch" })).toBe("1 in");
  });

  it("unit: foot", () => {
    expect(Circumference.from(1, "foot").toLocaleString("en-US", { unit: "foot" })).toBe("1 ft");
  });

  it("unit: yard", () => {
    expect(Circumference.from(1, "yard").toLocaleString("en-US", { unit: "yard" })).toBe("1 yd");
  });

  it("unit: mile", () => {
    expect(Circumference.from(1, "mile").toLocaleString("en-US", { unit: "mile" })).toBe("1 mi");
  });

  it("respects unitDisplay: long", () => {
    expect(Circumference.from(1, "km").toLocaleString("en-US", { unit: "kilometer", unitDisplay: "long" })).toBe("1 kilometer");
  });

  it("respects maximumFractionDigits", () => {
    expect(Circumference.from(1_234, "mm").toLocaleString("en-US", { maximumFractionDigits: 2 })).toBe("1.23 m");
  });
});

// ─── valueOf ─────────────────────────────────────────────────────────────────

describe("valueOf", () => {
  it("returns millimeters", () => {
    expect(+Circumference.from(500, "mm")).toBe(500);
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────

describe("error handling", () => {
  it("throws on unknown unit", () => {
    expect(() => Circumference.from(1, "xyz" as any)).toThrow();
  });

  it("throws on unparseable string", () => {
    expect(() => Circumference.from("not-a-length")).toThrow();
  });
});

// ─── Type tests ───────────────────────────────────────────────────────────────

describe("types", () => {
  describe("Circumference.from argument types", () => {
    it("accepts `${number}mm` as first argument", () => {
      expectTypeOf(Circumference.from).toBeCallableWith(`${314}mm` as `${number}mm`);
    });

    it("accepts `${number}cm` as first argument", () => {
      expectTypeOf(Circumference.from).toBeCallableWith(`${31.4}cm` as `${number}cm`);
    });

    it("accepts CircumferenceInput object as first argument", () => {
      expectTypeOf(Circumference.from).toBeCallableWith({ meters: 1, centimeters: 50 });
    });

    it("accepts number + unit alias as arguments", () => {
      expectTypeOf(Circumference.from).toBeCallableWith(100, "cm");
    });

    it("first parameter accepts string", () => {
      expectTypeOf<Parameters<typeof Circumference.from>[0]>().toMatchTypeOf<string>();
    });
  });

  describe("Circumference.fromRadius / fromDiameter argument types", () => {
    it("fromRadius accepts number + unit", () => {
      expectTypeOf(Circumference.fromRadius).toBeCallableWith(5, "cm");
    });

    it("fromDiameter accepts number + unit", () => {
      expectTypeOf(Circumference.fromDiameter).toBeCallableWith(10, "cm");
    });
  });

  describe(".total argument types", () => {
    it("accepts unit alias string", () => {
      expectTypeOf(Circumference.from(1, "m").total).toBeCallableWith("in");
    });

    it("accepts { unit } object", () => {
      expectTypeOf(Circumference.from(1, "m").total).toBeCallableWith({ unit: "in" });
    });

    it("returns number", () => {
      expectTypeOf<ReturnType<Circumference["total"]>>().toEqualTypeOf<number>();
    });
  });

  describe(".radius / .diameter argument types", () => {
    it(".radius returns number", () => {
      expectTypeOf<ReturnType<Circumference["radius"]>>().toEqualTypeOf<number>();
    });

    it(".diameter returns number", () => {
      expectTypeOf<ReturnType<Circumference["diameter"]>>().toEqualTypeOf<number>();
    });
  });
});
