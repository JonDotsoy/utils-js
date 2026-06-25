import { describe, it, expect, expectTypeOf } from "bun:test";
import { DataSize } from "./data-size.js";

// ─── DataSize.from(object) ────────────────────────────────────────────────────

describe("DataSize.from(object)", () => {
  it("combines megabytes and bytes", () => {
    const d = DataSize.from({ megabytes: 1, bytes: 500 });
    expect(d.total("bytes")).toBe(1_000_500);
  });

  it("single unit: 1 GB", () => {
    expect(DataSize.from({ gigabyte: 1 }).total("bytes")).toBe(1_000_000_000);
  });

  it("single unit: 1 GiB", () => {
    expect(DataSize.from({ gibibyte: 1 }).total("bytes")).toBe(1_073_741_824);
  });

  it("supports plural aliases", () => {
    expect(DataSize.from({ kilobytes: 5 }).total("bytes")).toBe(5_000);
  });
});

// ─── DataSize.from(number, unit) ─────────────────────────────────────────────

describe("DataSize.from(number, unit)", () => {
  it("default unit is byte", () => {
    expect(DataSize.from(1024).total("bytes")).toBe(1024);
  });

  it("from KB", () => {
    expect(DataSize.from(1, "KB").total("bytes")).toBe(1_000);
  });

  it("from KiB", () => {
    expect(DataSize.from(1, "KiB").total("bytes")).toBe(1_024);
  });

  it("from MB", () => {
    expect(DataSize.from(1, "MB").total("bytes")).toBe(1_000_000);
  });

  it("from MiB", () => {
    expect(DataSize.from(1, "MiB").total("bytes")).toBe(1_048_576);
  });

  it("from GB", () => {
    expect(DataSize.from(1, "GB").total("bytes")).toBe(1_000_000_000);
  });

  it("from GiB", () => {
    expect(DataSize.from(1, "GiB").total("bytes")).toBe(1_073_741_824);
  });

  it("from TB", () => {
    expect(DataSize.from(1, "TB").total("bytes")).toBe(1_000_000_000_000);
  });

  it("from PB", () => {
    expect(DataSize.from(1, "PB").total("bytes")).toBe(1_000_000_000_000_000);
  });

  it("from bit", () => {
    expect(DataSize.from(8, "bit").total("bytes")).toBe(1);
  });
});

// ─── DataSize.from(string) ───────────────────────────────────────────────────

describe("DataSize.from(string)", () => {
  it("parses '1MB'", () => {
    expect(DataSize.from("1MB").total("bytes")).toBe(1_000_000);
  });

  it("parses '1.5GB'", () => {
    expect(DataSize.from("1.5GB").total("bytes")).toBeCloseTo(1_500_000_000, 0);
  });

  it("parses '512KiB'", () => {
    expect(DataSize.from("512KiB").total("bytes")).toBe(524_288);
  });

  it("parses '8bit'", () => {
    expect(DataSize.from("8bit").total("bytes")).toBe(1);
  });

  it("throws on invalid string", () => {
    expect(() => DataSize.from("abc")).toThrow();
  });
});

// ─── .total(unit) ────────────────────────────────────────────────────────────

describe(".total(unit)", () => {
  it("bytes to KB", () => {
    expect(DataSize.from(1_000, "bytes").total("KB")).toBe(1);
  });

  it("bytes to KiB", () => {
    expect(DataSize.from(1_024, "bytes").total("KiB")).toBe(1);
  });

  it("bytes to MB", () => {
    expect(DataSize.from(1_000_000, "bytes").total("MB")).toBe(1);
  });

  it("bytes to MiB", () => {
    expect(DataSize.from(1_048_576, "bytes").total("MiB")).toBe(1);
  });

  it("bytes to GB", () => {
    expect(DataSize.from(1_000_000_000, "bytes").total("GB")).toBe(1);
  });

  it("bytes to GiB", () => {
    expect(DataSize.from(1_073_741_824, "bytes").total("GiB")).toBe(1);
  });

  it("bytes to TB", () => {
    expect(DataSize.from(1_000_000_000_000, "bytes").total("TB")).toBe(1);
  });

  it("bytes to PB", () => {
    expect(DataSize.from(1_000_000_000_000_000, "bytes").total("PB")).toBe(1);
  });

  it("bytes to bits", () => {
    expect(DataSize.from(1, "bytes").total("bit")).toBe(8);
  });

  it("MB to KiB (cross-system conversion)", () => {
    expect(DataSize.from(1, "MB").total("KiB")).toBeCloseTo(976.5625, 4);
  });
});

