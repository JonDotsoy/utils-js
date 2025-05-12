import {
  BytesFormat,
  type BytesFormatOptions,
} from "../bytes-format/bytes-format.js";

const byte = 2 ** 0;
const kilobyte = 2 ** 10;
const megabyte = 2 ** 20;
const gigabyte = 2 ** 30;
const terabyte = 2 ** 40;
const petabyte = 2 ** 50;

export type BytesUnitType =
  | "byte"
  | "kilobyte"
  | "megabyte"
  | "gigabyte"
  | "terabyte"
  | "petabyte";

const bytesByUnit: Record<string, number> = {
  byte: byte,
  kilobyte: kilobyte,
  megabyte: megabyte,
  gigabyte: gigabyte,
  terabyte: terabyte,
  petabyte: petabyte,
};

const AliasBytesUnit: Record<string, BytesUnitType> = {
  byte: "byte",
  kilobyte: "kilobyte",
  megabyte: "megabyte",
  gigabyte: "gigabyte",
  terabyte: "terabyte",
  petabyte: "petabyte",
  bytes: "byte",
  kilobytes: "kilobyte",
  megabytes: "megabyte",
  gigabytes: "gigabyte",
  terabytes: "terabyte",
  petabytes: "petabyte",
  b: "byte",
  kb: "kilobyte",
  mb: "megabyte",
  gb: "gigabyte",
  tb: "terabyte",
  pb: "petabyte",
};

const parseUnit = (unit: string): BytesUnitType => {
  const unitType = AliasBytesUnit[unit.toLowerCase()];
  if (!unitType) {
    throw new Error(`Invalid unit type: ${unit}`);
  }
  return unitType;
};

const unitToBytes = (unit: keyof typeof AliasBytesUnit): number => {
  const unitType = parseUnit(unit);
  return bytesByUnit[unitType];
};

export class Bytes {
  #bytes: number;

  constructor(bytes: number) {
    this.#bytes = bytes;
  }

  toBytes() {
    return this.#bytes;
  }
  toKilobytes() {
    return this.#bytes / Bytes.kilobyte;
  }
  toMegabytes() {
    return this.#bytes / Bytes.megabyte;
  }
  toGigabytes() {
    return this.#bytes / Bytes.gigabyte;
  }
  toTerabytes() {
    return this.#bytes / Bytes.terabyte;
  }
  toPetabytes() {
    return this.#bytes / Bytes.petabyte;
  }
  valueOf() {
    return this.#bytes;
  }

  toLocaleString(locale?: string, optionsInit?: BytesFormatOptions) {
    return new BytesFormat(locale).format(this.#bytes);
  }

  static from(
    value: number | string,
    unit?: keyof typeof AliasBytesUnit,
  ): Bytes {
    if (typeof value === "string") {
      const pattern = /(?<value>\d+(\.\d+)?)\s*(?<unit>[a-zA-Z]+)?/;
      const match = pattern.exec(value.toLowerCase().trim());
      if (!match) {
        throw new Error("Invalid byte format");
      }
      return new Bytes(
        Number(match.groups!.value) * unitToBytes(match.groups!.unit ?? "byte"),
      );
    }
    return new Bytes(value * unitToBytes(unit ?? "byte"));
  }

  static byte = byte;
  static kilobyte = kilobyte;
  static megabyte = megabyte;
  static gigabyte = gigabyte;
  static terabyte = terabyte;
  static petabyte = petabyte;
}
