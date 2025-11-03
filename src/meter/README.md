# Meter

A library for parsing, converting, and formatting International System (SI) length units.

## Features

- ✅ Parse strings with units (e.g., "2.5 km", "100 cm")
- ✅ Automatic conversion between units
- ✅ Localized formatting using `Intl.NumberFormat`
- ✅ Support for multiple languages (Spanish, English, Japanese, etc.)
- ✅ Automatic pluralization based on language
- ✅ Short and long unit forms

## Installation

```bash
npm install @jondotsoy/utils-js
```

## Basic Usage

### Parsing values

```typescript
import { Meter } from "@jondotsoy/utils-js/meter";

// Parse from string with unit
const distance1 = Meter.parse("2.5 km");
console.log(distance1.millimeter); // 2500000

// Parse from number (assumes millimeters)
const distance2 = Meter.parse(1000);
console.log(distance2.millimeter); // 1000

// Different unit formats
Meter.parse("1cm"); // 10 mm
Meter.parse("12 km"); // 12000000 mm
Meter.parse("2.5 meter"); // 2500 mm
```

### Formatting values

```typescript
import { Meter } from "@jondotsoy/utils-js/meter";

// Simple format
const result = Meter.parse("2m").toLocaleString();
console.log(result); // "2 m"

// Long format (full names)
const result2 = Meter.parse("2m").toLocaleString(undefined, {
  unitDisplay: "long",
});
console.log(result2); // "2 meters"
```

## Supported Units

| Unit       | Short Form | Long Form  | Factor         |
| ---------- | ---------- | ---------- | -------------- |
| Kilometer  | km         | kilometer  | 1,000,000 mm   |
| Hectometer | hm         | hectometer | 100,000 mm     |
| Decameter  | dam        | decameter  | 10,000 mm      |
| Meter      | m          | meter      | 1,000 mm       |
| Decimeter  | dm         | decimeter  | 100 mm         |
| Centimeter | cm         | centimeter | 10 mm          |
| Millimeter | mm         | millimeter | 1 mm           |
| Micrometer | µm         | micrometer | 0.001 mm       |
| Nanometer  | nm         | nanometer  | 0.000001 mm    |
| Picometer  | pm         | picometer  | 0.000000001 mm |

## API

### `Meter.parse(value: number | string): Meter`

Parses a value and returns a `Meter` instance.

```typescript
// From number (millimeters)
Meter.parse(1000);

// From string with short unit
Meter.parse("5 km");
Meter.parse("100cm");

// From string with long unit
Meter.parse("2.5 meter");
Meter.parse("10 kilometer");

// With decimals
Meter.parse("1.5m");
Meter.parse(".5km");

// Negative values
Meter.parse("-5cm");
```

### `meter.toLocaleString(locale?, options?): string`

Formats the value according to the specified locale and options.

#### Parameters

- `locale` (optional): Locale to use (e.g., 'es-CL', 'en', 'ja-JP'). Default: 'es-CL'
- `options` (optional): Formatting options
  - `unitDisplay`: 'short' | 'long' - Unit format
  - `unit`: Fixed unit to use (e.g., 'kilometer', 'meter')
  - `unitAllow`: Array of allowed units

#### Examples

```typescript
// Default format (Spanish Chile)
Meter.parse("2m").toLocaleString();
// "2 m"

// Long format
Meter.parse("2m").toLocaleString(undefined, { unitDisplay: "long" });
// "2 meters"

// Different locales
Meter.parse("2500mm").toLocaleString("en", { unitDisplay: "long" });
// "2.5 meters"

Meter.parse("5000mm").toLocaleString("ja-JP", { unitDisplay: "long" });
// "5メートル"

// Fixed unit
Meter.parse("2500m").toLocaleString("es-CL", {
  unit: "kilometer",
  unitDisplay: "long",
});
// "2.5 kilometers"

// Automatic conversion
Meter.parse("50mm").toLocaleString("en", { unitDisplay: "long" });
// "5 centimeters"
```

### `new MeterFormat(locale?, options?)`

Creates a reusable formatter.

```typescript
import { MeterFormat } from "@jondotsoy/utils-js/meter";

// Create formatter
const formatter = new MeterFormat("es-CL", { unitDisplay: "long" });

// Use multiple times
formatter.format("1km"); // "1 kilometer"
formatter.format("3 cm"); // "3 centimeters"
formatter.format(2500); // "2.5 meters"
```

## Advanced Examples

### Conversion between units

```typescript
// Parse in one unit and format in another
const distance = Meter.parse("2500 m");
const result = distance.toLocaleString("en", {
  unit: "kilometer",
  unitDisplay: "long",
});
console.log(result); // "2.5 kilometers"
```

### Custom formatting by locale

```typescript
// Spanish (uses comma decimal)
Meter.parse("2500mm").toLocaleString("es-CL", { unitDisplay: "long" });
// "2.5 meters"

// English (uses period decimal)
Meter.parse("2500mm").toLocaleString("en-US", { unitDisplay: "long" });
// "2.5 meters"

// Japanese (no space between number and unit)
Meter.parse("2500mm").toLocaleString("ja-JP", { unitDisplay: "long" });
// "2.5メートル"
```

### Restricting allowed units

```typescript
const formatter = new MeterFormat("es-CL", {
  unitAllow: ["km", "m", "cm"],
  unitDisplay: "long",
});

// Will only use kilometers, meters, or centimeters
formatter.format("5000mm"); // "5 meters" (doesn't use millimeters)
```

## Error Handling

```typescript
// Invalid values throw errors
try {
  Meter.parse("abc");
} catch (error) {
  console.error(error); // Error: Invalid meter format
}

try {
  Meter.parse("10 xyz");
} catch (error) {
  console.error(error); // Error: Unknown unit: xyz
}

try {
  Meter.parse(null);
} catch (error) {
  console.error(error); // Error: Invalid input: expected number or string
}
```

## Notes

- All internal values are stored in millimeters
- Formatting uses `Intl.NumberFormat` for native localization
- Pluralization is automatic according to language rules
- Decimal separators adjust automatically to the locale
