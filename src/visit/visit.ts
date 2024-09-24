import { get } from "../get/get.js";

const nodeParent = new WeakMap<WeakKey, unknown>();
const nodeFieldName = new WeakMap<WeakKey, string | symbol | number>();

/**
 * A type alias for a function that takes an unknown node as input and returns a boolean.
 */
type Test<A> = (node: A) => boolean;

/**
 * A generator function that recursively visits nodes in an object, yielding each node that passes the provided test.
 *
 * @param {T} node The starting node to visit.
 * @param {Test} [test] An optional function that takes a node as input and returns a boolean. If true, the node will be yielded.
 * @returns A generator of nodes that pass the test.
 */
export function* visit<T, A = T, R = T>(node: T, test?: Test<A>): Generator<R> {
  if (test?.(node as any) ?? true) yield node as unknown as R;
  const obj = get.record(node);
  if (obj === undefined) return;
  for (const key of [
    ...Object.keys(obj),
    ...Object.getOwnPropertySymbols(obj),
  ]) {
    const child = get(obj, key);
    if (typeof child === "object" && child !== null) {
      nodeParent.set(child, node);
      nodeFieldName.set(child, key);
    }
    yield* visit(child, test);
  }
}

visit.getParent = (child: unknown) => {
  if (typeof child === "object" && child !== null) return nodeParent.get(child);
};
visit.getFieldName = (child: unknown) => {
  if (typeof child === "object" && child !== null)
    return nodeFieldName.get(child);
};
