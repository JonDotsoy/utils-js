/**
 * Interface for numerical types that support arithmetic validation methods.
 * Implemented by NumberPick, IntegerPick, and BigIntPick.
 *
 * @template T - The numerical type (number or bigint)
 * @template Self - The implementing class type for method chaining
 */
export interface ArithmeticMethods<T extends number | bigint, Self> {
  /**
   * Validates that the number is greater than the specified value.
   *
   * @param min - Minimum value (exclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  gt(min: T): undefined | Self;

  /**
   * Validates that the number is greater than or equal to the specified value.
   *
   * @param min - Minimum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  gte(min: T): undefined | Self;

  /**
   * Validates that the number is less than the specified value.
   *
   * @param max - Maximum value (exclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  lt(max: T): undefined | Self;

  /**
   * Validates that the number is less than or equal to the specified value.
   *
   * @param max - Maximum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  lte(max: T): undefined | Self;

  /**
   * Validates that the number is within a range.
   *
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  between(min: T, max: T): undefined | Self;

  /**
   * Validates that the number is positive (greater than 0).
   *
   * @returns This instance if it's positive, or undefined if not
   */
  positive(): undefined | Self;

  /**
   * Validates that the number is negative (less than 0).
   *
   * @returns This instance if it's negative, or undefined if not
   */
  negative(): undefined | Self;

  /**
   * Validates that the number is a multiple of the specified value.
   *
   * @param divisor - The divisor
   * @returns This instance if it's a multiple, or undefined if not
   */
  multipleOf(divisor: T): undefined | Self;

  /**
   * Validates that the number is divisible by the specified divisor.
   * This is an alias for `multipleOf()` with more intuitive naming.
   *
   * @param divisor - The divisor to check
   * @returns This instance if it's divisible by the divisor, or undefined if not
   */
  divisibleBy(divisor: T): undefined | Self;

  /**
   * Validates that the number is even.
   *
   * @returns This instance if it's even, or undefined if not
   */
  even(): undefined | Self;

  /**
   * Validates that the number is odd.
   *
   * @returns This instance if it's odd, or undefined if not
   */
  odd(): undefined | Self;

  /**
   * Validates that the number is an absolute value (integer without decimals).
   * For example, "123" passes but "123.42" does not.
   *
   * @returns This instance if it's an absolute value, or undefined if not
   */
  absolute(): undefined | Self;
}
