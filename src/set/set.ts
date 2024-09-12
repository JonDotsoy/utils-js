const pick = (
  obj: unknown,
  paths: PropertyKey[],
  parent: unknown,
  updateParent?: (value: unknown) => void,
): unknown => {
  if (paths.length === 0) return parent;
  const isObj = typeof obj === "object" && obj !== null;
  if (!isObj) {
    obj = {};
    updateParent?.(obj);
  }
  const [path, ...nextPaths] = paths;
  return pick(Reflect.get(obj ?? {}, path), nextPaths, obj, (val) => {
    Reflect.set(obj ?? {}, path, val);
  });
};

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
  const o = { obj };
  const lastChild = pick(o.obj, paths, o, (val) => {
    Reflect.set(o, "obj", val);
  });
  const lastPath = paths.at(-1);
  if (lastPath) {
    Reflect.set(lastChild ?? {}, lastPath, value);
  }
  return o.obj;
};