// ─── .total({ unit }) ────────────────────────────────────────────────────────

describe(".total({ unit })", () => {
  it("accepts object form", () => {
    expect(DataSize.from(1, "GB").total({ unit: "MB" })).toBe(1_000);
  });

  it("string and object form return the same value", () => {
    const d = DataSize.from(5, "MB");
    expect(d.total("KiB")).toBeCloseTo(d.total({ unit: "KiB" }), 10);
  });
});

// ─── Unit aliases ─────────────────────────────────────────────────────────────

describe("unit aliases", () => {
  it("byte and bytes resolve the same", () => {
    expect(DataSize.from(1, "byte").total("bytes")).toBe(DataSize.from(1, "bytes").total("bytes"));
  });

  it("KB and kilobyte resolve the same", () => {
    expect(DataSize.from(1, "KB").total("bytes")).toBe(DataSize.from(1, "kilobyte").total("bytes"));
  });

  it("MB and megabytes resolve the same", () => {
    expect(DataSize.from(1, "MB").total("bytes")).toBe(DataSize.from(1, "megabytes").total("bytes"));
  });

  it("GiB and gibibyte resolve the same", () => {
    expect(DataSize.from(1, "GiB").total("bytes")).toBe(DataSize.from(1, "gibibyte").total("bytes"));
  });

  it("bit and bits resolve the same", () => {
    expect(DataSize.from(8, "bit").total("bytes")).toBe(DataSize.from(8, "bits").total("bytes"));
  });
});

// ─── toLocaleString ───────────────────────────────────────────────────────────

