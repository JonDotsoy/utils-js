/**
 * Length / distance conversion utility. Base unit: millimeter (mm).
 *
 * Metric factors follow SI prefix definitions (BIPM): 1 m = 1000 mm, 1 km = 1 000 000 mm, etc.
 * Imperial / US customary factors derive from the international inch agreement of 1959,
 * which set 1 in = 25.4 mm exactly, making all derived values exact:
 *   1 thou (mil) = 0.0254 mm, 1 ft = 304.8 mm, 1 yd = 914.4 mm, 1 mi = 1 609 344 mm.
 * Nautical mile: 1 nmi = 1852 m = 1 852 000 mm (exact, defined by BIPM 1929, adopted internationally 1954).
 *
 * @see https://www.nist.gov/pml/special-publication-811
 * @see https://en.wikipedia.org/wiki/Conversion_of_units#Length
 * @see https://en.wikipedia.org/wiki/International_yard_and_pound
 * @see https://en.wikipedia.org/wiki/Nautical_mile
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

const UNIT_ALIASES: Record<string, string> = {
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
  nm2: "nautical-mile",
};

type LengthUnitAlias = keyof typeof UNIT_ALIASES;

export type LengthInput = Partial<Record<LengthUnitAlias, number>>;

const resolveAlias = (unit: string): string => {
  const canonical = UNIT_ALIASES[unit] ?? UNIT_ALIASES[unit.toLowerCase()];
  if (!canonical) throw new Error(`Unknown length unit: "${unit}"`);
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

export class Length {
  readonly #mm: number;

  constructor(mm: number) {
    this.#mm = mm;
  }

  total(unit: LengthUnitAlias | { unit: LengthUnitAlias }): number {
    const u = typeof unit === "string" ? unit : unit.unit;
    return fromMillimeters(this.#mm, u);
  }

  valueOf() {
    return this.#mm;
  }

  toLocaleString(locale?: Intl.LocalesArgument, options?: Intl.NumberFormatOptions) {
    return new Intl.NumberFormat(locale as string, options).format(this.#mm);
  }

  static from(input: LengthInput): Length;
  static from(value: number, unit?: LengthUnitAlias): Length;
  static from(value: string): Length;
  static from(
    input: LengthInput | number | string,
    unit?: LengthUnitAlias,
  ): Length {
    if (typeof input === "string") {
      return Length.#parseString(input);
    }

    if (typeof input === "number") {
      return new Length(toMillimeters(input, unit ?? "millimeter"));
    }

    let total = 0;
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined && value !== 0) {
        total += toMillimeters(value, key);
      }
    }
    return new Length(total);
  }

  static #parseString(value: string): Length {
    const pattern = /^\s*(-?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*([a-zA-Zµ]+[0-9]*)?\s*$/;
    const match = value.match(pattern);
    if (!match) throw new Error(`Cannot parse length: "${value}"`);
    const num = parseFloat(match[1]);
    const u = match[2] ?? "millimeter";
    return new Length(toMillimeters(num, u));
  }
}
