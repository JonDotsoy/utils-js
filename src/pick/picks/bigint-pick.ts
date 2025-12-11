import type { ArithmeticMethods } from "../dtos/arithmetic-methods.js";
import { CommonPick } from "./common-pick.js";

/**
 * Specialized class for working with bigints.
 * Extends CommonPick with specific methods for bigint validation.
 */

export class BigIntPick
  extends CommonPick<bigint>
  implements ArithmeticMethods<bigint, BigIntPick>
{
  /**
   * Validates that the bigint is greater than the specified value.
   *
   * @param min - Minimum value (exclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  gt(min: bigint): undefined | BigIntPick {
    if (this.value <= min) return undefined;
    return this;
  }

  /**
   * Validates that the bigint is greater than or equal to the specified value.
   *
   * @param min - Minimum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  gte(min: bigint): undefined | BigIntPick {
    if (this.value < min) return undefined;
    return this;
  }

  /**
   * Validates that the bigint is less than the specified value.
   *
   * @param max - Maximum value (exclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  lt(max: bigint): undefined | BigIntPick {
    if (this.value >= max) return undefined;
    return this;
  }

  /**
   * Validates that the bigint is less than or equal to the specified value.
   *
   * @param max - Maximum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  lte(max: bigint): undefined | BigIntPick {
    if (this.value > max) return undefined;
    return this;
  }

  /**
   * Validates that the bigint is within a range.
   *
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  between(min: bigint, max: bigint): undefined | BigIntPick {
    if (this.value < min || this.value > max) return undefined;
    return this;
  }

  /**
   * Validates that the bigint is positive (greater than 0n).
   *
   * @returns This instance if it's positive, or undefined if not
   */
  positive(): undefined | BigIntPick {
    if (this.value <= 0n) return undefined;
    return this;
  }

  /**
   * Validates that the bigint is negative (less than 0n).
   *
   * @returns This instance if it's negative, or undefined if not
   */
  negative(): undefined | BigIntPick {
    if (this.value >= 0n) return undefined;
    return this;
  }

  /**
   * Validates that the bigint is a multiple of the specified value.
   *
   * @param divisor - The divisor
   * @returns This instance if it's a multiple, or undefined if not
   *
   * @example
   * ```typescript
   * pick(10n).bigInt()?.multipleOf(2n)?.valueOf(); // 10n
   * pick(5n).bigInt()?.multipleOf(2n); // undefined
   * ```
   */
  multipleOf(divisor: bigint): undefined | BigIntPick {
    if (divisor === 0n) return undefined;
    if (this.value % divisor !== 0n) return undefined;
    return this;
  }

  /**
   * Validates that the bigint is divisible by the specified divisor.
   * This is an alias for `multipleOf()` with more intuitive naming.
   *
   * @param divisor - The divisor to check
   * @returns This instance if it's divisible by the divisor, or undefined if not
   *
   * @example
   * ```typescript
   * pick(10n).bigInt()?.divisibleBy(2n)?.valueOf(); // 10n
   * pick(4n).bigInt()?.divisibleBy(2n)?.valueOf(); // 4n
   * pick(5n).bigInt()?.divisibleBy(2n); // undefined
   * ```
   */
  divisibleBy(divisor: bigint): undefined | BigIntPick {
    return this.multipleOf(divisor);
  }

  /**
   * Validates that the bigint is even.
   *
   * @returns This instance if it's even, or undefined if not
   *
   * @example
   * ```typescript
   * pick(4n).bigInt()?.even()?.valueOf(); // 4n
   * pick(5n).bigInt()?.even(); // undefined
   * ```
   */
  even(): undefined | BigIntPick {
    if (this.value % 2n !== 0n) return undefined;
    return this;
  }

  /**
   * Validates that the bigint is odd.
   *
   * @returns This instance if it's odd, or undefined if not
   *
   * @example
   * ```typescript
   * pick(5n).bigInt()?.odd()?.valueOf(); // 5n
   * pick(4n).bigInt()?.odd(); // undefined
   * ```
   */
  odd(): undefined | BigIntPick {
    if (this.value % 2n === 0n) return undefined;
    return this;
  }

  /**
   * Validates that the bigint is an absolute value (integer without decimals).
   * Since BigInt already represents integers, this always returns the instance.
   *
   * @returns This instance (always succeeds for bigints)
   *
   * @example
   * ```typescript
   * pick(123n).bigInt()?.absolute()?.valueOf(); // 123n
   * ```
   */
  absolute(): undefined | BigIntPick {
    return this;
  }
}
