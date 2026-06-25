import { describe, it, expect } from "bun:test";

import { Weight, UNIT_ALIASES as weightAliases } from "./weight/weight.js";
import { Length, UNIT_ALIASES as lengthAliases } from "./length/length.js";
import { Temperature, UNIT_ALIASES as temperatureAliases } from "./temperature/temperature.js";
import { Volume, UNIT_ALIASES as volumeAliases } from "./volume/volume.js";
import { Circumference, UNIT_ALIASES as circumferenceAliases } from "./circumference/circumference.js";
import { DataSize, UNIT_ALIASES as dataSizeAliases } from "./data-size/data-size.js";

const tryFormat = (fn: () => string): string => {
  try {
    return fn();
  } catch (e) {
    return `ERROR: ${(e as Error).message}`;
  }
};

// ─── Weight ───────────────────────────────────────────────────────────────────

describe("Weight — all unit aliases", () => {
  for (const alias of Object.keys(weightAliases)) {
    it(`from/total: "${alias}"`, () => {
      expect(() => Weight.from({ [alias]: 1 } as any).total(alias as any)).not.toThrow();
    });
  }
});

describe("Weight — toLocaleString all unit aliases", () => {
  for (const alias of Object.keys(weightAliases)) {
    it(`toLocaleString unit: "${alias}"`, () => {
      const result = tryFormat(() =>
        Weight.from({ [alias]: 1 } as any).toLocaleString("en-US", { unit: alias as any }),
      );
      expect(result).toMatchSnapshot();
    });
  }
});

// ─── Length ───────────────────────────────────────────────────────────────────

describe("Length — all unit aliases", () => {
  for (const alias of Object.keys(lengthAliases)) {
    it(`from/total: "${alias}"`, () => {
      expect(() => Length.from({ [alias]: 1 } as any).total(alias as any)).not.toThrow();
    });
  }
});

describe("Length — toLocaleString all unit aliases", () => {
  for (const alias of Object.keys(lengthAliases)) {
    it(`toLocaleString unit: "${alias}"`, () => {
      const result = tryFormat(() =>
        Length.from({ [alias]: 1 } as any).toLocaleString("en-US", { unit: alias as any }),
      );
      expect(result).toMatchSnapshot();
    });
  }
});

// ─── Temperature ─────────────────────────────────────────────────────────────

describe("Temperature — all unit aliases", () => {
  for (const alias of Object.keys(temperatureAliases)) {
    it(`from/total: "${alias}"`, () => {
      expect(() => Temperature.from({ [alias]: 300 } as any).total(alias as any)).not.toThrow();
    });
  }
});

describe("Temperature — toLocaleString all unit aliases", () => {
  for (const alias of Object.keys(temperatureAliases)) {
    it(`toLocaleString unit: "${alias}"`, () => {
      const result = tryFormat(() =>
        Temperature.from({ [alias]: 300 } as any).toLocaleString("en-US", { unit: alias as any }),
      );
      expect(result).toMatchSnapshot();
    });
  }
});

// ─── Volume ───────────────────────────────────────────────────────────────────

describe("Volume — all unit aliases", () => {
  for (const alias of Object.keys(volumeAliases)) {
    it(`from/total: "${alias}"`, () => {
      expect(() => Volume.from({ [alias]: 1 } as any).total(alias as any)).not.toThrow();
    });
  }
});

describe("Volume — toLocaleString all unit aliases", () => {
  for (const alias of Object.keys(volumeAliases)) {
    it(`toLocaleString unit: "${alias}"`, () => {
      const result = tryFormat(() =>
        Volume.from({ [alias]: 1 } as any).toLocaleString("en-US", { unit: alias as any }),
      );
      expect(result).toMatchSnapshot();
    });
  }
});

// ─── Circumference ────────────────────────────────────────────────────────────

describe("Circumference — all unit aliases", () => {
  for (const alias of Object.keys(circumferenceAliases)) {
    it(`from/total: "${alias}"`, () => {
      expect(() => Circumference.from({ [alias]: 1 } as any).total(alias as any)).not.toThrow();
    });
  }
});

describe("Circumference — toLocaleString all unit aliases", () => {
  for (const alias of Object.keys(circumferenceAliases)) {
    it(`toLocaleString unit: "${alias}"`, () => {
      const result = tryFormat(() =>
        Circumference.from({ [alias]: 1 } as any).toLocaleString("en-US", { unit: alias as any }),
      );
      expect(result).toMatchSnapshot();
    });
  }
});

// ─── DataSize ─────────────────────────────────────────────────────────────────

describe("DataSize — all unit aliases", () => {
  for (const alias of Object.keys(dataSizeAliases)) {
    it(`from/total: "${alias}"`, () => {
      expect(() => DataSize.from({ [alias]: 1 } as any).total(alias as any)).not.toThrow();
    });
  }
});

describe("DataSize — toLocaleString all unit aliases", () => {
  for (const alias of Object.keys(dataSizeAliases)) {
    it(`toLocaleString unit: "${alias}"`, () => {
      const result = tryFormat(() =>
        DataSize.from({ [alias]: 1 } as any).toLocaleString("en-US", { unit: alias as any }),
      );
      expect(result).toMatchSnapshot();
    });
  }
});
