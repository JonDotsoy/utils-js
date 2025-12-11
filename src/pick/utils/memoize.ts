/**
 * Creates a memoized version of a callback function that executes only once.
 * The result is cached and returned on subsequent calls without re-executing the callback.
 *
 * @template T - The return type of the callback function
 * @param cb - The callback function to be executed once
 * @returns A function that returns the cached result of the callback
 *
 * @example
 * ```typescript
 * const expensiveOperation = memoize(() => {
 *   console.log("Computing...");
 *   return 42;
 * });
 *
 * expensiveOperation(); // Logs "Computing..." and returns 42
 * expensiveOperation(); // Returns 42 without logging (uses cached value)
 * ```
 */
export const memoize = <T>(cb: () => T) => {
  let store: { current: T } | null = null;
  return () => {
    if (store) return store.current;
    store = { current: cb() };
    return store.current;
  };
};