describe("toLocaleString", () => {
  it("infers megabyte for 1 000 000 bytes (en-US)", () => {
    expect(DataSize.from(1_000_000, "bytes").toLocaleString("en-US")).toBe("1 MB");
  });

  it("infers megabyte and respects maximumFractionDigits", () => {
    expect(DataSize.from(1_500_000, "bytes").toLocaleString("en-US", { maximumFractionDigits: 1 })).toBe("1.5 MB");
  });

  it("infers megabyte for 1 000 000 bytes (es-MX)", () => {
    expect(DataSize.from(1_000_000, "bytes").toLocaleString("es-MX")).toBe("1 MB");
  });

  it("infers kilobyte for 5 000 bytes", () => {
    expect(DataSize.from(5_000, "bytes").toLocaleString("en-US")).toBe("5 kB");
  });

  it("infers byte for 500 bytes", () => {
    expect(DataSize.from(500, "bytes").toLocaleString("en-US")).toBe("500 byte");
  });

  it("infers gigabyte for 2 000 000 000 bytes", () => {
    expect(DataSize.from(2_000_000_000, "bytes").toLocaleString("en-US")).toBe("2 GB");
  });

  it("infers terabyte for 3 000 000 000 000 bytes", () => {
    expect(DataSize.from(3_000_000_000_000, "bytes").toLocaleString("en-US")).toBe("3 TB");
  });

  it("infers petabyte for 4 000 000 000 000 000 bytes", () => {
    expect(DataSize.from(4_000_000_000_000_000, "bytes").toLocaleString("en-US")).toBe("4 PB");
  });

  it("returns a string", () => {
    expect(typeof DataSize.from(512, "bytes").toLocaleString()).toBe("string");
  });

  it("unit: bit", () => {
    expect(DataSize.from(1, "byte").toLocaleString("en-US", { unit: "bit" })).toBe("8 bit");
  });

  it("unit: byte", () => {
    expect(DataSize.from(1, "kilobyte").toLocaleString("en-US", { unit: "byte" })).toBe("1,000 byte");
  });

  it("unit: kilobit", () => {
    expect(DataSize.from(125, "byte").toLocaleString("en-US", { unit: "kilobit" })).toBe("1 kb");
  });

  it("unit: kilobyte", () => {
    expect(DataSize.from(1, "kilobyte").toLocaleString("en-US", { unit: "kilobyte" })).toBe("1 kB");
  });

  it("unit: megabit", () => {
    expect(DataSize.from(125_000, "byte").toLocaleString("en-US", { unit: "megabit" })).toBe("1 Mb");
  });

  it("unit: megabyte", () => {
    expect(DataSize.from(1, "megabyte").toLocaleString("en-US", { unit: "megabyte" })).toBe("1 MB");
  });

  it("unit: gigabit", () => {
    expect(DataSize.from(125_000_000, "byte").toLocaleString("en-US", { unit: "gigabit" })).toBe("1 Gb");
  });

  it("unit: gigabyte", () => {
    expect(DataSize.from(1, "gigabyte").toLocaleString("en-US", { unit: "gigabyte" })).toBe("1 GB");
  });

  it("unit: terabit", () => {
    expect(DataSize.from(125_000_000_000, "byte").toLocaleString("en-US", { unit: "terabit" })).toBe("1 Tb");
  });

  it("unit: terabyte", () => {
    expect(DataSize.from(1, "terabyte").toLocaleString("en-US", { unit: "terabyte" })).toBe("1 TB");
  });

  it("unit: petabyte", () => {
    expect(DataSize.from(1, "petabyte").toLocaleString("en-US", { unit: "petabyte" })).toBe("1 PB");
  });

  it("formats value converted to the requested unit", () => {
    expect(
      DataSize.from(5, "MB").toLocaleString("en-US", {
        unit: "megabyte",
        unitDisplay: "short",
      }),
    ).toBe("5 MB");
  });

  it("infers style: unit automatically when unit is provided", () => {
    expect(
      DataSize.from(1_000_000, "bytes").toLocaleString("en-US", {
        unit: "byte",
        unitDisplay: "long",
        notation: "compact",
        maximumFractionDigits: 2,
      }),
    ).toBe("1M bytes");
  });

});

// ─── valueOf ─────────────────────────────────────────────────────────────────

describe("valueOf", () => {
  it("returns bytes", () => {
    expect(+DataSize.from(1_000, "byte")).toBe(1_000);
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────

describe("error handling", () => {
  it("throws on unknown unit string", () => {
    expect(() => DataSize.from(1, "xyz" as any)).toThrow();
  });

  it("throws on unparseable string", () => {
    expect(() => DataSize.from("not-a-size")).toThrow();
  });
});

// ─── Type tests ───────────────────────────────────────────────────────────────

describe("types", () => {
  describe("DataSize.from argument types", () => {
    it("accepts DataSizeInput object as first argument", () => {
      expectTypeOf(DataSize.from).toBeCallableWith({ megabytes: 1, bytes: 500 });
    });

    it("accepts number + unit alias as arguments", () => {
      expectTypeOf(DataSize.from).toBeCallableWith(10, "MB");
    });

    it("first parameter accepts string", () => {
      expectTypeOf<Parameters<typeof DataSize.from>[0]>().toMatchTypeOf<string>();
    });
  });

  describe(".total argument types", () => {
    it("accepts unit alias string", () => {
      expectTypeOf(DataSize.from(1, "GB").total).toBeCallableWith("MB");
    });

    it("accepts { unit } object", () => {
      expectTypeOf(DataSize.from(1, "GB").total).toBeCallableWith({ unit: "MB" });
    });

    it("returns number", () => {
      expectTypeOf<ReturnType<DataSize["total"]>>().toEqualTypeOf<number>();
    });
  });
});
