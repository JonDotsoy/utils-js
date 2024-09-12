import { get } from "../get/get";

/**
 * Sets a value at a specified path within a nested object structure.
 *
 * @param {unknown} obj - The object to modify.
 * @param {PropertyKey[]} paths - An array of property keys representing the path to the target property.
 * @param {unknown} value - The value to set at the specified path.
 * @returns {unknown} The modified object.
 *
 * @example
 * const data = { a: { b: 1 } };
 * // Sets the value at 'b' within the nested object 'a' to 2
 * set(data, ['a', 'b'], 2);
 * console.log(data); // { a: { b: 2 } }
 *
 * // Creates an object at 'c' if it doesn't exist, and sets its 'd' property to 3
 * set(data, ['a', 'c', 'd'], 3);
 * console.log(data); // { a: { b: 2, c: { d: 3 } } }
 */
export const set = (obj: unknown, paths: PropertyKey[], value: unknown) => {
  const out = get.record(obj) ?? {};
  let current = { data: out };
  for (const index in paths) {
    const path = paths[index];
    const isEnd = Number(index) === paths.length - 1;
    const node = get.record(current.data) ?? {};
    const child = get.record(node, path) ?? {};
    Reflect.set(node, path, isEnd ? value : child);
    current.data = child;
  }
  return out;
};
