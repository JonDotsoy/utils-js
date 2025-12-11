import { CommonPick } from "./common-pick.js";
import { memoize } from "../utils/memoize.js";

/**
 * Specialized class for working with dates (Date).
 * Extends CommonPick with specific methods for date validation.
 */

export class DatePick<T extends Date | number | string> extends CommonPick<T> {
  /**
   * Memoized function that converts the value to a Date for validation.
   * The conversion is cached to avoid repeated parsing.
   * @private
   */
  private toDate = memoize((): Date | undefined => {
    if (this.value instanceof Date) {
      return this.value;
    }

    const date = new Date(this.value);
    if (Number.isNaN(date.getTime())) return undefined;

    return date;
  });

  /**
   * Validates that the date is after a minimum date.
   *
   * @param min - Minimum date (can be Date, timestamp, or string)
   * @returns This instance if the date is after, or undefined if it doesn't meet the condition
   */
  after(min: Date | number | string): undefined | DatePick<T> {
    const date = this.toDate();
    if (!date) return undefined;

    const minDate = new Date(min);
    if (Number.isNaN(minDate.getTime())) return undefined;
    if (date.getTime() <= minDate.getTime()) return undefined;
    return this;
  }

  /**
   * Validates that the date is before a maximum date.
   *
   * @param max - Maximum date (can be Date, timestamp, or string)
   * @returns This instance if the date is before, or undefined if it doesn't meet the condition
   */
  before(max: Date | number | string): undefined | DatePick<T> {
    const date = this.toDate();
    if (!date) return undefined;

    const maxDate = new Date(max);
    if (Number.isNaN(maxDate.getTime())) return undefined;
    if (date.getTime() >= maxDate.getTime()) return undefined;
    return this;
  }

  /**
   * Validates that the date is within a range.
   *
   * @param min - Minimum date
   * @param max - Maximum date
   * @returns This instance if the date is in range, or undefined if it doesn't meet the condition
   */
  between(
    min: Date | number | string,
    max: Date | number | string,
  ): undefined | DatePick<T> {
    return this.after(min)?.before(max);
  }
}
