/**
 * Temperature conversion utility. Base unit: Kelvin (K).
 *
 * Kelvin is the SI base unit for thermodynamic temperature (BIPM 2019 redefinition).
 * Conversion formulas (all offsets in °C / K, ratios are exact fractions):
 *   Celsius:     K = °C + 273.15             (ITS-90, BIPM)
 *   Fahrenheit:  K = (°F + 459.67) × 5/9    (exact, derives from 1 °F = 5/9 K)
 *   Rankine:     K = °Ra × 5/9              (°Ra = 0 at absolute zero, same size as °F)
 *   Delisle:     K = 373.15 − °De × 2/3    (invented 1732, boiling point = 0 °De)
 *   Newton:      K = °N × 100/33 + 273.15  (invented 1700 by Isaac Newton)
 *   Réaumur:     K = °Ré × 5/4 + 273.15   (freezing = 0, boiling = 80 °Ré)
 *   Rømer:       K = (°Rø − 7.5) × 40/21 + 273.15  (freezing = 7.5 °Rø, boiling = 60 °Rø)
 *
 * Unlike additive units (weight, length), temperature scales cannot be combined in object form.
 *
 * @see https://www.bipm.org/en/measurement-units/kelvin
 * @see https://en.wikipedia.org/wiki/Conversion_of_units_of_temperature
 * @see https://en.wikipedia.org/wiki/Kelvin
 * @see https://en.wikipedia.org/wiki/Rankine_scale
 * @see https://en.wikipedia.org/wiki/Delisle_scale
 * @see https://en.wikipedia.org/wiki/Newton_scale
 * @see https://en.wikipedia.org/wiki/R%C3%A9aumur_scale
 * @see https://en.wikipedia.org/wiki/R%C3%B8mer_scale
 */

type Converter = {
  toKelvin: (value: number) => number;
  fromKelvin: (kelvin: number) => number;
};

const CONVERTERS: Record<string, Converter> = {
  kelvin: {
    toKelvin: (v) => v,
    fromKelvin: (k) => k,
  },
  celsius: {
    toKelvin: (v) => v + 273.15,
    fromKelvin: (k) => k - 273.15,
  },
  fahrenheit: {
    toKelvin: (v) => (v + 459.67) * (5 / 9),
    fromKelvin: (k) => k * (9 / 5) - 459.67,
  },
  rankine: {
    toKelvin: (v) => v * (5 / 9),
    fromKelvin: (k) => k * (9 / 5),
  },
  delisle: {
    toKelvin: (v) => 373.15 - v * (2 / 3),
    fromKelvin: (k) => (373.15 - k) * (3 / 2),
  },
  newton: {
    toKelvin: (v) => v * (100 / 33) + 273.15,
    fromKelvin: (k) => (k - 273.15) * (33 / 100),
  },
  reaumur: {
    toKelvin: (v) => v * (5 / 4) + 273.15,
    fromKelvin: (k) => (k - 273.15) * (4 / 5),
  },
  romer: {
    toKelvin: (v) => (v - 7.5) * (40 / 21) + 273.15,
    fromKelvin: (k) => (k - 273.15) * (21 / 40) + 7.5,
  },
};

export const UNIT_ALIASES: Record<string, string> = {
  // Kelvin
  kelvin: "kelvin",
  k: "kelvin",
  // Celsius
  celsius: "celsius",
  centigrade: "celsius",
  c: "celsius",
  "°c": "celsius",
  // Fahrenheit
  fahrenheit: "fahrenheit",
  f: "fahrenheit",
  "°f": "fahrenheit",
  // Rankine
  rankine: "rankine",
  ra: "rankine",
  r: "rankine",
  "°r": "rankine",
  "°ra": "rankine",
  // Delisle
  delisle: "delisle",
  de: "delisle",
  "°de": "delisle",
  // Newton
  newton: "newton",
  n: "newton",
  "°n": "newton",
  // Réaumur
  reaumur: "reaumur",
  re: "reaumur",
  "°re": "reaumur",
  // Rømer
  romer: "romer",
  ro: "romer",
  "°ro": "romer",
};

type TemperatureUnitAlias = keyof typeof UNIT_ALIASES;

export type TemperatureInput = Partial<Record<TemperatureUnitAlias, number>>;

export type TemperatureIntlUnit = "celsius" | "fahrenheit";

export type TemperatureFormatOptions = Omit<Intl.NumberFormatOptions, "style" | "unit"> & {
  unit?: TemperatureIntlUnit;
};

const inferUnit = (_kelvin: number): TemperatureIntlUnit => "celsius";

const resolveAlias = (unit: string): string => {
  const canonical = UNIT_ALIASES[unit.toLowerCase()];
  if (!canonical) throw new Error(`Unknown temperature unit: "${unit}"`);
  return canonical;
};

const toKelvin = (value: number, unit: string): number => {
  const canonical = resolveAlias(unit);
  const converter = CONVERTERS[canonical];
  if (!converter) throw new Error(`No converter for: "${unit}"`);
  return converter.toKelvin(value);
};

const fromKelvin = (kelvin: number, unit: string): number => {
  const canonical = resolveAlias(unit);
  const converter = CONVERTERS[canonical];
  if (!converter) throw new Error(`No converter for: "${unit}"`);
  return converter.fromKelvin(kelvin);
};

export class Temperature {
  readonly #kelvin: number;

  constructor(kelvin: number) {
    this.#kelvin = kelvin;
  }

  total(unit: TemperatureUnitAlias | { unit: TemperatureUnitAlias }): number {
    const u = typeof unit === "string" ? unit : unit.unit;
    return fromKelvin(this.#kelvin, u);
  }

  valueOf() {
    return this.#kelvin;
  }

  toLocaleString(locale?: Intl.LocalesArgument, options?: TemperatureFormatOptions) {
    const unit = options?.unit ?? inferUnit(this.#kelvin);
    const resolved = { style: "unit" as const, ...options, unit };
    return new Intl.NumberFormat(locale as string, resolved).format(this.total(unit));
  }

  static from(input: TemperatureInput): Temperature;
  /** @deprecated Pass an object instead: `Temperature.from({ celsius: value })` */
  static from(value: number, unit: TemperatureUnitAlias): Temperature;
  static from(value: string): Temperature;
  static from(
    input: TemperatureInput | number | string,
    unit?: TemperatureUnitAlias,
  ): Temperature {
    if (typeof input === "string") {
      return Temperature.#parseString(input);
    }

    if (typeof input === "number") {
      return new Temperature(toKelvin(input, unit ?? "kelvin"));
    }

    const entries = Object.entries(input).filter(([, v]) => v !== undefined);
    if (entries.length === 0) throw new Error("Temperature.from: no unit provided");
    if (entries.length > 1) throw new Error("Temperature.from: only one unit is allowed");
    const [key, value] = entries[0];
    return new Temperature(toKelvin(value as number, key));
  }

  static #parseString(value: string): Temperature {
    const pattern = /^\s*(-?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*(°?[a-zA-Z]+)?\s*$/;
    const match = value.match(pattern);
    if (!match) throw new Error(`Cannot parse temperature: "${value}"`);
    const num = parseFloat(match[1]);
    const u = match[2] ?? "kelvin";
    return new Temperature(toKelvin(num, u));
  }
}
