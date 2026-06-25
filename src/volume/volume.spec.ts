import { describe, it, expect, expectTypeOf } from "bun:test";
import { Volume } from "./volume.js";

// ─── Volume.from(object) ──────────────────────────────────────────────────────

describe("Volume.from(object)", () => {
  it("combines liters and milliliters", () => {
    expect(Volume.from({ liters: 1, milliliters: 500 }).total("ml")).toBeCloseTo(1_500, 6);
  });

  it("single unit: 1 liter", () => {
    expect(Volume.from({ liter: 1 }).total("ml")).toBeCloseTo(1_000, 6);
  });

  it("single unit: 1 cup", () => {
    expect(Volume.from({ cup: 1 }).total("ml")).toBeCloseTo(236.5882365, 4);
  });

  it("mixed metric and US customary", () => {
    expect(Volume.from({ liters: 1, cups: 1 }).total("ml")).toBeCloseTo(1_000 + 236.5882365, 4);
  });

  it("supports plural aliases", () => {
    expect(Volume.from({ milliliters: 500 }).total("l")).toBeCloseTo(0.5, 6);
  });
});

// ─── Volume.from(number, unit) ────────────────────────────────────────────────

describe("Volume.from(number, unit)", () => {
  it("default unit is milliliter", () => {
    expect(Volume.from(250).total("ml")).toBe(250);
  });

  it("from liters", () => {
    expect(Volume.from(1, "l").total("ml")).toBeCloseTo(1_000, 6);
  });

  it("from fluid ounces", () => {
    expect(Volume.from(1, "floz").total("ml")).toBeCloseTo(29.5735295625, 6);
  });

  it("from cups", () => {
    expect(Volume.from(1, "cup").total("ml")).toBeCloseTo(236.5882365, 6);
  });

  it("from gallons", () => {
    expect(Volume.from(1, "gal").total("ml")).toBeCloseTo(3_785.411784, 4);
  });

  it("from cc", () => {
    expect(Volume.from(1, "cc").total("ml")).toBeCloseTo(1, 6);
  });
});

// ─── Volume.from(string) ─────────────────────────────────────────────────────

describe("Volume.from(string)", () => {
  it("parses '250ml'", () => {
    expect(Volume.from("250ml").total("l")).toBeCloseTo(0.25, 6);
  });

  it("parses '1.5l'", () => {
    expect(Volume.from("1.5l").total("ml")).toBeCloseTo(1_500, 6);
  });

  it("parses '8 floz'", () => {
    expect(Volume.from("8 floz").total("ml")).toBeCloseTo(8 * 29.5735295625, 4);
  });

  it("parses '1 cup'", () => {
    expect(Volume.from("1 cup").total("ml")).toBeCloseTo(236.5882365, 4);
  });

  it("parses '1 gal'", () => {
    expect(Volume.from("1 gal").total("l")).toBeCloseTo(3.785411784, 4);
  });

  it("throws on invalid string", () => {
    expect(() => Volume.from("abc")).toThrow();
  });
});

// ─── .total(unit) ─────────────────────────────────────────────────────────────

describe(".total(unit)", () => {
  it("main example: Volume.from({ liters: 1, milliliters: 500 }).total('floz')", () => {
    const result = Volume.from({ liters: 1, milliliters: 500 }).total("floz");
    expect(result).toBeCloseTo(1_500 / 29.5735295625, 4);
  });

  it("ml → l", () => {
    expect(Volume.from(1_000, "ml").total("l")).toBeCloseTo(1, 6);
  });

  it("l → ml", () => {
    expect(Volume.from(1, "l").total("ml")).toBeCloseTo(1_000, 6);
  });

  it("l → cl", () => {
    expect(Volume.from(1, "l").total("cl")).toBeCloseTo(100, 6);
  });

  it("l → dl", () => {
    expect(Volume.from(1, "l").total("dl")).toBeCloseTo(10, 6);
  });

  it("ml → floz", () => {
    expect(Volume.from(29.5735295625, "ml").total("floz")).toBeCloseTo(1, 6);
  });

  it("ml → cup", () => {
    expect(Volume.from(236.5882365, "ml").total("cup")).toBeCloseTo(1, 6);
  });

  it("ml → tbsp", () => {
    expect(Volume.from(14.78676478125, "ml").total("tbsp")).toBeCloseTo(1, 6);
  });

  it("ml → tsp", () => {
    expect(Volume.from(4.92892159375, "ml").total("tsp")).toBeCloseTo(1, 6);
  });

  it("ml → pt", () => {
    expect(Volume.from(473.176473, "ml").total("pt")).toBeCloseTo(1, 4);
  });

  it("ml → qt", () => {
    expect(Volume.from(946.352946, "ml").total("qt")).toBeCloseTo(1, 4);
  });

  it("ml → gal", () => {
    expect(Volume.from(3_785.411784, "ml").total("gal")).toBeCloseTo(1, 4);
  });

  it("ml → cc", () => {
    expect(Volume.from(5, "ml").total("cc")).toBeCloseTo(5, 6);
  });

  it("ml → cubic-inch", () => {
    expect(Volume.from(16.387064, "ml").total("cubic-inch")).toBeCloseTo(1, 6);
  });

  it("ml → cubic-foot", () => {
    expect(Volume.from(28_316.846592, "ml").total("cubic-foot")).toBeCloseTo(1, 4);
  });

  it("ml → imperial-fluid-ounce", () => {
    expect(Volume.from(28.4130625, "ml").total("imperial-fluid-ounce")).toBeCloseTo(1, 6);
  });

  it("ml → imperial-gallon", () => {
    expect(Volume.from(4_546.09, "ml").total("imperial-gallon")).toBeCloseTo(1, 4);
  });

  it("l → cubic-meter", () => {
    expect(Volume.from(1_000, "l").total("cubic-meter")).toBeCloseTo(1, 6);
  });
});

