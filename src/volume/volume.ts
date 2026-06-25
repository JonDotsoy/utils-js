// Base unit: milliliters

const ML_PER_UNIT: Record<string, number> = {
  // Metric
  milliliter: 1,
  centiliter: 10,
  deciliter: 100,
  liter: 1_000,
  "cubic-meter": 1_000_000,
  // Cubic
  "cubic-centimeter": 1,
  "cubic-inch": 16.387064,
  "cubic-foot": 28_316.846592,
  // US customary
  "us-teaspoon": 4.92892159375,
  "us-tablespoon": 14.78676478125,
  "us-fluid-ounce": 29.5735295625,
  "us-cup": 236.5882365,
  "us-pint": 473.176473,
  "us-quart": 946.352946,
  "us-gallon": 3_785.411784,
  // Imperial
  "imperial-fluid-ounce": 28.4130625,
  "imperial-pint": 568.26125,
  "imperial-quart": 1_136.5225,
  "imperial-gallon": 4_546.09,
};

const UNIT_ALIASES: Record<string, string> = {
  // milliliter
  milliliter: "milliliter",
  milliliters: "milliliter",
  ml: "milliliter",
  // centiliter
  centiliter: "centiliter",
  centiliters: "centiliter",
  cl: "centiliter",
  // deciliter
  deciliter: "deciliter",
  deciliters: "deciliter",
  dl: "deciliter",
  // liter
  liter: "liter",
  liters: "liter",
  litre: "liter",
  litres: "liter",
  l: "liter",
  // cubic meter
  "cubic-meter": "cubic-meter",
  "cubic-meters": "cubic-meter",
  cubicmeter: "cubic-meter",
  "m3": "cubic-meter",
  "m³": "cubic-meter",
  // cubic centimeter
  "cubic-centimeter": "cubic-centimeter",
  "cubic-centimeters": "cubic-centimeter",
  cubiccentimeter: "cubic-centimeter",
  cc: "cubic-centimeter",
  "cm3": "cubic-centimeter",
  "cm³": "cubic-centimeter",
  // cubic inch
  "cubic-inch": "cubic-inch",
  "cubic-inches": "cubic-inch",
  cubicinch: "cubic-inch",
  "in3": "cubic-inch",
  "in³": "cubic-inch",
  // cubic foot
  "cubic-foot": "cubic-foot",
  "cubic-feet": "cubic-foot",
  cubicfoot: "cubic-foot",
  "ft3": "cubic-foot",
  "ft³": "cubic-foot",
  // US teaspoon
  "us-teaspoon": "us-teaspoon",
  "us-teaspoons": "us-teaspoon",
  teaspoon: "us-teaspoon",
  teaspoons: "us-teaspoon",
  tsp: "us-teaspoon",
  // US tablespoon
  "us-tablespoon": "us-tablespoon",
  "us-tablespoons": "us-tablespoon",
  tablespoon: "us-tablespoon",
  tablespoons: "us-tablespoon",
  tbsp: "us-tablespoon",
  tbs: "us-tablespoon",
  // US fluid ounce
  "us-fluid-ounce": "us-fluid-ounce",
  "us-fluid-ounces": "us-fluid-ounce",
  "fluid-ounce": "us-fluid-ounce",
  "fluid-ounces": "us-fluid-ounce",
  floz: "us-fluid-ounce",
  "fl-oz": "us-fluid-ounce",
  "fl oz": "us-fluid-ounce",
  // US cup
  "us-cup": "us-cup",
  "us-cups": "us-cup",
  cup: "us-cup",
  cups: "us-cup",
  // US pint
  "us-pint": "us-pint",
  "us-pints": "us-pint",
  pt: "us-pint",
  // US quart
  "us-quart": "us-quart",
  "us-quarts": "us-quart",
  qt: "us-quart",
  // US gallon
  "us-gallon": "us-gallon",
  "us-gallons": "us-gallon",
  gal: "us-gallon",
  // Imperial fluid ounce
  "imperial-fluid-ounce": "imperial-fluid-ounce",
  "imperial-fluid-ounces": "imperial-fluid-ounce",
  "imp-fl-oz": "imperial-fluid-ounce",
  // Imperial pint
  "imperial-pint": "imperial-pint",
  "imperial-pints": "imperial-pint",
  "imp-pt": "imperial-pint",
  // Imperial quart
  "imperial-quart": "imperial-quart",
  "imperial-quarts": "imperial-quart",
  "imp-qt": "imperial-quart",
  // Imperial gallon
  "imperial-gallon": "imperial-gallon",
  "imperial-gallons": "imperial-gallon",
  "imp-gal": "imperial-gallon",
};

type VolumeUnitAlias = keyof typeof UNIT_ALIASES;

export type VolumeInput = Partial<Record<VolumeUnitAlias, number>>;

const resolveAlias = (unit: string): string => {
  const canonical = UNIT_ALIASES[unit] ?? UNIT_ALIASES[unit.toLowerCase()];
  if (!canonical) throw new Error(`Unknown volume unit: "${unit}"`);
  return canonical;
};

const toMilliliters = (value: number, unit: string): number => {
  const canonical = resolveAlias(unit);
  const factor = ML_PER_UNIT[canonical];
  if (factor === undefined) throw new Error(`No conversion factor for: "${unit}"`);
  return value * factor;
};

const fromMilliliters = (ml: number, unit: string): number => {
  const canonical = resolveAlias(unit);
  const factor = ML_PER_UNIT[canonical];
  if (factor === undefined) throw new Error(`No conversion factor for: "${unit}"`);
  return ml / factor;
};

export class Volume {
  readonly #ml: number;

  constructor(ml: number) {
    this.#ml = ml;
  }

  total(unit: VolumeUnitAlias | { unit: VolumeUnitAlias }): number {
    const u = typeof unit === "string" ? unit : unit.unit;
    return fromMilliliters(this.#ml, u);
  }

  valueOf() {
    return this.#ml;
  }

  toLocaleString(locale?: Intl.LocalesArgument, options?: Intl.NumberFormatOptions) {
    return new Intl.NumberFormat(locale as string, options).format(this.#ml);
  }

  static from(input: VolumeInput): Volume;
  static from(value: number, unit?: VolumeUnitAlias): Volume;
  static from(value: string): Volume;
  static from(
    input: VolumeInput | number | string,
    unit?: VolumeUnitAlias,
  ): Volume {
    if (typeof input === "string") {
      return Volume.#parseString(input);
    }

    if (typeof input === "number") {
      return new Volume(toMilliliters(input, unit ?? "milliliter"));
    }

    let total = 0;
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined && value !== 0) {
        total += toMilliliters(value, key);
      }
    }
    return new Volume(total);
  }

  static #parseString(value: string): Volume {
    const pattern = /^\s*(-?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*([a-zA-Z][a-zA-Z0-9³³\-\s]*)?\s*$/;
    const match = value.match(pattern);
    if (!match) throw new Error(`Cannot parse volume: "${value}"`);
    const num = parseFloat(match[1]);
    const u = match[2]?.trim() ?? "milliliter";
    return new Volume(toMilliliters(num, u));
  }
}
