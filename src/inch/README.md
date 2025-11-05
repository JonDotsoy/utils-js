# Inch

A library for parsing, converting, and formatting Imperial/US Customary length units.

## Features

- ✅ Parse strings with units (e.g., "2.5 mi", "100 ft")
- ✅ Automatic conversion between units
- ✅ Localized formatting using `Intl.NumberFormat`
- ✅ Support for multiple languages (English, Spanish, etc.)
- ✅ Automatic pluralization based on language
- ✅ Short and long unit forms

## Installation

```bash
npm install @jondotsoy/utils-js
```

## Basic Usage

### Parsing values

```typescript
import { Inch } from "@jondotsoy/utils-js/inch";

// Parse from string with unit
const distance1 = Inch.parse("2.5 mi");
console.log(distance1.inch); // 158400

// Parse from number (assumes inches)
const distance2 = Inch.parse(12);
console.log(distance2.inch); // 12

// Different unit formats
Inch.parse("1in"); // 1 inch
Inch.parse("12 ft"); // 144 inches
Inch.parse("2.5 foot"); // 30 inches
```

### Formatting values

```typescript
import { Inch } from "@jondotsoy/utils-js/inch";

// Simple format
const result = Inch.parse("24in").toLocaleString();
console.log(result); // "2 ft"

// Long format (full names)
const result2 = Inch.parse("24in").toLocaleString(undefined, {
  unitDisplay: "long",
});
console.log(result2); // "2 feet"
```

## Supported Units

| Unit | Short Form | Long Form | Factor    |
| ---- | ---------- | --------- | --------- |
| Mile | mi         | mile      | 63,360 in |
| Yard | yd         | yard      | 36 in     |
| Foot | ft         | foot      | 12 in     |
| Inch | in         | inch      | 1 in      |

## API

### `Inch.parse(value: number | string): Inch`

Parses a value and returns an `Inch` instance.

```typescript
// From number (inches)
Inch.parse(12);

// From string with short unit
Inch.parse("5 mi");
Inch.parse("100ft");

// From string with long unit
Inch.parse("2.5 foot");
Inch.parse("10 mile");

// With decimals
Inch.parse("1.5ft");
Inch.parse(".5mi");

// Negative values
Inch.parse("-5in");
```

### `inch.toLocaleString(locale?, options?): string`

Formats the value according to the specified locale and options.

#### Parameters

- `locale` (optional): Locale to use (e.g., 'en-US', 'en-GB', 'es-ES'). Default: 'en-US'
- `options` (optional): Formatting options
  - `unitDisplay`: 'short' | 'long' - Unit format
  - `unit`: Fixed unit to use (e.g., 'mile', 'foot')
  - `unitAllow`: Array of allowed units

#### Examples

```typescript
// Default format (English US)
Inch.parse("24in").toLocaleString();
// "2 ft"

// Long format
Inch.parse("24in").toLocaleString(undefined, { unitDisplay: "long" });
// "2 feet"

// Different locales
Inch.parse("36in").toLocaleString("en", { unitDisplay: "long" });
// "1 yard"

Inch.parse("72in").toLocaleString("es-ES", { unitDisplay: "long" });
// "2 yardas"

// Fixed unit
Inch.parse("63360in").toLocaleString("en-US", {
  unit: "mile",
  unitDisplay: "long",
});
// "1 mile"

// Automatic conversion
Inch.parse("12in").toLocaleString("en", { unitDisplay: "long" });
// "1 foot"
```

### `new InchFormat(locale?, options?)`

Creates a reusable formatter.

```typescript
import { InchFormat } from "@jondotsoy/utils-js/inch";

// Create formatter
const formatter = new InchFormat("en-US", { unitDisplay: "long" });

// Use multiple times
formatter.format("1mi"); // "1 mile"
formatter.format("3 ft"); // "3 feet"
formatter.format(24); // "2 feet"
```

## Advanced Examples

### Conversion between units

```typescript
// Parse in one unit and format in another
const distance = Inch.parse("63360 in");
const result = distance.toLocaleString("en", {
  unit: "mile",
  unitDisplay: "long",
});
console.log(result); // "1 mile"
```

### Custom formatting by locale

```typescript
// English US (uses comma thousands separator)
Inch.parse("63360in").toLocaleString("en-US", { unitDisplay: "long" });
// "1 mile"

// English UK (uses comma thousands separator)
Inch.parse("63360in").toLocaleString("en-GB", { unitDisplay: "long" });
// "1 mile"

// Spanish (uses period thousands separator)
Inch.parse("63360in").toLocaleString("es-ES", { unitDisplay: "long" });
// "1 milla"
```

### Restricting allowed units

```typescript
const formatter = new InchFormat("en-US", {
  unitAllow: ["mi", "ft", "in"],
  unitDisplay: "long",
});

// Will only use miles, feet, or inches (no yards)
formatter.format("72in"); // "6 feet" (doesn't use yards)
```

## Error Handling

```typescript
// Invalid values throw errors
try {
  Inch.parse("abc");
} catch (error) {
  console.error(error); // Error: Invalid inch format
}

try {
  Inch.parse("10 xyz");
} catch (error) {
  console.error(error); // Error: Unknown unit: xyz
}

try {
  Inch.parse(null);
} catch (error) {
  console.error(error); // Error: Invalid input: expected number or string
}
```

## Notes

- All internal values are stored in inches
- Formatting uses `Intl.NumberFormat` for native localization
- Pluralization is automatic according to language rules
- Decimal separators adjust automatically to the locale
