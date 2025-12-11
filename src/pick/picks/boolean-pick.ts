import { CommonPick } from "./common-pick.js";

/**
 * Specialized class for working with booleans.
 * Extends CommonPick with specific methods for boolean validation.
 */

export class BooleanPick extends CommonPick<boolean> {
  /**
   * Validates that the value is true.
   *
   * @returns This instance if it's true, or undefined if not
   */
  true(): undefined | BooleanPick {
    if (this.value !== true) return undefined;
    return this;
  }

  /**
   * Validates that the value is false.
   *
   * @returns This instance if it's false, or undefined if not
   */
  false(): undefined | BooleanPick {
    if (this.value !== false) return undefined;
    return this;
  }

  /**
   * Inverts the boolean value.
   *
   * @returns A new BooleanPick instance with the inverted value
   */
  not(): BooleanPick {
    return new BooleanPick(!this.value);
  }
}
