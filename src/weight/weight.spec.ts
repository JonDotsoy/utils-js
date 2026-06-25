import { describe, it, expect } from "vitest";
import { expectTypeOf } from "expect-type";
import { Weight } from "./weight.js";

// ─── Weight.from(object) ──────────────────────────────────────────────────────

describe("Weight.from(object)", () => {
  it("combines kilograms and grams", () => {
    const w = Weight.from({ kilograms: 12, grams: 345 });
    expect(w.total("grams")).toBeCloseTo(12_345, 6);
  });

  it("single unit: 1 kg", () => {
    expect(Weight.from({ kilogram: 1 }).total("grams")).toBeCloseTo(1_000, 6);
  });

  it("single unit: 1 lb", () => {
    expect(Weight.from({ pound: 1 }).total("grams")).toBeCloseTo(453.59237, 4);
  });

  it("mixed metric and imperial", () => {
    const w = Weight.from({ kilograms: 1, ounces: 1 });
    expect(w.total("grams")).toBeCloseTo(1_000 + 28.349523125, 4);
  });

  it("supports plural aliases", () => {
    expect(Weight.from({ milligrams: 500 }).total("grams")).toBeCloseTo(0.5, 6);
  });
});

// ─── Weight.from(number, unit) ────────────────────────────────────────────────

describe("Weight.from(number, unit)", () => {
  it("default unit is gram", () => {
    expect(Weight.from(100).total("grams")).toBe(100);
  });

  it("from kilograms", () => {
    expect(Weight.from(1, "kg").total("grams")).toBe(1_000);
  });

  it("from pounds", () => {
    expect(Weight.from(1, "lb").total("grams")).toBeCloseTo(453.59237, 4);
  });

  it("from ounces", () => {
    expect(Weight.from(16, "oz").total("grams")).toBeCloseTo(16 * 28.349523125, 4);
  });
});

// ─── Weight.from(string) ─────────────────────────────────────────────────────

describe("Weight.from(string)", () => {
  it("parses '12.345 kg'", () => {
    expect(Weight.from("12.345 kg").total("grams")).toBeCloseTo(12_345, 4);
  });

  it("parses '500mg'", () => {
    expect(Weight.from("500mg").total("grams")).toBeCloseTo(0.5, 6);
  });

  it("parses '2.5lb'", () => {
    expect(Weight.from("2.5lb").total("grams")).toBeCloseTo(2.5 * 453.59237, 4);
  });

  it("parses '16oz'", () => {
    expect(Weight.from("16oz").total("grams")).toBeCloseTo(16 * 28.349523125, 4);
  });

  it("throws on invalid string", () => {
    expect(() => Weight.from("abc")).toThrow();
  });
});

// ─── .total(unit) ────────────────────────────────────────────────────────────

describe(".total(unit)", () => {
  it("main example: Weight.from({ kilograms: 12, grams: 345 }).total('oz')", () => {
    const result = Weight.from({ kilograms: 12, grams: 345 }).total("oz");
    expect(result).toBeCloseTo(12_345 / 28.349523125, 4);
  });

  it("to oz", () => {
    expect(Weight.from(28.349523125, "gram").total("oz")).toBeCloseTo(1, 4);
  });

  it("to lb", () => {
    expect(Weight.from(453.59237, "gram").total("lb")).toBeCloseTo(1, 4);
  });

  it("to kg", () => {
    expect(Weight.from(1_000, "gram").total("kg")).toBeCloseTo(1, 6);
  });

  it("to mg", () => {
    expect(Weight.from(1, "gram").total("mg")).toBeCloseTo(1_000, 6);
  });

  it("to tonne", () => {
    expect(Weight.from(1_000_000, "gram").total("tonne")).toBeCloseTo(1, 6);
  });

  it("to grain", () => {
    expect(Weight.from(1, "gram").total("grain")).toBeCloseTo(1 / 0.06479891, 4);
  });

  it("to stone", () => {
    expect(Weight.from(6_350.29318, "gram").total("stone")).toBeCloseTo(1, 4);
  });

  it("to short-ton", () => {
    expect(Weight.from(907_184.74, "gram").total("short-ton")).toBeCloseTo(1, 2);
  });

  it("to long-ton", () => {
    expect(Weight.from(1_016_046.9088, "gram").total("long-ton")).toBeCloseTo(1, 2);
  });

  it("to troy-ounce", () => {
    expect(Weight.from(31.1034768, "gram").total("troy-ounce")).toBeCloseTo(1, 4);
  });

  it("to troy-pound", () => {
    expect(Weight.from(373.2417216, "gram").total("troy-pound")).toBeCloseTo(1, 4);
  });

  it("to carat", () => {
    expect(Weight.from(1, "gram").total("carat")).toBeCloseTo(5, 6);
  });

  it("to microgram", () => {
    expect(Weight.from(1, "gram").total("microgram")).toBeCloseTo(1_000_000, 0);
  });
});

// ─── .total({ unit }) ────────────────────────────────────────────────────────

