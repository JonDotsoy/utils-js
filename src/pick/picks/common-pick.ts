import { Pick } from "./pick.js";

/**
 * Base class for all specialized Pick classes.
 * Provides common methods like valueOf() and pipe().
 *
 * @template T - The type of the encapsulated value
 */
export class CommonPick<T> {
  constructor(readonly value: T) {}

  /**
   * Gets the current encapsulated value.
   *
   * @returns The original value encapsulated in this instance
   */
  valueOf(): T {
    return this.value;
  }

  /**
   * Applies a transformation function to the current value.
   *
   * @template E - The type of the resulting value
   * @param transform - Function that transforms the current value
   * @returns A new Pick instance with the transformed value
   */
  pipe<E>(transform: (value: T) => E): CommonPick<E> {
    return new CommonPick(transform(this.value));
  }

  /**
   * Validates that the current value belongs to a specific set of values (enum).
   * Works with any type of values, not just strings.
   *
   * @template E - The type of the enum values
   * @param values - Array of valid enum values
   * @returns This instance if the value belongs to the enum, or undefined if not
   *
   * @example
   * ```typescript
   * new CommonPick(true).enum([true])?.valueOf(); // true
   * new CommonPick("foo").enum(["taz", "biz", "foo"])?.valueOf(); // "foo"
   * new CommonPick(3).enum(["taz", 3, "foo", true])?.valueOf(); // 3
   * new CommonPick("bar").enum(["foo", "baz"]); // undefined
   * ```
   */
  enum<E>(values: readonly E[]): undefined | CommonPick<E> {
    if (!values.includes(this.value as any)) return undefined;
    return this as any;
  }
}
