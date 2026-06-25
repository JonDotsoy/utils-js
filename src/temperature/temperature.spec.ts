import { describe, it, expect, expectTypeOf } from "bun:test";
import { Temperature } from "./temperature.js";

// ─── Temperature.from(object) ─────────────────────────────────────────────────

describe("Temperature.from(object)", () => {
  it("from { celsius: 100 }", () => {
    expect(Temperature.from({ celsius: 100 }).total("fahrenheit")).toBeCloseTo(212, 6);
  });

  it("from { fahrenheit: 32 }", () => {
    expect(Temperature.from({ fahrenheit: 32 }).total("celsius")).toBeCloseTo(0, 6);
  });

  it("from { kelvin: 273.15 }", () => {
    expect(Temperature.from({ kelvin: 273.15 }).total("celsius")).toBeCloseTo(0, 6);
  });

  it("throws when more than one unit is provided", () => {
    expect(() => Temperature.from({ celsius: 100, fahrenheit: 212 } as any)).toThrow();
  });

  it("throws when no unit is provided", () => {
    expect(() => Temperature.from({})).toThrow();
  });
});

// ─── Temperature.from(number, unit) ──────────────────────────────────────────

describe("Temperature.from(number, unit)", () => {
  it("default unit is kelvin", () => {
    expect(Temperature.from(273.15, "kelvin").total("celsius")).toBeCloseTo(0, 6);
  });

  it("from celsius", () => {
    expect(Temperature.from(100, "celsius").total("fahrenheit")).toBeCloseTo(212, 6);
  });

  it("from fahrenheit", () => {
    expect(Temperature.from(32, "fahrenheit").total("celsius")).toBeCloseTo(0, 6);
  });

  it("from kelvin", () => {
    expect(Temperature.from(0, "kelvin").total("celsius")).toBeCloseTo(-273.15, 6);
  });
});

// ─── Temperature.from(string) ─────────────────────────────────────────────────

describe("Temperature.from(string)", () => {
  it("parses '100C'", () => {
    expect(Temperature.from("100C").total("fahrenheit")).toBeCloseTo(212, 6);
  });

  it("parses '100°C'", () => {
    expect(Temperature.from("100°C").total("fahrenheit")).toBeCloseTo(212, 6);
  });

  it("parses '32F'", () => {
    expect(Temperature.from("32F").total("celsius")).toBeCloseTo(0, 6);
  });

  it("parses '373.15K'", () => {
    expect(Temperature.from("373.15K").total("celsius")).toBeCloseTo(100, 6);
  });

  it("parses '100 celsius'", () => {
    expect(Temperature.from("100 celsius").total("f")).toBeCloseTo(212, 6);
  });

  it("throws on invalid string", () => {
    expect(() => Temperature.from("hot")).toThrow();
  });
});

// ─── .total(unit) ─────────────────────────────────────────────────────────────

describe(".total(unit)", () => {
  it("celsius → fahrenheit: 0°C = 32°F", () => {
    expect(Temperature.from(0, "celsius").total("fahrenheit")).toBeCloseTo(32, 6);
  });

  it("celsius → fahrenheit: 100°C = 212°F", () => {
    expect(Temperature.from(100, "celsius").total("fahrenheit")).toBeCloseTo(212, 6);
  });

  it("celsius → kelvin: 0°C = 273.15K", () => {
    expect(Temperature.from(0, "celsius").total("kelvin")).toBeCloseTo(273.15, 6);
  });

  it("fahrenheit → celsius: 32°F = 0°C", () => {
    expect(Temperature.from(32, "fahrenheit").total("celsius")).toBeCloseTo(0, 6);
  });

  it("fahrenheit → celsius: 212°F = 100°C", () => {
    expect(Temperature.from(212, "fahrenheit").total("celsius")).toBeCloseTo(100, 6);
  });

  it("kelvin → celsius: 0K = -273.15°C", () => {
    expect(Temperature.from(0, "kelvin").total("celsius")).toBeCloseTo(-273.15, 6);
  });

  it("celsius → rankine", () => {
    expect(Temperature.from(0, "celsius").total("rankine")).toBeCloseTo(491.67, 2);
  });

  it("celsius → delisle: 100°C = 0°De", () => {
    expect(Temperature.from(100, "celsius").total("delisle")).toBeCloseTo(0, 6);
  });

  it("celsius → newton: 100°C = 33°N", () => {
    expect(Temperature.from(100, "celsius").total("newton")).toBeCloseTo(33, 6);
  });

  it("celsius → reaumur: 100°C = 80°Ré", () => {
    expect(Temperature.from(100, "celsius").total("reaumur")).toBeCloseTo(80, 6);
  });

  it("celsius → romer: 0°C = 7.5°Rø", () => {
    expect(Temperature.from(0, "celsius").total("romer")).toBeCloseTo(7.5, 6);
  });
});