describe(".total({ unit })", () => {
  it("main example with object form", () => {
    const result = Weight.from({ kilograms: 12, grams: 345 }).total({ unit: "oz" });
    expect(result).toBeCloseTo(12_345 / 28.349523125, 4);
  });

  it("to grams via object", () => {
    expect(Weight.from(1, "kg").total({ unit: "grams" })).toBeCloseTo(1_000, 6);
  });

  it("to oz via object", () => {
    expect(Weight.from(453.59237, "gram").total({ unit: "oz" })).toBeCloseTo(16, 3);
  });

  it("string and object form return the same value", () => {
    const w = Weight.from({ kilograms: 5 });
    expect(w.total("lb")).toBeCloseTo(w.total({ unit: "lb" }), 10);
  });
});

// ─── Unit aliases ─────────────────────────────────────────────────────────────

describe("unit aliases", () => {
  it("oz and ounce resolve the same", () => {
    expect(Weight.from(1, "oz").total("grams")).toBeCloseTo(Weight.from(1, "ounce").total("grams"), 10);
  });

  it("lb and pound resolve the same", () => {
    expect(Weight.from(1, "lb").total("grams")).toBeCloseTo(Weight.from(1, "pound").total("grams"), 10);
  });

  it("kg and kilogram resolve the same", () => {
    expect(Weight.from(1, "kg").total("grams")).toBeCloseTo(Weight.from(1, "kilogram").total("grams"), 10);
  });

  it("mg and milligram resolve the same", () => {
    expect(Weight.from(1, "mg").total("grams")).toBeCloseTo(Weight.from(1, "milligram").total("grams"), 10);
  });

  it("t and tonne resolve the same", () => {
    expect(Weight.from(1, "t").total("grams")).toBeCloseTo(Weight.from(1, "tonne").total("grams"), 10);
  });

  it("ozt and troy-ounce resolve the same", () => {
    expect(Weight.from(1, "ozt").total("grams")).toBeCloseTo(Weight.from(1, "troy-ounce").total("grams"), 10);
  });

  it("ct and carat resolve the same", () => {
    expect(Weight.from(1, "ct").total("grams")).toBeCloseTo(Weight.from(1, "carat").total("grams"), 10);
  });

  it("gr and grain resolve the same", () => {
    expect(Weight.from(1, "gr").total("grams")).toBeCloseTo(Weight.from(1, "grain").total("grams"), 10);
  });

  it("st and stone resolve the same", () => {
    expect(Weight.from(1, "st").total("grams")).toBeCloseTo(Weight.from(1, "stone").total("grams"), 10);
  });
});

// ─── valueOf ─────────────────────────────────────────────────────────────────

describe("valueOf", () => {
  it("returns grams", () => {
    expect(+Weight.from(500, "gram")).toBe(500);
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────

describe("error handling", () => {
  it("throws on unknown unit string", () => {
    expect(() => Weight.from(1, "xyz" as any)).toThrow();
  });

  it("throws on unparseable string", () => {
    expect(() => Weight.from("not-a-weight")).toThrow();
  });
});

// ─── Type tests ───────────────────────────────────────────────────────────────

describe("types", () => {
  describe("Weight.from argument types", () => {
    it("accepts `${number}oz` as first argument", () => {
      expectTypeOf(Weight.from).toBeCallableWith(`${42}oz` as `${number}oz`);
    });

    it("accepts `${number}kg` as first argument", () => {
      expectTypeOf(Weight.from).toBeCallableWith(`${1.5}kg` as `${number}kg`);
    });

    it("accepts `${number}lb` as first argument", () => {
      expectTypeOf(Weight.from).toBeCallableWith(`${10}lb` as `${number}lb`);
    });

    it("accepts WeightInput object as first argument", () => {
      expectTypeOf(Weight.from).toBeCallableWith({ kilograms: 12, grams: 345 });
    });

    it("accepts number + unit alias as arguments", () => {
      expectTypeOf(Weight.from).toBeCallableWith(10, "oz");
    });

    it("first parameter accepts string", () => {
      expectTypeOf(Weight.from).parameter(0).toMatchTypeOf<string>();
    });
  });

  describe(".total argument types", () => {
    it("accepts unit alias string", () => {
      expectTypeOf(Weight.from(1, "kg").total).toBeCallableWith("oz");
    });

    it("accepts { unit } object", () => {
      expectTypeOf(Weight.from(1, "kg").total).toBeCallableWith({ unit: "oz" });
    });

    it("first parameter accepts string unit", () => {
      expectTypeOf(Weight.from(1, "kg").total).parameter(0).toMatchTypeOf<string>();
    });

    it("first parameter accepts { unit: string } object", () => {
      expectTypeOf(Weight.from(1, "kg").total).parameter(0).toMatchTypeOf<{ unit: string }>();
    });

    it("returns number", () => {
      expectTypeOf(Weight.from(1, "kg").total).returns.toEqualTypeOf<number>();
    });
  });
});
