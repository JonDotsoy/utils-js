import { get } from "../get/get.js";

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
