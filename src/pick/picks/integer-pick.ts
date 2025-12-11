import type { ArithmeticMethods } from "../dtos/arithmetic-methods.js";
import { CommonPick } from "./common-pick.js";

/**
 * Specialized class for working with integers.
 * Extends CommonPick with specific validations for integer numbers.
 */

export class IntegerPick
  extends CommonPick<number>
  implements ArithmeticMethods<number, IntegerPick>
{
  /**
   * Validates that the integer is greater than the specified value.
   *
   * @param min - Minimum value (exclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  gt(min: number): undefined | IntegerPick {
    if (this.value <= min) return undefined;
    return this;
  }

  /**
   * Validates that the integer is greater than or equal to the specified value.
   *
   * @param min - Minimum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  gte(min: number): undefined | IntegerPick {
    if (this.value < min) return undefined;
    return this;
  }

  /**
   * Validates that the integer is less than the specified value.
   *
   * @param max - Maximum value (exclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  lt(max: number): undefined | IntegerPick {
    if (this.value >= max) return undefined;
    return this;
  }

  /**
   * Validates that the integer is less than or equal to the specified value.
   *
   * @param max - Maximum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  lte(max: number): undefined | IntegerPick {
    if (this.value > max) return undefined;
    return this;
  }

  /**
   * Validates that the integer is within a range.
   *
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  between(min: number, max: number): undefined | IntegerPick {
    if (this.value < min || this.value > max) return undefined;
    return this;
  }

  /**
   * Validates that the integer is positive (greater than 0).
   *
   * @returns This instance if it's positive, or undefined if not
   */
  positive(): undefined | IntegerPick {
    if (this.value <= 0) return undefined;
    return this;
  }

  /**
   * Validates that the integer is negative (less than 0).
   *
   * @returns This instance if it's negative, or undefined if not
   */
  negative(): undefined | IntegerPick {
    if (this.value >= 0) return undefined;
    return this;
  }

  /**
   * Validates that the integer is a multiple of the specified value.
   *
   * @param divisor - The divisor
   * @returns This instance if it's a multiple, or undefined if not
   */
  multipleOf(divisor: number): undefined | IntegerPick {
    if (this.value % divisor !== 0) return undefined;
    return this;
  }

  /**
   * Validates that the integer is even.
   *
   * @returns This instance if it's even, or undefined if not
   */
  even(): undefined | IntegerPick {
    if (this.value % 2 !== 0) return undefined;
    return this;
  }

  /**
   * Validates that the integer is odd.
   *
   * @returns This instance if it's odd, or undefined if not
   */
  odd(): undefined | IntegerPick {
    if (this.value % 2 === 0) return undefined;
    return this;
  }

  /**
   * Validates that the integer is divisible by the specified divisor.
   * This is an alias for `multipleOf()` with more intuitive naming.
   *
   * @param divisor - The divisor to check
   * @returns This instance if it's divisible by the divisor, or undefined if not
   *
   * @example
   * ```typescript
   * pick(10).integer()?.divisibleBy(2)?.valueOf(); // 10
   * pick(4).integer()?.divisibleBy(2)?.valueOf(); // 4
   * pick(5).integer()?.divisibleBy(2); // undefined
   * ```
   */
  divisibleBy(divisor: number): undefined | IntegerPick {
    return this.multipleOf(divisor);
  }

  /**
   * Validates that the integer is an absolute value (integer without decimals).
   * Since IntegerPick already validates integers, this always returns the instance.
   *
   * @returns This instance (always succeeds for integers)
   *
   * @example
   * ```typescript
   * pick(123).integer()?.absolute()?.valueOf(); // 123
   * pick(123.42).integer(); // undefined (not an integer)
   * ```
   */
  absolute(): undefined | IntegerPick {
    return this;
  }
}
