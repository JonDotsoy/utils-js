/**
 * Data size conversion utility. Base unit: byte (B).
 *
 * SI (decimal) prefixes follow IEC 80000-13 / NIST SP 811:
 *   1 KB = 1 000 B, 1 MB = 1 000 000 B, … (powers of 10³).
 * Binary (IEC) prefixes follow IEC 60027-2:
 *   1 KiB = 1 024 B, 1 MiB = 1 048 576 B, … (powers of 2¹⁰).
 * Bit variants: 1 byte = 8 bits exactly.
 *
 * @see https://en.wikipedia.org/wiki/Byte#Multiple-byte_units
 * @see https://www.iec.ch/prefixes
 */

const BYTES_PER_UNIT: Record<string, number> = {
  // Bits
  bit: 0.125,
  kilobit: 125,
  megabit: 125_000,
  gigabit: 125_000_000,
  terabit: 125_000_000_000,
  petabit: 125_000_000_000_000,
  // SI (decimal)
  byte: 1,
  kilobyte: 1_000,
  megabyte: 1_000_000,
  gigabyte: 1_000_000_000,
  terabyte: 1_000_000_000_000,
  petabyte: 1_000_000_000_000_000,
  exabyte: 1_000_000_000_000_000_000,
  zettabyte: 1e21,
  yottabyte: 1e24,
  // Binary (IEC)
  kibibyte: 1_024,
  mebibyte: 1_048_576,
  gibibyte: 1_073_741_824,
  tebibyte: 1_099_511_627_776,
  pebibyte: 1_125_899_906_842_624,
  exbibyte: 1_152_921_504_606_846_976,
};

export const UNIT_ALIASES: Record<string, string> = {
  // bit
  bit: "bit",
  bits: "bit",
  b: "bit",
  // kilobit
  kilobit: "kilobit",
  kilobits: "kilobit",
  kbit: "kilobit",
  kb_bit: "kilobit",
  // megabit
  megabit: "megabit",
  megabits: "megabit",
  mbit: "megabit",
  mb_bit: "megabit",
  // gigabit
  gigabit: "gigabit",
  gigabits: "gigabit",
  gbit: "gigabit",
  gb_bit: "gigabit",
  // terabit
  terabit: "terabit",
  terabits: "terabit",
  tbit: "terabit",
  tb_bit: "terabit",
  // petabit
  petabit: "petabit",
  petabits: "petabit",
  pbit: "petabit",
  pb_bit: "petabit",
  // byte
  byte: "byte",
  bytes: "byte",
  B: "byte",
  // kilobyte
  kilobyte: "kilobyte",
  kilobytes: "kilobyte",
  KB: "kilobyte",
  kB: "kilobyte",
  // megabyte
  megabyte: "megabyte",
  megabytes: "megabyte",
  MB: "megabyte",
  // gigabyte
  gigabyte: "gigabyte",
  gigabytes: "gigabyte",
  GB: "gigabyte",
  // terabyte
  terabyte: "terabyte",
  terabytes: "terabyte",
  TB: "terabyte",
  // petabyte
  petabyte: "petabyte",
  petabytes: "petabyte",
  PB: "petabyte",
  // exabyte
  exabyte: "exabyte",
  exabytes: "exabyte",
  EB: "exabyte",
  // zettabyte
  zettabyte: "zettabyte",
  zettabytes: "zettabyte",
  ZB: "zettabyte",
  // yottabyte
  yottabyte: "yottabyte",
  yottabytes: "yottabyte",
  YB: "yottabyte",
  // kibibyte
  kibibyte: "kibibyte",
  kibibytes: "kibibyte",
  KiB: "kibibyte",
  // mebibyte
  mebibyte: "mebibyte",
  mebibytes: "mebibyte",
  MiB: "mebibyte",
  // gibibyte
  gibibyte: "gibibyte",
  gibibytes: "gibibyte",
  GiB: "gibibyte",
  // tebibyte
  tebibyte: "tebibyte",
  tebibytes: "tebibyte",
  TiB: "tebibyte",
  // pebibyte
  pebibyte: "pebibyte",
  pebibytes: "pebibyte",
  PiB: "pebibyte",
  // exbibyte
  exbibyte: "exbibyte",
  exbibytes: "exbibyte",
  EiB: "exbibyte",
};