// ─── .total({ unit }) ─────────────────────────────────────────────────────────

describe(".total({ unit })", () => {
  it("object form", () => {
    expect(Temperature.from(100, "celsius").total({ unit: "fahrenheit" })).toBeCloseTo(212, 6);
  });

  it("string and object form return the same value", () => {
    const t = Temperature.from(100, "celsius");
    expect(t.total("kelvin")).toBeCloseTo(t.total({ unit: "kelvin" }), 10);
  });
});

// ─── Unit aliases ──────────────────────────────────────────────────────────────

describe("unit aliases", () => {
  it("C and celsius resolve the same", () => {
    expect(Temperature.from(100, "C").total("kelvin")).toBeCloseTo(
      Temperature.from(100, "celsius").total("kelvin"), 10,
    );
  });

  it("F and fahrenheit resolve the same", () => {
    expect(Temperature.from(100, "F").total("kelvin")).toBeCloseTo(
      Temperature.from(100, "fahrenheit").total("kelvin"), 10,
    );
  });

  it("K and kelvin resolve the same", () => {
    expect(Temperature.from(300, "K").total("celsius")).toBeCloseTo(
      Temperature.from(300, "kelvin").total("celsius"), 10,
    );
  });

  it("°C alias", () => {
    expect(Temperature.from("100°C").total("kelvin")).toBeCloseTo(
      Temperature.from(100, "celsius").total("kelvin"), 10,
    );
  });
});

// ─── toLocaleString ───────────────────────────────────────────────────────────

describe("toLocaleString", () => {
  it("infers celsius by default", () => {
    expect(Temperature.from(293.15, "kelvin").toLocaleString("en-US")).toBe("20°C");
  });

  it("unit: celsius", () => {
    expect(Temperature.from(100, "celsius").toLocaleString("en-US", { unit: "celsius" })).toBe("100°C");
  });

  it("unit: fahrenheit", () => {
    expect(Temperature.from(32, "fahrenheit").toLocaleString("en-US", { unit: "fahrenheit" })).toBe("32°F");
  });

  it("respects unitDisplay: long", () => {
    expect(Temperature.from(0, "celsius").toLocaleString("en-US", { unit: "celsius", unitDisplay: "long" })).toBe("0 degrees Celsius");
  });

  it("respects maximumFractionDigits", () => {
    expect(Temperature.from(98.6, "fahrenheit").toLocaleString("en-US", { unit: "fahrenheit", maximumFractionDigits: 0 })).toBe("99°F");
  });
});

// ─── valueOf ──────────────────────────────────────────────────────────────────

describe("valueOf", () => {
  it("returns kelvin", () => {
    expect(+Temperature.from(0, "celsius")).toBeCloseTo(273.15, 6);
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────

describe("error handling", () => {
  it("throws on unknown unit", () => {
    expect(() => Temperature.from(100, "xyz" as any)).toThrow();
  });

  it("throws on unparseable string", () => {
    expect(() => Temperature.from("hot")).toThrow();
  });
});

// ─── Type tests ───────────────────────────────────────────────────────────────

describe("types", () => {
  describe("Temperature.from argument types", () => {
    it("accepts `${number}C` as first argument", () => {
      expectTypeOf(Temperature.from).toBeCallableWith(`${100}C` as `${number}C`);
    });

    it("accepts `${number}F` as first argument", () => {
      expectTypeOf(Temperature.from).toBeCallableWith(`${32}F` as `${number}F`);
    });

    it("accepts TemperatureInput object as first argument", () => {
      expectTypeOf(Temperature.from).toBeCallableWith({ celsius: 100 });
    });

    it("accepts number + unit alias as arguments", () => {
      expectTypeOf(Temperature.from).toBeCallableWith(100, "celsius");
    });

    it("first parameter accepts string", () => {
      expectTypeOf<Parameters<typeof Temperature.from>[0]>().toMatchTypeOf<string>();
    });
  });

  describe(".total argument types", () => {
    it("accepts unit alias string", () => {
      expectTypeOf(Temperature.from(100, "celsius").total).toBeCallableWith("fahrenheit");
    });

    it("accepts { unit } object", () => {
      expectTypeOf(Temperature.from(100, "celsius").total).toBeCallableWith({ unit: "fahrenheit" });
    });

    it("first parameter accepts string unit", () => {
      expectTypeOf<Parameters<Temperature["total"]>[0]>().toMatchTypeOf<string>();
    });

    it("returns number", () => {
      expectTypeOf<ReturnType<Temperature["total"]>>().toEqualTypeOf<number>();
    });
  });
});
