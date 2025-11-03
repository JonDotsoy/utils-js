// SI
enum MeterUnit {
  Kilometer = "km",
  Hectometer = "hm",
  Decameter = "dam",
  Meter = "m",
  Decimeter = "dm",
  Centimeter = "cm",
  Millimeter = "mm",
  Micrometer = "µm",
  Nanometer = "nm",
  Picometer = "pm",
}

const MeterUnitLong = {
  [MeterUnit.Kilometer]: "kilometer",
  [MeterUnit.Hectometer]: "hectometer",
  [MeterUnit.Decameter]: "decameter",
  [MeterUnit.Meter]: "meter",
  [MeterUnit.Decimeter]: "decimeter",
  [MeterUnit.Centimeter]: "centimeter",
  [MeterUnit.Millimeter]: "millimeter",
  [MeterUnit.Micrometer]: "micrometer",
  [MeterUnit.Nanometer]: "nanometer",
  [MeterUnit.Picometer]: "picometer",
} as const satisfies Record<MeterUnit, string>;

type UnitString = `${MeterUnit}` | `${(typeof MeterUnitLong)[MeterUnit]}`;

// Map MeterUnit to Intl.NumberFormat unit names
const MeterUnitToIntlUnit: Record<MeterUnit, string> = {
  [MeterUnit.Kilometer]: "kilometer",
  [MeterUnit.Hectometer]: "hectometer",
  [MeterUnit.Decameter]: "decameter",
  [MeterUnit.Meter]: "meter",
  [MeterUnit.Decimeter]: "decimeter",
  [MeterUnit.Centimeter]: "centimeter",
  [MeterUnit.Millimeter]: "millimeter",
  [MeterUnit.Micrometer]: "micrometer",
  [MeterUnit.Nanometer]: "nanometer",
  [MeterUnit.Picometer]: "picometer",
};

// Order units
const MeterUnitSort = [
  MeterUnit.Picometer,
  MeterUnit.Nanometer,
  MeterUnit.Micrometer,
  MeterUnit.Millimeter,
  MeterUnit.Centimeter,
  MeterUnit.Decimeter,
  MeterUnit.Meter,
  MeterUnit.Decameter,
  MeterUnit.Hectometer,
  MeterUnit.Kilometer,
];

type MeterFormatOptions = {
  unit?: UnitString;
  unitAllow?: UnitString[];
  unitDisplay?: "long" | "short";
};

namespace MeterFormatOptions {
  export namespace defaults {
    export const esCl: MeterFormatOptions = {
      unitAllow: [
        MeterUnit.Picometer,
        MeterUnit.Nanometer,
        MeterUnit.Micrometer,
        MeterUnit.Millimeter,
        MeterUnit.Centimeter,
        MeterUnit.Meter,
        MeterUnit.Kilometer,
      ],
      unitDisplay: "short",
    };
  }

  export const defaultMeterFormatOptions: MeterFormatOptions = {
    unitAllow: [
      MeterUnit.Picometer,
      MeterUnit.Nanometer,
      MeterUnit.Micrometer,
      MeterUnit.Millimeter,
      MeterUnit.Centimeter,
      MeterUnit.Decimeter,
      MeterUnit.Meter,
      MeterUnit.Decameter,
      MeterUnit.Hectometer,
      MeterUnit.Kilometer,
    ],
    unitDisplay: "short",
  };

  export function normalize(locale: Intl.Locale, options?: MeterFormatOptions) {
    if (locale.language === "es" && locale.region === "CL") {
      return { ...defaults.esCl, ...options };
    }
    return { ...defaultMeterFormatOptions, ...options };
  }
}

const toLocale = (local?: Intl.LocalesArgument): Intl.Locale => {
  if (!local) {
    return new Intl.Locale("es-CL");
  }
  if (local instanceof Intl.Locale) {
    return local;
  }
  if (typeof local === "string") {
    return new Intl.Locale(local);
  }
  if (Array.isArray(local) && local.length > 0) {
    return new Intl.Locale(local[0]);
  }
  return new Intl.Locale("es-CL");
};

export class MeterFormat {
  locale: Intl.Locale;
  options: MeterFormatOptions;

  constructor(
    local: Intl.LocalesArgument = "es-CL",
    options?: MeterFormatOptions,
  ) {
    this.locale = toLocale(local);
    this.options = MeterFormatOptions.normalize(this.locale, options);
  }