type DataSizeUnitAlias = keyof typeof UNIT_ALIASES;

export type DataSizeInput = Partial<Record<DataSizeUnitAlias, number>>;

const resolveAlias = (unit: string): string => {
  const canonical = UNIT_ALIASES[unit] ?? UNIT_ALIASES[unit.toLowerCase()];
  if (!canonical) throw new Error(`Unknown data size unit: "${unit}"`);
  return canonical;
};

const toBytes = (value: number, unit: string): number => {
  const canonical = resolveAlias(unit);
  const factor = BYTES_PER_UNIT[canonical];
  if (factor === undefined) throw new Error(`No conversion factor for: "${unit}"`);
  return value * factor;
};

const fromBytes = (bytes: number, unit: string): number => {
  const canonical = resolveAlias(unit);
  const factor = BYTES_PER_UNIT[canonical];
  if (factor === undefined) throw new Error(`No conversion factor for: "${unit}"`);
  return bytes / factor;
};

export type DataSizeIntlUnit =
  | "bit"
  | "byte"
  | "kilobit"
  | "kilobyte"
  | "megabit"
  | "megabyte"
  | "gigabit"
  | "gigabyte"
  | "terabit"
  | "terabyte"
  | "petabyte";

export type DataSizeFormatOptions = Omit<Intl.NumberFormatOptions, "style" | "unit"> & {
  unit?: DataSizeIntlUnit;
};

const inferUnit = (bytes: number): DataSizeIntlUnit => {
  const abs = Math.abs(bytes);
  if (abs >= 1_000_000_000_000_000) return "petabyte";
  if (abs >= 1_000_000_000_000) return "terabyte";
  if (abs >= 1_000_000_000) return "gigabyte";
  if (abs >= 1_000_000) return "megabyte";
  if (abs >= 1_000) return "kilobyte";
  return "byte";
};

export class DataSize {
  readonly #bytes: number;

  constructor(bytes: number) {
    this.#bytes = bytes;
  }

  total(unit: DataSizeUnitAlias | { unit: DataSizeUnitAlias }): number {
    const u = typeof unit === "string" ? unit : unit.unit;
    return fromBytes(this.#bytes, u);
  }

  valueOf() {
    return this.#bytes;
  }

  toLocaleString(locale?: Intl.LocalesArgument, options?: DataSizeFormatOptions) {
    const unit = options?.unit ?? inferUnit(this.#bytes);
    const resolved = { style: "unit" as const, ...options, unit };
    return new Intl.NumberFormat(locale as string, resolved).format(this.total(unit));
  }

  static from(input: DataSizeInput): DataSize;
  /** @deprecated Pass an object instead: `DataSize.from({ bytes: value })` */
  static from(value: number, unit?: DataSizeUnitAlias): DataSize;
  static from(value: string): DataSize;
  static from(
    input: DataSizeInput | number | string,
    unit?: DataSizeUnitAlias,
  ): DataSize {
    if (typeof input === "string") {
      return DataSize.#parseString(input);
    }

    if (typeof input === "number") {
      return new DataSize(toBytes(input, unit ?? "byte"));
    }

    let total = 0;
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined && value !== 0) {
        total += toBytes(value, key);
      }
    }
    return new DataSize(total);
  }

  static #parseString(value: string): DataSize {
    const pattern = /^\s*(-?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*([a-zA-Z]+)?\s*$/;
    const match = value.match(pattern);
    if (!match) throw new Error(`Cannot parse data size: "${value}"`);
    const num = parseFloat(match[1]);
    const u = match[2] ?? "byte";
    return new DataSize(toBytes(num, u));
  }
}