// ─── .total({ unit }) ────────────────────────────────────────────────────────

describe(".total({ unit })", () => {
  it("object form", () => {
    expect(Volume.from(1, "l").total({ unit: "ml" })).toBeCloseTo(1_000, 6);
  });

  it("string and object form return the same value", () => {
    const v = Volume.from({ liters: 2 });
    expect(v.total("floz")).toBeCloseTo(v.total({ unit: "floz" }), 10);
  });
});

// ─── Unit aliases ─────────────────────────────────────────────────────────────

describe("unit aliases", () => {
  it("ml and milliliter resolve the same", () => {
    expect(Volume.from(1, "ml").total("l")).toBeCloseTo(Volume.from(1, "milliliter").total("l"), 10);
  });

  it("l and liter resolve the same", () => {
    expect(Volume.from(1, "l").total("ml")).toBeCloseTo(Volume.from(1, "liter").total("ml"), 10);
  });

  it("l and litre resolve the same", () => {
    expect(Volume.from(1, "l").total("ml")).toBeCloseTo(Volume.from(1, "litre").total("ml"), 10);
  });

  it("floz and fluid-ounce resolve the same", () => {
    expect(Volume.from(1, "floz").total("ml")).toBeCloseTo(Volume.from(1, "fluid-ounce").total("ml"), 10);
  });

  it("gal and us-gallon resolve the same", () => {
    expect(Volume.from(1, "gal").total("ml")).toBeCloseTo(Volume.from(1, "us-gallon").total("ml"), 10);
  });

  it("cc and cubic-centimeter resolve the same", () => {
    expect(Volume.from(1, "cc").total("ml")).toBeCloseTo(Volume.from(1, "cubic-centimeter").total("ml"), 10);
  });

  it("tsp and us-teaspoon resolve the same", () => {
    expect(Volume.from(1, "tsp").total("ml")).toBeCloseTo(Volume.from(1, "us-teaspoon").total("ml"), 10);
  });

  it("tbsp and us-tablespoon resolve the same", () => {
    expect(Volume.from(1, "tbsp").total("ml")).toBeCloseTo(Volume.from(1, "us-tablespoon").total("ml"), 10);
  });
});

// ─── valueOf ─────────────────────────────────────────────────────────────────

describe("valueOf", () => {
  it("returns milliliters", () => {
    expect(+Volume.from(500, "ml")).toBe(500);
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────

describe("error handling", () => {
  it("throws on unknown unit", () => {
    expect(() => Volume.from(1, "xyz" as any)).toThrow();
  });

  it("throws on unparseable string", () => {
    expect(() => Volume.from("not-a-volume")).toThrow();
  });
});

// ─── Type tests ───────────────────────────────────────────────────────────────

describe("types", () => {
  describe("Volume.from argument types", () => {
    it("accepts `${number}ml` as first argument", () => {
      expectTypeOf(Volume.from).toBeCallableWith(`${250}ml` as `${number}ml`);
    });

    it("accepts `${number}l` as first argument", () => {
      expectTypeOf(Volume.from).toBeCallableWith(`${1.5}l` as `${number}l`);
    });

    it("accepts VolumeInput object as first argument", () => {
      expectTypeOf(Volume.from).toBeCallableWith({ liters: 1, milliliters: 500 });
    });

    it("accepts number + unit alias as arguments", () => {
      expectTypeOf(Volume.from).toBeCallableWith(250, "ml");
    });

    it("first parameter accepts string", () => {
      expectTypeOf<Parameters<typeof Volume.from>[0]>().toMatchTypeOf<string>();
    });
  });

  describe(".total argument types", () => {
    it("accepts unit alias string", () => {
      expectTypeOf(Volume.from(1, "l").total).toBeCallableWith("floz");
    });

    it("accepts { unit } object", () => {
      expectTypeOf(Volume.from(1, "l").total).toBeCallableWith({ unit: "floz" });
    });

    it("first parameter accepts string unit", () => {
      expectTypeOf<Parameters<Volume["total"]>[0]>().toMatchTypeOf<string>();
    });

    it("first parameter accepts { unit: string } object", () => {
      expectTypeOf<Parameters<Volume["total"]>[0]>().toMatchTypeOf<{ unit: string }>();
    });

    it("returns number", () => {
      expectTypeOf<ReturnType<Volume["total"]>>().toEqualTypeOf<number>();
    });
  });
});
