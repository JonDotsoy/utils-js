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
  pipe<E>(transform: (value: T) => E): Pick<E> {
    return new Pick(transform(this.value));
  }
}
