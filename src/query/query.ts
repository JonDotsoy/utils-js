import get from "../get/get.js";

/**
 * Represents a function that evaluates a condition on a given value of type `T`.
 * Returns `true` if the value satisfies the condition, otherwise `false`.
 *
 * @typeParam T - The type of the value to be tested by the predicate.
 * @param node - The value to test.
 * @returns `true` if the value satisfies the condition, otherwise `false`.
 */
export type Predicate<T> = (node: T) => boolean;

export default class Query<T> {
  #predicates = new Set<Predicate<T>>();
  #selectProps: string[] = [];

  constructor() {}

  /**
   * Filtra los nodos por instancia de clase
   */
  instanceOf<T>(cls: new (...args: any[]) => T) {
    return this.where((node) => {
      return node instanceof cls;
    });
  }

  /**
   * Filtra los nodos por predicado
   */
  where<A = T>(predicate: Predicate<A>): Query<A> {
    const query = new Query();
    this.#predicates.forEach((p) => query.#predicates.add(p as any));
    query.#predicates.add((node: any) => {
      const selectedNode = get(node, ...this.#selectProps) as any;
      const predicateResult = predicate(selectedNode);

      return predicateResult;
    });
    query.#selectProps = [...query.#selectProps];
    return query;
  }

  /**
   * Filtra los nodos que tienen una propiedad específica
   */
  hasProperty(prop: string) {
    const query = this.where((node: any) => {
      // console.log("node~",node)
      return node != null && Object.prototype.hasOwnProperty.call(node, prop);
    });
    query.#selectProps = [...this.#selectProps, prop];
    return query;
  }

  equal(value: any) {
    return this.where((node) => {
      return node === value;
    });
  }

  match(matcher: string | RegExp) {
    return this.where((node: any) => {
      if (typeof node === "string") return node.match(matcher) !== null;
      return false;
    });
  }

  static size(query: Query<any>) {
    return query.#predicates.size;
  }

  /**
   * Creates a test function based on the provided `Query<A>`.
   *
   * @typeParam A - The type of the node to be tested.
   * @param test - A query object or function used to define the test logic.
   * @returns A predicate function that takes a node of type `A` and returns a boolean indicating if the node passes the test.
   */
  static createPredicate<A>(query: Query<A>): Predicate<A> {
    if (this.size(query) === 0) return () => true;

    return (node) =>
      Array.from(query.#predicates).every((predicate) => predicate(node));
  }
}

/**
 * Crea una consulta sobre la estructura de datos usando visit
 */
export function query<A>(): Query<A> {
  return new Query<A>();
}
