// Imperial/US Customary Units
enum InchUnit {
  Mile = "mi",
  Yard = "yd",
  Foot = "ft",
  Inch = "in",
}

const InchUnitLong = {
  [InchUnit.Mile]: "mile",
  [InchUnit.Yard]: "yard",
  [InchUnit.Foot]: "foot",
  [InchUnit.Inch]: "inch",
} as const satisfies Record<InchUnit, string>;

type UnitString = `${InchUnit}` | `${(typeof InchUnitLong)[InchUnit]}`;

// Map InchUnit to Intl.NumberFormat unit names
const InchUnitToIntlUnit: Record<InchUnit, string> = {
  [InchUnit.Mile]: "mile",
  [InchUnit.Yard]: "yard",
  [InchUnit.Foot]: "foot",
  [InchUnit.Inch]: "inch",
};

// Order units (smallest to largest)
const InchUnitSort = [
  InchUnit.Inch,
  InchUnit.Foot,
  InchUnit.Yard,
  InchUnit.Mile,
];

type InchFormatOptions = {
  unit?: UnitString;
  unitAllow?: UnitString[];
  unitDisplay?: "long" | "short";
};

namespace InchFormatOptions {
  export namespace defaults {
    export const enUs: InchFormatOptions = {
      unitAllow: [
        InchUnit.Inch,
        InchUnit.Foot,
        InchUnit.Yard,
        InchUnit.Mile,
      ],
      unitDisplay: "short",
    };
  }

  export const defaultInchFormatOptions: InchFormatOptions = {
    unitAllow: [
      InchUnit.Inch,
      InchUnit.Foot,
      InchUnit.Yard,
      InchUnit.Mile,
    ],
    unitDisplay: "short",
  };

  export function normalize(locale: Intl.Locale, options?: InchFormatOptions) {
    if (locale.language === "en" && locale.region === "US") {
      return { ...defaults.enUs, ...options };
    }
    return { ...defaultInchFormatOptions, ...options };
  }
}

const toLocale = (local?: Intl.LocalesArgument): Intl.Locale => {
  if (!local) {
    return new Intl.Locale("en-US");
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
  return new Intl.Locale("en-US");
};

export class InchFormat {
  locale: Intl.Locale;
  options: InchFormatOptions;

  constructor(
    local: Intl.LocalesArgument = "en-US",
    options?: InchFormatOptions,
  ) {
    this.locale = toLocale(local);
    this.options = InchFormatOptions.normalize(this.locale, options);
  }

  format(value: Inch | number | string) {
    const inch = value instanceof Inch ? value : Inch.parse(value);
    const inches = inch.inch;

    // Determine which unit to use
    let unitShort: InchUnit;
    if (this.options.unit) {
      // Use the specified unit
      unitShort = this.resolveUnit(this.options.unit);
    } else {
      // Find the best unit to display
      unitShort = this.findBestUnit(inches);
    }

    const conversionFactor = UNIT_TO_INCH[unitShort];
    const numericValue = inches / conversionFactor;

    // Format using Intl.NumberFormat
    const intlUnit = InchUnitToIntlUnit[unitShort];
    const formatter = new Intl.NumberFormat(this.locale.baseName, {
      style: "unit",
      unit: intlUnit,
      unitDisplay: this.options.unitDisplay,
    });
    return formatter.format(numericValue);
  }

  private resolveUnit(unit: UnitString): InchUnit {
    // Check if it's already a short form
    if (Object.values(InchUnit).includes(unit as InchUnit)) {
      return unit as InchUnit;
    }
    // Find the short form from long form
    for (const [key, value] of Object.entries(InchUnitLong)) {
      if (value === unit) {
        return key as InchUnit;
      }
    }
    // Default to inch if not found
    return InchUnit.Inch;
  }

  private findBestUnit(inches: number): InchUnit {
    const absValue = Math.abs(inches);
    const allowedUnits = this.options.unitAllow || [];

    // Convert allowed units to InchUnit enum values
    const allowedInchUnits = allowedUnits
      .map((unit) => {
        // Check if it's already a short form
        if (Object.values(InchUnit).includes(unit as InchUnit)) {
          return unit as InchUnit;
        }
        // Find the short form from long form
        for (const [key, value] of Object.entries(InchUnitLong)) {
          if (value === unit) {
            return key as InchUnit;
          }
        }
        return null;
      })
      .filter(Boolean) as InchUnit[];

    // Sort units by size (smallest to largest)
    const sortedUnits = InchUnitSort.filter((unit) =>
      allowedInchUnits.includes(unit),
    );

    // Find the best unit (largest unit that keeps value >= 1, or smallest if all are < 1)
    let bestUnit = sortedUnits[0] || InchUnit.Inch;

    for (const unit of sortedUnits) {
      const conversionFactor = UNIT_TO_INCH[unit];
      const convertedValue = absValue / conversionFactor;

      if (convertedValue >= 1) {
        bestUnit = unit;
      }
    }

    return bestUnit;
  }
}

// Conversion map from units to inches
const UNIT_TO_INCH: Record<string, number> = {
  // Short forms
  mi: 63360, // 1 mile = 63,360 inches
  yd: 36, // 1 yard = 36 inches
  ft: 12, // 1 foot = 12 inches
  in: 1, // 1 inch = 1 inch
  // Long forms
  mile: 63360,
  yard: 36,
  foot: 12,
  inch: 1,
};

export class Inch {
  constructor(readonly inch: number) {}

  toLocaleString(local?: Intl.LocalesArgument, options?: InchFormatOptions) {
    return new InchFormat(local, options).format(this);
  }

  static parse(value: number | string): Inch {
    // Error handling: validate input
    if (value === null || value === undefined) {
      throw new Error("Invalid input: expected number or string");
    }

    // Numeric input handling
    if (typeof value === "number") {
      return new Inch(value);
    }

    // String parsing logic
    if (typeof value === "string") {
      // Regex pattern to extract value and unit (supports decimals starting with dot)
      const pattern = /^\s*(-?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*([a-z]+)?\s*$/i;
      const match = value.match(pattern);

      if (!match) {
        throw new Error(`Invalid inch format: ${value}`);
      }

      const numericValue = parseFloat(match[1]);
      const unit = match[2];

      // Check for non-numeric value
      if (isNaN(numericValue)) {
        throw new Error(`Invalid numeric value: ${match[1]}`);
      }

      // Unit resolution and conversion
      if (!unit) {
        // No unit specified, default to inches
        return new Inch(numericValue);
      }

      // Look up unit in conversion map (case-insensitive)
      const unitLower = unit.toLowerCase();
      const conversionFactor = UNIT_TO_INCH[unitLower];

      if (conversionFactor === undefined) {
        throw new Error(`Unknown unit: ${unit}`);
      }

      // Apply conversion factor
      const inchesValue = numericValue * conversionFactor;
      return new Inch(inchesValue);
    }

    throw new Error("Invalid input: expected number or string");
  }
}
