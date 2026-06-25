/**
 * Circle circumference utility. Base unit: millimeter (mm).
 *
 * Stores circumference as millimeters and derives radius / diameter on read:
 *   C = 2πr  →  r = C / (2π),  d = C / π
 * Length conversion factors are identical to the Length lib (see length.ts for sources).
 * π is taken from Math.PI (IEEE 754 double-precision approximation, ~15 significant digits).
 *
 * @see https://en.wikipedia.org/wiki/Circumference
 * @see https://en.wikipedia.org/wiki/Pi
 * @see https://www.nist.gov/pml/special-publication-811
 * @see https://en.wikipedia.org/wiki/Conversion_of_units#Length
 */

const MM_PER_UNIT: Record<string, number> = {
  // Metric
  picometer: 1e-9,
  nanometer: 1e-6,
  micrometer: 0.001,
  millimeter: 1,
  centimeter: 10,
  decimeter: 100,
  meter: 1_000,
  decameter: 10_000,
  hectometer: 100_000,
  kilometer: 1_000_000,
  // Imperial / US
  thou: 0.0254,
  inch: 25.4,
  foot: 304.8,
  yard: 914.4,
  mile: 1_609_344,
  // Nautical
  "nautical-mile": 1_852_000,
};

export const UNIT_ALIASES: Record<string, string> = {
  // picometer
  picometer: "picometer",
  picometers: "picometer",
  pm: "picometer",
  // nanometer
  nanometer: "nanometer",
  nanometers: "nanometer",
  nm: "nanometer",
  // micrometer
  micrometer: "micrometer",
  micrometers: "micrometer",
  "µm": "micrometer",
  um: "micrometer",
  // millimeter
  millimeter: "millimeter",
  millimeters: "millimeter",
  mm: "millimeter",
  // centimeter
  centimeter: "centimeter",
  centimeters: "centimeter",
  cm: "centimeter",
  // decimeter
  decimeter: "decimeter",
  decimeters: "decimeter",
  dm: "decimeter",
  // meter
  meter: "meter",
  meters: "meter",
  m: "meter",
  // decameter
  decameter: "decameter",
  decameters: "decameter",
  dam: "decameter",
  // hectometer
  hectometer: "hectometer",
  hectometers: "hectometer",
  hm: "hectometer",
  // kilometer
  kilometer: "kilometer",
  kilometers: "kilometer",
  km: "kilometer",
  // thou
  thou: "thou",
  mil: "thou",
  th: "thou",
  // inch
  inch: "inch",
  inches: "inch",
  in: "inch",
  // foot
  foot: "foot",
  feet: "foot",
  ft: "foot",
  // yard
  yard: "yard",
  yards: "yard",
  yd: "yard",
  // mile
  mile: "mile",
  miles: "mile",
  mi: "mile",
  // nautical mile
  "nautical-mile": "nautical-mile",
  "nautical-miles": "nautical-mile",
  nauticalmile: "nautical-mile",
  nauticalmiles: "nautical-mile",
  nmi: "nautical-mile",
};

type CircumferenceUnitAlias = keyof typeof UNIT_ALIASES;

export type CircumferenceInput = Partial<Record<CircumferenceUnitAlias, number>>;

export type CircumferenceIntlUnit =
  | "millimeter"
  | "centimeter"
  | "meter"
  | "kilometer"
  | "inch"
  | "foot"
  | "yard"
  | "mile";

export type CircumferenceFormatOptions = Omit<Intl.NumberFormatOptions, "style" | "unit"> & {
  unit?: CircumferenceIntlUnit;
};

const inferUnit = (mm: number): CircumferenceIntlUnit => {
  const abs = Math.abs(mm);
  if (abs >= 1_000_000) return "kilometer";
  if (abs >= 1_000) return "meter";
  if (abs >= 10) return "centimeter";
  return "millimeter";
};

const resolveAlias = (unit: string): string => {
  const canonical = UNIT_ALIASES[unit] ?? UNIT_ALIASES[unit.toLowerCase()];
  if (!canonical) throw new Error(`Unknown circumference unit: "${unit}"`);
  return canonical;
};

const toMillimeters = (value: number, unit: string): number => {
  const canonical = resolveAlias(unit);
  const factor = MM_PER_UNIT[canonical];
  if (factor === undefined) throw new Error(`No conversion factor for: "${unit}"`);
  return value * factor;
};

const fromMillimeters = (mm: number, unit: string): number => {
  const canonical = resolveAlias(unit);
  const factor = MM_PER_UNIT[canonical];
  if (factor === undefined) throw new Error(`No conversion factor for: "${unit}"`);
  return mm / factor;
};

export class Circumference {
  readonly #mm: number;

  constructor(mm: number) {
    this.#mm = mm;
  }

  total(unit: CircumferenceUnitAlias | { unit: CircumferenceUnitAlias }): number {
    const u = typeof unit === "string" ? unit : unit.unit;
    return fromMillimeters(this.#mm, u);
  }

  radius(unit: CircumferenceUnitAlias): number {
    return fromMillimeters(this.#mm / (2 * Math.PI), unit);
  }

  diameter(unit: CircumferenceUnitAlias): number {
    return fromMillimeters(this.#mm / Math.PI, unit);
  }

  valueOf() {
    return this.#mm;
  }

  toLocaleString(locale?: Intl.LocalesArgument, options?: CircumferenceFormatOptions) {
    const unit = options?.unit ?? inferUnit(this.#mm);
    const resolved = { style: "unit" as const, ...options, unit };
    return new Intl.NumberFormat(locale as string, resolved).format(this.total(unit));
  }

  static from(input: CircumferenceInput): Circumference;
  /** @deprecated Pass an object instead: `Circumference.from({ millimeters: value })` */
  static from(value: number, unit?: CircumferenceUnitAlias): Circumference;
  static from(value: string): Circumference;
  static from(
    input: CircumferenceInput | number | string,
    unit?: CircumferenceUnitAlias,
  ): Circumference {
    if (typeof input === "string") {
      return Circumference.#parseString(input);
    }

    if (typeof input === "number") {
      return new Circumference(toMillimeters(input, unit ?? "millimeter"));
    }

    let total = 0;
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined && value !== 0) {
        total += toMillimeters(value, key);
      }
    }
    return new Circumference(total);
  }

  static fromRadius(value: number, unit: CircumferenceUnitAlias): Circumference {
    return new Circumference(2 * Math.PI * toMillimeters(value, unit));
  }

  static fromDiameter(value: number, unit: CircumferenceUnitAlias): Circumference {
    return new Circumference(Math.PI * toMillimeters(value, unit));
  }

  static #parseString(value: string): Circumference {
    const pattern = /^\s*(-?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*([a-zA-Zµ]+[0-9]*)?\s*$/;
    const match = value.match(pattern);
    if (!match) throw new Error(`Cannot parse circumference: "${value}"`);
    const num = parseFloat(match[1]);
    const u = match[2] ?? "millimeter";
    return new Circumference(toMillimeters(num, u));
  }
}
