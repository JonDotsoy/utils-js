import { CommonPick } from "./common-pick.js";

/**
 * Specialized class for working with dates (Date).
 * Extends CommonPick with specific methods for date validation.
 */

export class DatePick<T extends Date | number | string> extends CommonPick<T> {
  #valueDate?: Date;

  private getDate(): Date | undefined {
    if (this.#valueDate !== undefined) {
      return this.#valueDate;
    }

    if (this.value instanceof Date) {
      this.#valueDate = this.value;
      return this.#valueDate;
    }

    const date = new Date(this.value);
    if (isNaN(date.getTime())) return undefined;

    this.#valueDate = date;
    return this.#valueDate;
  }

  /**
   * Validates that the date is after a minimum date.
   *
   * @param min - Minimum date (can be Date, timestamp, or string)
   * @returns This instance if the date is after, or undefined if it doesn't meet the condition
   */
  after(min: Date | number | string): undefined | DatePick<T> {
    const date = this.getDate();
    if (!date) return undefined;

    const minDate = new Date(min);
    if (isNaN(minDate.getTime())) return undefined;
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
    const date = this.getDate();
    if (!date) return undefined;

    const maxDate = new Date(max);
    if (isNaN(maxDate.getTime())) return undefined;
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
