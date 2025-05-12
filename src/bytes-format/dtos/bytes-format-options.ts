import type { BytesUnitType } from "../../bytes/bytes.js";

export type BytesFormatOptions = Pick<
  Intl.NumberFormatOptions,
  "unitDisplay" | "maximumFractionDigits" | "maximumSignificantDigits"
> & {
  unit?: "auto" | BytesUnitType;
};
