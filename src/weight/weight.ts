/**
 * Weight / mass conversion utility. Base unit: gram (g).
 *
 * Metric factors follow SI prefix definitions (BIPM).
 * Imperial / avoirdupois factors are based on the international pound agreement of 1959,
 * which set 1 lb = 453.59237 g exactly, making all derived factors exact:
 *   1 grain = 64.79891 mg, 1 oz = 28.349523125 g, 1 stone = 6350.29318 g,
 *   1 short ton = 907184.74 g, 1 long ton = 1016046.9088 g.
 * Troy weight: 1 troy ounce = 31.1034768 g exactly (12 troy oz = 1 troy lb).
 * Carat: 1 ct = 0.2 g exactly (metric carat, adopted 1907).
 *
 * @see https://www.nist.gov/pml/special-publication-811
 * @see https://en.wikipedia.org/wiki/Conversion_of_units#Mass
 * @see https://en.wikipedia.org/wiki/Avoirdupois_system
 * @see https://en.wikipedia.org/wiki/Troy_weight
 * @see https://en.wikipedia.org/wiki/Carat_(mass)
 */

// Conversion factors: how many grams per unit
const GRAMS_PER_UNIT: Record<string, number> = {
  // Metric
  microgram: 0.000001,
  milligram: 0.001,
  gram: 1,
  kilogram: 1_000,
  tonne: 1_000_000,
  "metric-ton": 1_000_000,
  // Imperial / US
  grain: 0.06479891,
  dram: 1.7718451953125,
  ounce: 28.349523125,
  pound: 453.59237,
  stone: 6_350.29318,
  "short-ton": 907_184.74,
  "long-ton": 1_016_046.9088,
  // Troy
  "troy-grain": 0.06479891,
  "troy-ounce": 31.1034768,
  "troy-pound": 373.2417216,
  // Carat
  carat: 0.2,
};

// All accepted aliases → canonical key in GRAMS_PER_UNIT
const UNIT_ALIASES: Record<string, string> = {
  // microgram
  microgram: "microgram",
  micrograms: "microgram",
  "µg": "microgram",
  mcg: "microgram",
  // milligram
  milligram: "milligram",
  milligrams: "milligram",
  mg: "milligram",
  // gram
  gram: "gram",
  grams: "gram",
  g: "gram",
  // kilogram
  kilogram: "kilogram",
  kilograms: "kilogram",
  kg: "kilogram",
  // tonne / metric ton
  tonne: "tonne",
  tonnes: "tonne",
  t: "tonne",
  "metric-ton": "tonne",
  "metric-tons": "tonne",
  metricton: "tonne",
  metrictons: "tonne",
  // grain
  grain: "grain",
  grains: "grain",
  gr: "grain",
  // dram
  dram: "dram",
  drams: "dram",
  dr: "dram",
  // ounce
  ounce: "ounce",
  ounces: "ounce",
  oz: "ounce",
  // pound
  pound: "pound",
  pounds: "pound",
  lb: "pound",
  lbs: "pound",
  // stone
  stone: "stone",
  stones: "stone",
  st: "stone",
  // short ton (US ton)
  "short-ton": "short-ton",
  "short-tons": "short-ton",
  shortton: "short-ton",
  shorttons: "short-ton",
  ton: "short-ton",
  tons: "short-ton",
  // long ton (UK ton)
  "long-ton": "long-ton",
  "long-tons": "long-ton",
  longton: "long-ton",
  longtons: "long-ton",
  // troy ounce
  "troy-ounce": "troy-ounce",
  "troy-ounces": "troy-ounce",
  troyounce: "troy-ounce",
  troyounces: "troy-ounce",
  ozt: "troy-ounce",
  // troy pound
  "troy-pound": "troy-pound",
  "troy-pounds": "troy-pound",
  troypound: "troy-pound",
  troypounds: "troy-pound",
  lbt: "troy-pound",
  // carat
  carat: "carat",
  carats: "carat",
  ct: "carat",
  CD: "carat",
};

type WeightUnitAlias = keyof typeof UNIT_ALIASES;

export type WeightInput = Partial<Record<WeightUnitAlias, number>>;

const resolveAlias = (unit: string): string => {
  const canonical = UNIT_ALIASES[unit.toLowerCase()] ?? UNIT_ALIASES[unit];
  if (!canonical) throw new Error(`Unknown weight unit: "${unit}"`);
  return canonical;
};

const toGrams = (value: number, unit: string): number => {
  const canonical = resolveAlias(unit);
  const factor = GRAMS_PER_UNIT[canonical];
  if (factor === undefined) throw new Error(`No conversion factor for: "${unit}"`);
  return value * factor;
};

const fromGrams = (grams: number, unit: string): number => {
  const canonical = resolveAlias(unit);
  const factor = GRAMS_PER_UNIT[canonical];
  if (factor === undefined) throw new Error(`No conversion factor for: "${unit}"`);
  return grams / factor;
};

export class Weight {
  readonly #grams: number;

  constructor(grams: number) {
    this.#grams = grams;
  }

  /** Total value expressed in the requested unit */
  total(unit: WeightUnitAlias | { unit: WeightUnitAlias }): number {
    const u = typeof unit === "string" ? unit : unit.unit;
    return fromGrams(this.#grams, u);
  }

  /** Raw grams value */
  valueOf() {
    return this.#grams;
  }

  toLocaleString(locale?: Intl.LocalesArgument, options?: Intl.NumberFormatOptions) {
    return new Intl.NumberFormat(locale as string, options).format(this.#grams);
  }

  /**
   * Build a Weight from an object whose keys are unit names.
   * E.g. Weight.from({ kilograms: 12, grams: 345 })
   *      Weight.from(500, "gram")
   *      Weight.from("12.345 kg")
   */
  static from(input: WeightInput): Weight;
  static from(value: number, unit?: WeightUnitAlias): Weight;
  static from(value: string): Weight;
  static from(
    input: WeightInput | number | string,
    unit?: WeightUnitAlias,
  ): Weight {
    if (typeof input === "string") {
      return Weight.#parseString(input);
    }

    if (typeof input === "number") {
      return new Weight(toGrams(input, unit ?? "gram"));
    }

    // object form
    let total = 0;
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined && value !== 0) {
        total += toGrams(value, key);
      }
    }
    return new Weight(total);
  }

  static #parseString(value: string): Weight {
    const pattern = /^\s*(-?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*([a-zA-Zµ-]+)?\s*$/;
    const match = value.match(pattern);
    if (!match) throw new Error(`Cannot parse weight: "${value}"`);
    const num = parseFloat(match[1]);
    const u = match[2] ?? "gram";
    return new Weight(toGrams(num, u));
  }
}
