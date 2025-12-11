import type { ArithmeticMethods } from "../dtos/arithmetic-methods.js";
import { IntegerPick } from "./integer-pick.js";
import { CommonPick } from "./common-pick.js";

/**
 * Specialized class for working with numbers.
 * Extends CommonPick with specific methods for number validation.
 */

export class NumberPick
  extends CommonPick<number>
  implements ArithmeticMethods<number, NumberPick>
{
  /**
   * Validates that the number is greater than the specified value.
   *
   * @param min - Minimum value (exclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  gt(min: number): undefined | NumberPick {
    if (this.value <= min) return undefined;
    return this;
  }

  /**
   * Validates that the number is greater than or equal to the specified value.
   *
   * @param min - Minimum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  gte(min: number): undefined | NumberPick {
    if (this.value < min) return undefined;
    return this;
  }

  /**
   * Validates that the number is less than the specified value.
   *
   * @param max - Maximum value (exclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  lt(max: number): undefined | NumberPick {
    if (this.value >= max) return undefined;
    return this;
  }

  /**
   * Validates that the number is less than or equal to the specified value.
   *
   * @param max - Maximum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  lte(max: number): undefined | NumberPick {
    if (this.value > max) return undefined;
    return this;
  }

  /**
   * Validates that the number is within a range.
   *
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  between(min: number, max: number): undefined | NumberPick {
    if (this.value < min || this.value > max) return undefined;
    return this;
  }

  /**
   * Validates that the number is positive (greater than 0).
   *
   * @returns This instance if it's positive, or undefined if not
   */
  positive(): undefined | NumberPick {
    if (this.value <= 0) return undefined;
    return this;
  }

  /**
   * Validates that the number is negative (less than 0).
   *
   * @returns This instance if it's negative, or undefined if not
   */
  negative(): undefined | NumberPick {
    if (this.value >= 0) return undefined;
    return this;
  }

  /**
   * Validates that the number is an integer.
   *
   * @returns A new IntegerPick instance if it's an integer, or undefined if not
   */
  integer(): undefined | IntegerPick {
    if (!Number.isInteger(this.value)) return undefined;
    return new IntegerPick(this.value);
  }

  /**
   * Validates that the number is finite.
   *
   * @returns This instance if it's finite, or undefined if not
   */
  finite(): undefined | NumberPick {
    if (!Number.isFinite(this.value)) return undefined;
    return this;
  }

  /**
   * Validates that the number is a multiple of the specified value.
   *
   * @param divisor - The divisor
   * @returns This instance if it's a multiple, or undefined if not
   */
  multipleOf(divisor: number): undefined | NumberPick {
    if (this.value % divisor !== 0) return undefined;
    return this;
  }

  /**
   * Validates that the number is divisible by the specified divisor.
   * This is an alias for `multipleOf()` with more intuitive naming.
   *
   * @param divisor - The divisor to check
   * @returns This instance if it's divisible by the divisor, or undefined if not
   *
   * @example
   * ```typescript
   * pick(10).number()?.divisibleBy(2)?.valueOf(); // 10
   * pick(4).number()?.divisibleBy(2)?.valueOf(); // 4
   * pick(5).number()?.divisibleBy(2); // undefined
   * ```
   */
  divisibleBy(divisor: number): undefined | NumberPick {
    return this.multipleOf(divisor);
  }

  /**
   * Validates that the number is even.
   *
   * @returns This instance if it's even, or undefined if not
   *
   * @example
   * ```typescript
   * pick(4).number()?.even()?.valueOf(); // 4
   * pick(5).number()?.even(); // undefined
   * pick(4.5).number()?.even(); // undefined (not an integer)
   * ```
   */
  even(): undefined | NumberPick {
    if (!Number.isInteger(this.value)) return undefined;
    if (this.value % 2 !== 0) return undefined;
    return this;
  }

  /**
   * Validates that the number is odd.
   *
   * @returns This instance if it's odd, or undefined if not
   *
   * @example
   * ```typescript
   * pick(5).number()?.odd()?.valueOf(); // 5
   * pick(4).number()?.odd(); // undefined
   * pick(5.5).number()?.odd(); // undefined (not an integer)
   * ```
   */
  odd(): undefined | NumberPick {
    if (!Number.isInteger(this.value)) return undefined;
    if (this.value % 2 === 0) return undefined;
    return this;
  }

  /**
   * Validates that the number is an absolute value (integer without decimals).
   * For example, 123 passes but 123.42 does not.
   *
   * @returns This instance if it's an absolute value, or undefined if not
   *
   * @example
   * ```typescript
   * pick(123).number()?.absolute()?.valueOf(); // 123
   * pick(123.42).number()?.absolute(); // undefined
   * pick(-50).number()?.absolute()?.valueOf(); // -50
   * ```
   */
  absolute(): undefined | NumberPick {
    if (!Number.isInteger(this.value)) return undefined;
    return this;
  }
}
