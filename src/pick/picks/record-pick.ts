import { ArrayPick } from "./array-pick.js";
import { Pick } from "./pick.js";

/**
 * Specialized class for working with objects (Records).
 * Extends Pick<Record<string, unknown>> with specific methods for object validation.
 */

export class RecordPick extends Pick<Record<string, unknown>> {
  /**
   * Validates that the object has a specific key.
   *
   * @param key - Key to search for
   * @returns This instance if it has the key, or undefined if not
   */
  hasKey(key: string): undefined | RecordPick {
    if (!(key in this.value)) return undefined;
    return this;
  }

  /**
   * Validates that the object has all the specified keys.
   *
   * @param keys - Array of keys to search for
   * @returns This instance if it has all the keys, or undefined if any is missing
   */
  hasKeys(keys: string[]): undefined | RecordPick {
    for (const key of keys) {
      if (!(key in this.value)) return undefined;
    }
    return this;
  }

  /**
   * Validates that the object is not empty.
   *
   * @returns This instance if it's not empty, or undefined if it's empty
   */
  notEmpty(): undefined | RecordPick {
    if (Object.keys(this.value).length === 0) return undefined;
    return this;
  }

  /**
   * Gets the keys of the object.
   *
   * @returns A new ArrayPick instance with the keys
   */
  keys(): ArrayPick<string> {
    return new ArrayPick(Object.keys(this.value));
  }

  /**
   * Gets the values of the object.
   *
   * @returns A new ArrayPick instance with the values
   */
  values(): ArrayPick<unknown> {
    return new ArrayPick(Object.values(this.value));
  }

  /**
   * Validates that the object has a minimum number of keys.
   *
   * @param min - Minimum number of keys
   * @returns This instance if it meets the condition, or undefined if not
   */
  minKeys(min: number): undefined | RecordPick {
    if (Object.keys(this.value).length < min) return undefined;
    return this;
  }

  /**
   * Validates that the object has a maximum number of keys.
   *
   * @param max - Maximum number of keys
   * @returns This instance if it meets the condition, or undefined if not
   */
  maxKeys(max: number): undefined | RecordPick {
    if (Object.keys(this.value).length > max) return undefined;
    return this;
  }
}
