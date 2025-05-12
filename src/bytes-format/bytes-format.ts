import { Bytes, type BytesUnitType } from "../bytes/bytes.js";
import type { BytesFormatOptions } from "./dtos/bytes-format-options.js";
export type { BytesFormatOptions } from "./dtos/bytes-format-options.js";

export class BytesFormat {
  #byteFormatter: Intl.NumberFormat;
  #kilobyteFormatter: Intl.NumberFormat;
  #megabyteFormatter: Intl.NumberFormat;
  #gigabyteFormatter: Intl.NumberFormat;
  #petabyteFormatter: Intl.NumberFormat;
  #terabyteFormatter: Intl.NumberFormat;
  #unit: BytesUnitType | "auto";

  constructor(
    locale: string | undefined = undefined,
    { unit, ...optionsInit }: BytesFormatOptions | undefined = {},
  ) {
    const options: BytesFormatOptions = {
      ...optionsInit,
      maximumFractionDigits: optionsInit?.maximumFractionDigits ?? 2,
    };

    this.#unit = unit ?? "auto";

    this.#byteFormatter = new Intl.NumberFormat(locale, {
      style: "unit",
      unit: "byte",
      unitDisplay: options?.unitDisplay,
      maximumFractionDigits: options?.maximumFractionDigits,
      maximumSignificantDigits: options?.maximumSignificantDigits,
    });

    this.#kilobyteFormatter = new Intl.NumberFormat(locale, {
      style: "unit",
      unit: "kilobyte",
      unitDisplay: options?.unitDisplay,
      maximumFractionDigits: options?.maximumFractionDigits,
      maximumSignificantDigits: options?.maximumSignificantDigits,
    });

    this.#megabyteFormatter = new Intl.NumberFormat(locale, {
      style: "unit",
      unit: "megabyte",
      unitDisplay: options?.unitDisplay,
      maximumFractionDigits: options?.maximumFractionDigits,
      maximumSignificantDigits: options?.maximumSignificantDigits,
    });

    this.#gigabyteFormatter = new Intl.NumberFormat(locale, {
      style: "unit",
      unit: "gigabyte",
      unitDisplay: options?.unitDisplay,
      maximumFractionDigits: options?.maximumFractionDigits,
      maximumSignificantDigits: options?.maximumSignificantDigits,
    });

    this.#terabyteFormatter = new Intl.NumberFormat(locale, {
      style: "unit",
      unit: "terabyte",
      unitDisplay: options?.unitDisplay,
      maximumFractionDigits: options?.maximumFractionDigits,
      maximumSignificantDigits: options?.maximumSignificantDigits,
    });

    this.#petabyteFormatter = new Intl.NumberFormat(locale, {
      style: "unit",
      unit: "petabyte",
      unitDisplay: options?.unitDisplay,
      maximumFractionDigits: options?.maximumFractionDigits,
      maximumSignificantDigits: options?.maximumSignificantDigits,
    });
  }

  #getFormatters(): Record<BytesUnitType, (bytes: number) => string> {
    return {
      byte: (bytes: number) => this.#formatBytes(bytes),
      kilobyte: (bytes: number) => this.#formatKilobytes(bytes),
      megabyte: (bytes: number) => this.#formatMegabytes(bytes),
      gigabyte: (bytes: number) => this.#formatGigabytes(bytes),
      terabyte: (bytes: number) => this.#formatTerabytes(bytes),
      petabyte: (bytes: number) => this.#formatPetabytes(bytes),
    };
  }

  #formatBytes(bytes: number): string {
    return this.#byteFormatter.format(bytes);
  }
  #formatKilobytes(bytes: number): string {
    return this.#kilobyteFormatter.format(new Bytes(bytes).toKilobytes());
  }
  #formatMegabytes(bytes: number): string {
    return this.#megabyteFormatter.format(new Bytes(bytes).toMegabytes());
  }
  #formatGigabytes(bytes: number): string {
    return this.#gigabyteFormatter.format(new Bytes(bytes).toGigabytes());
  }
  #formatTerabytes(bytes: number): string {
    return this.#terabyteFormatter.format(new Bytes(bytes).toTerabytes());
  }
  #formatPetabytes(bytes: number): string {
    return this.#petabyteFormatter.format(new Bytes(bytes).toPetabytes());
  }
  #formatAuto(bytes: number, initUnit?: BytesUnitType): string {
    const unit: BytesUnitType =
      initUnit ??
      (bytes < Bytes.kilobyte
        ? "byte"
        : bytes < Bytes.megabyte
          ? "kilobyte"
          : bytes < Bytes.gigabyte
            ? "megabyte"
            : bytes < Bytes.terabyte
              ? "gigabyte"
              : bytes < Bytes.petabyte
                ? "terabyte"
                : "petabyte");
    return this.#getFormatters()[unit](bytes);
  }

  format(bytes: number): string {
    return this.#formatAuto(
      bytes,
      this.#unit === "auto" ? undefined : this.#unit,
    );
  }
}
