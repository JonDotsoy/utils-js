// Import Pick class for creating Pick instances in first(), last(), at()
// This is safe because Pick doesn't import ArrayPick directly
import { Pick } from "./pick.js";
import { CommonPick } from "./common-pick.js";

/**
 * Specialized class for working with arrays.
 * Extends CommonPick with specific methods for array validation and manipulation.
 */

export class ArrayPick<T = unknown> extends CommonPick<Array<T>> {
  /**
   * Filters array elements that meet the specified condition.
   *
   * @deprecated This method is deprecated because the name can be confusing.
   * Although it doesn't mutate the original value, the name suggests a mutation operation.
   * Use `pipe()` with native `filter()` instead: `.pipe(arr => arr.filter(...))`
   *
   * @param filter - Function that evaluates each element of the array
   * @param thisArg - Optional value to use as `this` when executing the filter function
   * @returns A new ArrayPick instance with the filtered array
   */
  filter(filter: (value: T) => boolean, thisArg?: any): ArrayPick<T> {
    return new ArrayPick(this.value.filter(filter, thisArg));
  }
  /**
   * Validates that the array has a minimum length.
   *
   * @param min - Minimum length (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  minLength(min: number): undefined | ArrayPick<T> {
    if (this.value.length < min) return undefined;
    return this;
  }

  /**
   * Validates that the array has a maximum length.
   *
   * @param max - Maximum length (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  maxLength(max: number): undefined | ArrayPick<T> {
    if (this.value.length > max) return undefined;
    return this;
  }

  /**
   * Validates that the array has an exact length.
   *
   * @param length - Exact length
   * @returns This instance if it meets the condition, or undefined if not
   */
  length(length: number): undefined | ArrayPick<T> {
    if (this.value.length !== length) return undefined;
    return this;
  }

  /**
   * Validates that the array is not empty.
   *
   * @returns This instance if it's not empty, or undefined if it's empty
   */
  notEmpty(): undefined | ArrayPick<T> {
    if (this.value.length === 0) return undefined;
    return this;
  }

  /**
   * Validates that the array contains a specific element.
   *
   * @param item - Element to search for
   * @returns This instance if it contains the element, or undefined if not
   */
  includes(item: T): undefined | ArrayPick<T> {
    if (!this.value.includes(item)) return undefined;
    return this;
  }

  /**
   * Gets the first element of the array.
   *
   * @returns A new Pick instance with the first element, or undefined if it's empty
   */
  first(): Pick<T> | undefined {
    if (this.value.length === 0) return undefined;
    return new Pick(this.value[0]);
  }

  /**
   * Gets the last element of the array.
   *
   * @returns A new Pick instance with the last element, or undefined if it's empty
   */
  last(): Pick<T> | undefined {
    if (this.value.length === 0) return undefined;
    return new Pick(this.value[this.value.length - 1]);
  }

  /**
   * Gets an element at a specific index.
   *
   * @param index - Index of the element
   * @returns A new Pick instance with the element, or undefined if the index doesn't exist
   */
  at(index: number): Pick<T> | undefined {
    const item = this.value.at(index);
    if (item === undefined) return undefined;
    return new Pick(item);
  }
}
