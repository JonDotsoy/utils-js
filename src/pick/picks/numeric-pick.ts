import type { ArithmeticMethods } from "../dtos/arithmetic-methods.js";
import { memoize } from "../utils/memoize.js";
import { CommonPick } from "./common-pick.js";

/**
 * Specialized class for working with numeric values (number or numeric string).
 * Extends CommonPick with arithmetic validation methods.
 */

export class NumericPick<T extends number | string = number | string>
  extends CommonPick<T>
  implements ArithmeticMethods<number, NumericPick<T>>
{
  /**
   * Memoized function that converts the value to a number for comparison.
   * The conversion is cached to avoid repeated parsing of string values.
   * @private
   */
  private toNumber = memoize((): number => {
    return typeof this.value === "string" ? parseFloat(this.value) : this.value;
  });

  /**
   * Validates that the numeric value is greater than the specified value.
   *
   * @param min - Minimum value (exclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  gt(min: number): undefined | NumericPick<T> {
    if (this.toNumber() <= min) return undefined;
    return this;
  }

  /**
   * Validates that the numeric value is greater than or equal to the specified value.
   *
   * @param min - Minimum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  gte(min: number): undefined | NumericPick<T> {
    if (this.toNumber() < min) return undefined;
    return this;
  }

  /**
   * Validates that the numeric value is less than the specified value.
   *
   * @param max - Maximum value (exclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  lt(max: number): undefined | NumericPick<T> {
    if (this.toNumber() >= max) return undefined;
    return this;
  }

  /**
   * Validates that the numeric value is less than or equal to the specified value.
   *
   * @param max - Maximum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  lte(max: number): undefined | NumericPick<T> {
    if (this.toNumber() > max) return undefined;
    return this;
  }

  /**
   * Validates that the numeric value is within a range.
   *
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  between(min: number, max: number): undefined | NumericPick<T> {
    const num = this.toNumber();
    if (num < min || num > max) return undefined;
    return this;
  }

  /**
   * Validates that the numeric value is positive (greater than 0).
   *
   * @returns This instance if it's positive, or undefined if not
   */
  positive(): undefined | NumericPick<T> {
    if (this.toNumber() <= 0) return undefined;
    return this;
  }

  /**
   * Validates that the numeric value is negative (less than 0).
   *
   * @returns This instance if it's negative, or undefined if not
   */
  negative(): undefined | NumericPick<T> {
    if (this.toNumber() >= 0) return undefined;
    return this;
  }

  /**
   * Validates that the numeric value is a multiple of the specified value.
   *
   * @param divisor - The divisor
   * @returns This instance if it's a multiple, or undefined if not
   */
  multipleOf(divisor: number): undefined | NumericPick<T> {
    if (this.toNumber() % divisor !== 0) return undefined;
    return this;
  }

  /**
   * Validates that the numeric value is divisible by the specified divisor.
   * This is an alias for `multipleOf()` with more intuitive naming.
   *
   * @param divisor - The divisor to check
   * @returns This instance if it's divisible by the divisor, or undefined if not
   */
  divisibleBy(divisor: number): undefined | NumericPick<T> {
    return this.multipleOf(divisor);
  }

  /**
   * Validates that the numeric value is even.
   *
   * @returns This instance if it's even, or undefined if not
   */
  even(): undefined | NumericPick<T> {
    const num = this.toNumber();
    if (!Number.isInteger(num)) return undefined;
    if (num % 2 !== 0) return undefined;
    return this;
  }

  /**
   * Validates that the numeric value is odd.
   *
   * @returns This instance if it's odd, or undefined if not
   */
  odd(): undefined | NumericPick<T> {
    const num = this.toNumber();
    if (!Number.isInteger(num)) return undefined;
    if (num % 2 === 0) return undefined;
    return this;
  }

  /**
   * Validates that the numeric value is an absolute value (integer without decimals).
   * For example, "123" passes but "123.42" does not.
   *
   * @returns This instance if it's an absolute value, or undefined if not
   *
   * @example
   * ```typescript
   * pick("123").numeric()?.absolute()?.valueOf(); // "123"
   * pick("123.42").numeric()?.absolute(); // undefined
   * pick(50).numeric()?.absolute()?.valueOf(); // 50
   * pick(50.5).numeric()?.absolute(); // undefined
   * ```
   */
  absolute(): undefined | NumericPick<T> {
    const num = this.toNumber();
    if (!Number.isInteger(num)) return undefined;
    return this;
  }
}
