import { NumericPick } from "./numeric-pick.js";
import { Pick } from "./pick.js";

/**
 * Specialized class for working with strings.
 * Extends Pick<string> with specific methods for string validation and manipulation.
 */

export class StringPick extends Pick<string> {
  /**
   * Validates that the string has a minimum length.
   *
   * @param min - Minimum length (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  minLength(min: number): undefined | StringPick {
    if (this.value.length < min) return undefined;
    return this;
  }

  /**
   * Validates that the string has a maximum length.
   *
   * @param max - Maximum length (inclusive)
   * @returns This instance if it meets the condition, or undefined if not
   */
  maxLength(max: number): undefined | StringPick {
    if (this.value.length > max) return undefined;
    return this;
  }

  /**
   * Validates that the string has an exact length.
   *
   * @param length - Exact length
   * @returns This instance if it meets the condition, or undefined if not
   */
  length(length: number): undefined | StringPick {
    if (this.value.length !== length) return undefined;
    return this;
  }

  /**
   * Validates that the string matches a regular expression.
   *
   * @param pattern - Regular expression or string
   * @returns This instance if it matches, or undefined if not
   */
  matches(pattern: RegExp | string): undefined | StringPick {
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
    if (!regex.test(this.value)) return undefined;
    return this;
  }

  /**
   * Validates that the string starts with a specific prefix.
   *
   * @param prefix - Prefix to search for
   * @returns This instance if it starts with the prefix, or undefined if not
   */
  startsWith(prefix: string): undefined | StringPick {
    if (!this.value.startsWith(prefix)) return undefined;
    return this;
  }

  /**
   * Validates that the string ends with a specific suffix.
   *
   * @param suffix - Suffix to search for
   * @returns This instance if it ends with the suffix, or undefined if not
   */
  endsWith(suffix: string): undefined | StringPick {
    if (!this.value.endsWith(suffix)) return undefined;
    return this;
  }

  /**
   * Validates that the string contains a specific substring.
   *
   * @param substring - Substring to search for
   * @returns This instance if it contains the substring, or undefined if not
   */
  includes(substring: string): undefined | StringPick {
    if (!this.value.includes(substring)) return undefined;
    return this;
  }

  /**
   * Validates that the string is not empty.
   *
   * @returns This instance if it's not empty, or undefined if it's empty
   */
  notEmpty(): undefined | StringPick {
    if (this.value.length === 0) return undefined;
    return this;
  }

  /**
   * Validates that the string is a valid email.
   *
   * @remarks
   * This method uses a simplified regular expression to validate emails.
   * It doesn't cover all RFC 5322 specifications (which is extremely complex),
   * but validates most common and practical email formats.
   *
   * @returns This instance if it's a valid email, or undefined if not
   */
  email(): undefined | StringPick {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.value)) return undefined;
    return this;
  }

  /**
   * Validates that the string represents a numeric value (integer or decimal).
   * Supports optional leading + or - sign.
   * This is an alias for `this.matches(/^[+-]?\d+(\.\d+)?$/)`.
   *
   * @returns This instance if it's a numeric string, or undefined if not
   *
   * @example
   * ```typescript
   * pick("1234").string()?.numeric()?.valueOf(); // "1234"
   * pick("123.456").string()?.numeric()?.valueOf(); // "123.456"
   * pick("-123").string()?.numeric()?.valueOf(); // "-123"
   * pick("+123.45").string()?.numeric()?.valueOf(); // "+123.45"
   * pick("abc").string()?.numeric(); // undefined
   * ```
   */
  numeric(): undefined | NumericPick<string> {
    let v = this.matches(/^[+-]?\d+(\.\d+)?$/);
    if (v === undefined) return undefined;
    return new NumericPick<string>(v.value);
  }

  /**
   * Transforms the string to uppercase.
   *
   * @returns A new StringPick instance with the string in uppercase
   */
  toUpperCase(): StringPick {
    return new StringPick(this.value.toUpperCase());
  }

  /**
   * Transforms the string to lowercase.
   *
   * @returns A new StringPick instance with the string in lowercase
   */
  toLowerCase(): StringPick {
    return new StringPick(this.value.toLowerCase());
  }

  /**
   * Removes whitespace from the beginning and end of the string.
   *
   * @returns A new StringPick instance with the trimmed string
   */
  trim(): StringPick {
    return new StringPick(this.value.trim());
  }
}
