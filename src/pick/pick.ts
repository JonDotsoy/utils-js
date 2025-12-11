// Rules: Pick or any class that inherits from Pick should never modify the value

import { Pick } from "./picks/pick.js";
import { Utils } from "./utils/utils.js";
export { Pick } from "./picks/pick.js";
export { CommonPick } from "./picks/common-pick.js";
export { DatePick } from "./picks/date-pick.js";
export { URLPick } from "./picks/url-pick.js";
export { NumberPick } from "./picks/number-pick.js";
export { NumericPick } from "./picks/numeric-pick.js";
export { StringPick } from "./picks/string-pick.js";
export { RecordPick } from "./picks/record-pick.js";
export { ArrayPick } from "./picks/array-pick.js";
export { BooleanPick } from "./picks/boolean-pick.js";
export { BigIntPick } from "./picks/bigint-pick.js";
export { IntegerPick } from "./picks/integer-pick.js";

export const pick = <T = unknown>(value: T) => new Pick(value);
pick.utils = Utils;