  format(value: Meter | number | string) {
    const meter = value instanceof Meter ? value : Meter.parse(value);
    const millimeters = meter.millimeter;

    // Determine which unit to use
    let unitShort: MeterUnit;
    if (this.options.unit) {
      // Use the specified unit
      unitShort = this.resolveUnit(this.options.unit);
    } else {
      // Find the best unit to display
      unitShort = this.findBestUnit(millimeters);
    }

    const conversionFactor = UNIT_TO_MILLIMETER[unitShort];
    const numericValue = millimeters / conversionFactor;

    // Format using Intl.NumberFormat
    const intlUnit = MeterUnitToIntlUnit[unitShort];
    const formatter = new Intl.NumberFormat(this.locale.baseName, {
      style: "unit",
      unit: intlUnit,
      unitDisplay: this.options.unitDisplay,
    });
    return formatter.format(numericValue);
  }

  private resolveUnit(unit: UnitString): MeterUnit {
    // Check if it's already a short form
    if (Object.values(MeterUnit).includes(unit as MeterUnit)) {
      return unit as MeterUnit;
    }
    // Find the short form from long form
    for (const [key, value] of Object.entries(MeterUnitLong)) {
      if (value === unit) {
        return key as MeterUnit;
      }
    }
    // Default to meter if not found
    return MeterUnit.Meter;
  }

  private findBestUnit(millimeters: number): MeterUnit {
    const absValue = Math.abs(millimeters);
    const allowedUnits = this.options.unitAllow || [];

    // Convert allowed units to MeterUnit enum values
    const allowedMeterUnits = allowedUnits
      .map((unit) => {
        // Check if it's already a short form
        if (Object.values(MeterUnit).includes(unit as MeterUnit)) {
          return unit as MeterUnit;
        }
        // Find the short form from long form
        for (const [key, value] of Object.entries(MeterUnitLong)) {
          if (value === unit) {
            return key as MeterUnit;
          }
        }
        return null;
      })
      .filter(Boolean) as MeterUnit[];

    // Sort units by size (smallest to largest)
    const sortedUnits = MeterUnitSort.filter((unit) =>
      allowedMeterUnits.includes(unit),
    );

    // Find the best unit (largest unit that keeps value >= 1, or smallest if all are < 1)
    let bestUnit = sortedUnits[0] || MeterUnit.Millimeter;

    for (const unit of sortedUnits) {
      const conversionFactor = UNIT_TO_MILLIMETER[unit];
      const convertedValue = absValue / conversionFactor;

      if (convertedValue >= 1) {
        bestUnit = unit;
      }
    }

    return bestUnit;
  }
}

// Conversion map from units to millimeters
const UNIT_TO_MILLIMETER: Record<string, number> = {
  // Short forms
  km: 1_000_000,
  hm: 100_000,
  dam: 10_000,
  m: 1_000,
  dm: 100,
  cm: 10,
  mm: 1,
  µm: 0.001,
  nm: 0.000001,
  pm: 0.000000001,
  // Long forms
  kilometer: 1_000_000,
  hectometer: 100_000,
  decameter: 10_000,
  meter: 1_000,
  decimeter: 100,
  centimeter: 10,
  millimeter: 1,
  micrometer: 0.001,
  nanometer: 0.000001,
  picometer: 0.000000001,
};

export class Meter {
  constructor(readonly millimeter: number) {}

  toLocaleString(local?: Intl.LocalesArgument, options?: MeterFormatOptions) {
    return new MeterFormat(local, options).format(this);
  }

  static parse(value: number | string): Meter {
    // Error handling: validate input
    if (value === null || value === undefined) {
      throw new Error("Invalid input: expected number or string");
    }

    // Numeric input handling
    if (typeof value === "number") {
      return new Meter(value);
    }

    // String parsing logic
    if (typeof value === "string") {
      // Regex pattern to extract value and unit (supports decimals starting with dot)
      const pattern = /^\s*(-?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*([a-zµ]+)?\s*$/i;
      const match = value.match(pattern);

      if (!match) {
        throw new Error(`Invalid meter format: ${value}`);
      }

      const numericValue = parseFloat(match[1]);
      const unit = match[2];

      // Check for non-numeric value
      if (isNaN(numericValue)) {
        throw new Error(`Invalid numeric value: ${match[1]}`);
      }

      // Unit resolution and conversion
      if (!unit) {
        // No unit specified, default to millimeters
        return new Meter(numericValue);
      }

      // Look up unit in conversion map (case-insensitive)
      const unitLower = unit.toLowerCase();
      const conversionFactor = UNIT_TO_MILLIMETER[unitLower];

      if (conversionFactor === undefined) {
        throw new Error(`Unknown unit: ${unit}`);
      }

      // Apply conversion factor
      const millimeters = numericValue * conversionFactor;
      return new Meter(millimeters);
    }

    throw new Error("Invalid input: expected number or string");
  }
}
