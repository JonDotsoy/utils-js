// Utilidad query para simplificar búsquedas recursivas sobre estructuras de datos

export type Predicate<T> = (node: T) => boolean;

export default class Query<T> {
  #predicates = new Set<Predicate<T>>();

  constructor() {}

  /**
   * Filtra los nodos por instancia de clase
   */
  instanceOf<T>(cls: new (...args: any[]) => T): this {
    this.where((node) => {
      return node instanceof cls;
    });
    return this;
  }

  /**
   * Filtra los nodos por predicado
   */
  where(predicate: Predicate<T>): this {
    this.#predicates.add(predicate);
    return this;
  }

  /**
   * Filtra los nodos que tienen una propiedad específica
   */
  hasProperty(prop: string): this {
    return this.where(
      (node: any) =>
        node != null && Object.prototype.hasOwnProperty.call(node, prop),
    );
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
