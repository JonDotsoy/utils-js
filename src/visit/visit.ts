import { get } from "../get/get.js";
import Query from "../query/query.js";

/**
 * A WeakMap that associates a node (of type `WeakKey`) with its parent node.
 * This is typically used to track parent-child relationships in tree-like data structures
 * without preventing garbage collection of nodes.
 *
 * @remarks
 * The use of `WeakMap` ensures that references to nodes do not prevent their
 * garbage collection when they are no longer in use elsewhere.
 *
 * @privateRemarks
 * The value type is `unknown` to allow flexibility in the type of parent node stored.
 */
const nodeParentWeakMap = new WeakMap<WeakKey, unknown>();

/**
 * A WeakMap that associates a `WeakKey` object with a property identifier,
 * which can be a string, symbol, or number. This is useful for storing
 * metadata or properties related to specific nodes without preventing
 * garbage collection of the keys.
 *
 * @remarks
 * The use of `WeakMap` ensures that the mapping does not prevent the
 * garbage collection of the key objects.
 *
 * @privateRemarks
 * Ensure that `WeakKey` is a valid object type suitable for use as a
 * `WeakMap` key.
 */
const nodePropertiesWeakMap = new WeakMap<WeakKey, string | symbol | number>();

/**
 * A type alias for a function that takes an unknown node as input and returns a boolean.
 */
type Test<A> = ((node: A) => boolean) | Query<A>;

/**
 * A generator function that recursively visits nodes in an object, yielding each node that passes the provided test.
 *
 * @param {T} node The starting node to visit.
 * @param {Test} [test] An optional function that takes a node as input and returns a boolean. If true, the node will be yielded.
 * @param {WeakSet<WeakKey>} [seenInstances] A WeakSet used to keep track of visited objects. This allows for efficient object visitation tracking without preventing garbage collection of the tracked objects.
 * @returns A generator of nodes that pass the test.
 */
export function* visit<T, A = T, R = T>(
  node: T,
  test?: Test<A>,
  seenInstances = new WeakSet<WeakKey>(),
): Generator<R> {
  if (typeof node === "object" && node !== null) {
    if (seenInstances.has(node)) return;
    seenInstances.add(node);
  }

  const testEval = test instanceof Query ? Query.createPredicate(test) : test;

  if (testEval?.(node as any) ?? true) yield node as unknown as R;
  const obj = get.record(node);
  if (obj === undefined) return;
  for (const key of [
    ...Object.keys(obj),
    ...Object.getOwnPropertySymbols(obj),
  ]) {
    const child = get(obj, key);
    if (typeof child === "object" && child !== null) {
      nodeParentWeakMap.set(child, node);
      nodePropertiesWeakMap.set(child, key);
    }
    yield* visit(child, testEval, seenInstances);
  }
}

visit.getParent = (child: unknown) => {
  if (typeof child === "object" && child !== null)
    return nodeParentWeakMap.get(child);
};
visit.getFieldName = (child: unknown) => {
  if (typeof child === "object" && child !== null)
    return nodePropertiesWeakMap.get(child);
};
