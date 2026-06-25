import { describe, it, expect } from "vitest";
import { Weight } from "./weight.js";

// ─── Weight.from(object) ──────────────────────────────────────────────────────

describe("Weight.from(object)", () => {
  it("combines kilograms and grams", () => {
    const w = Weight.from({ kilograms: 12, grams: 345 });
    expect(w.grams).toBeCloseTo(12_345, 6);
  });

  it("single unit: 1 kg", () => {
    expect(Weight.from({ kilogram: 1 }).grams).toBeCloseTo(1_000, 6);
  });

  it("single unit: 1 lb", () => {
    expect(Weight.from({ pound: 1 }).grams).toBeCloseTo(453.59237, 4);
  });

  it("mixed metric and imperial", () => {
    const w = Weight.from({ kilograms: 1, ounces: 1 });
    expect(w.grams).toBeCloseTo(1_000 + 28.349523125, 4);
  });

  it("supports plural aliases", () => {
    expect(Weight.from({ milligrams: 500 }).grams).toBeCloseTo(0.5, 6);
  });
});

// ─── Weight.from(number, unit) ────────────────────────────────────────────────

describe("Weight.from(number, unit)", () => {
  it("default unit is gram", () => {
    expect(Weight.from(100).grams).toBe(100);
  });

  it("from kilograms", () => {
    expect(Weight.from(1, "kg").grams).toBe(1_000);
  });

  it("from pounds", () => {
    expect(Weight.from(1, "lb").grams).toBeCloseTo(453.59237, 4);
  });

  it("from ounces", () => {
    expect(Weight.from(16, "oz").grams).toBeCloseTo(16 * 28.349523125, 4);
  });
});

// ─── Weight.from(string) ─────────────────────────────────────────────────────

describe("Weight.from(string)", () => {
  it("parses '12.345 kg'", () => {
    expect(Weight.from("12.345 kg").grams).toBeCloseTo(12_345, 4);
  });

  it("parses '500mg'", () => {
    expect(Weight.from("500mg").grams).toBeCloseTo(0.5, 6);
  });

  it("parses '2.5lb'", () => {
    expect(Weight.from("2.5lb").grams).toBeCloseTo(2.5 * 453.59237, 4);
  });

  it("parses '16oz'", () => {
    expect(Weight.from("16oz").grams).toBeCloseTo(16 * 28.349523125, 4);
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

// ─── Convenience getters ─────────────────────────────────────────────────────

describe("convenience getters", () => {
  const w = Weight.from(1, "kg");

  it(".grams", () => expect(w.grams).toBeCloseTo(1_000, 6));
  it(".milligrams", () => expect(w.milligrams).toBeCloseTo(1_000_000, 0));
  it(".micrograms", () => expect(w.micrograms).toBeCloseTo(1_000_000_000, 0));
  it(".kilograms", () => expect(w.kilograms).toBeCloseTo(1, 6));
  it(".ounces", () => expect(w.ounces).toBeCloseTo(1_000 / 28.349523125, 4));
  it(".pounds", () => expect(w.pounds).toBeCloseTo(1_000 / 453.59237, 4));
  it(".stones", () => expect(w.stones).toBeCloseTo(1_000 / 6_350.29318, 4));
  it(".troyOunces", () => expect(w.troyOunces).toBeCloseTo(1_000 / 31.1034768, 4));
  it(".carats", () => expect(w.carats).toBeCloseTo(5_000, 4));
});

// ─── Unit aliases ─────────────────────────────────────────────────────────────

describe("unit aliases", () => {
  it("oz and ounce resolve the same", () => {
    expect(Weight.from(1, "oz").grams).toBeCloseTo(Weight.from(1, "ounce").grams, 10);
  });

  it("lb and pound resolve the same", () => {
    expect(Weight.from(1, "lb").grams).toBeCloseTo(Weight.from(1, "pound").grams, 10);
  });

  it("kg and kilogram resolve the same", () => {
    expect(Weight.from(1, "kg").grams).toBeCloseTo(Weight.from(1, "kilogram").grams, 10);
  });

  it("mg and milligram resolve the same", () => {
    expect(Weight.from(1, "mg").grams).toBeCloseTo(Weight.from(1, "milligram").grams, 10);
  });

  it("t and tonne resolve the same", () => {
    expect(Weight.from(1, "t").grams).toBeCloseTo(Weight.from(1, "tonne").grams, 10);
  });

  it("ozt and troy-ounce resolve the same", () => {
    expect(Weight.from(1, "ozt").grams).toBeCloseTo(Weight.from(1, "troy-ounce").grams, 10);
  });

  it("ct and carat resolve the same", () => {
    expect(Weight.from(1, "ct").grams).toBeCloseTo(Weight.from(1, "carat").grams, 10);
  });

  it("gr and grain resolve the same", () => {
    expect(Weight.from(1, "gr").grams).toBeCloseTo(Weight.from(1, "grain").grams, 10);
  });

  it("st and stone resolve the same", () => {
    expect(Weight.from(1, "st").grams).toBeCloseTo(Weight.from(1, "stone").grams, 10);
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
