// Reglas: Pick o cualquier clase que erede de Pick nunca deben modificar el valor

namespace Utils {
  export const isRecord = (value: any): value is Record<any, any> =>
    typeof value === "object" && value !== null;
  export const isSymbol = (value: any): value is symbol =>
    typeof value === "symbol";
  export const isString = (value: any): value is string =>
    typeof value === "string";
  export const isNumber = (value: any): value is number =>
    typeof value === "number";
  export const isBoolean = (value: any): value is boolean =>
    typeof value === "boolean";
  export const isArray = (value: any): value is Array<any> =>
    isRecord(value) && Array.isArray(value);
  export const hasOwnProperty = <K extends string | symbol | number>(
    value: Record<any, any>,
    key: K,
  ): value is Record<K, any> => Reflect.has(value, key);
  export const includes = <T extends string>(
    values: T[],
    value: unknown,
  ): value is T => isString(value) && (values as any[]).includes(value);
}

/**
 * Clase utilitaria para navegar y validar estructuras de datos de forma segura.
 * Proporciona métodos encadenables para acceder a propiedades y validar tipos.
 *
 * @template T - El tipo del valor encapsulado
 *
 * @example
 * ```typescript
 * const data = { user: { name: "John", age: 30 } };
 * const name = pick(data)
 *   .property("user")
 *   ?.property("name")
 *   ?.isString()
 *   ?.valueOf();
 * ```
 */
export class Pick<T> {
  /**
   * Crea una nueva instancia de Pick con el valor proporcionado.
   *
   * @param value - El valor a encapsular
   */
  constructor(readonly value: T) {}

  /**
   * Accede a una propiedad del objeto actual.
   *
   * @template K - El tipo de la clave de la propiedad
   * @param key - La clave de la propiedad a acceder
   * @returns Una nueva instancia de Pick con el valor de la propiedad, o undefined si no existe
   *
   * @example
   * ```typescript
   * pick({ name: "John" }).property("name")?.valueOf(); // "John"
   * ```
   */
  property<K extends string | symbol | number>(
    key: K,
  ): undefined | Pick<unknown> {
    if (!Utils.isRecord(this.value)) return undefined;
    if (!Utils.hasOwnProperty(this.value, key)) return undefined;
    return new Pick(this.value[key]);
  }

  /**
   * Valida que el valor actual sea un string.
   *
   * @returns Una nueva instancia de Pick con el valor tipado como string, o undefined si no es un string
   *
   * @example
   * ```typescript
   * pick("hello").string()?.valueOf(); // "hello"
   * pick(123).string(); // undefined
   * ```
   */
  string(): undefined | Pick<string> {
    if (!Utils.isString(this.value)) return undefined;
    return new Pick(this.value);
  }

  /** @deprecated Use string() instead */
  isString(): undefined | Pick<string> {
    return this.string();
  }

  /**
   * Valida que el valor actual sea un number.
   *
   * @returns Una nueva instancia de Pick con el valor tipado como number, o undefined si no es un number
   *
   * @example
   * ```typescript
   * pick(123).number()?.valueOf(); // 123
   * pick("hello").number(); // undefined
   * ```
   */
  number(): undefined | Pick<number> {
    if (!Utils.isNumber(this.value)) return undefined;
    return new Pick(this.value);
  }

  /** @deprecated Use number() instead */
  isNumber(): undefined | Pick<number> {
    return this.number();
  }

  /**
   * Valida que el número sea mayor que el valor especificado.
   *
   * @param min - Valor mínimo (exclusivo)
   * @returns Una nueva instancia de Pick con el valor, o undefined si no cumple la condición
   */
  gt(min: number): undefined | Pick<number> {
    if (!Utils.isNumber(this.value)) return undefined;
    if (this.value <= min) return undefined;
    return new Pick(this.value);
  }

  /**
   * Valida que el valor actual sea un número entero.
   *
   * @returns Una nueva instancia de Pick con el valor tipado como number, o undefined si no es un entero
   *
   * @example
   * ```typescript
   * pick(42).integer()?.valueOf(); // 42
   * pick(3.14).integer(); // undefined
   * pick("hello").integer(); // undefined
   * ```
   */
  integer(): undefined | Pick<number> {
    if (!Utils.isNumber(this.value)) return undefined;
    if (!Number.isInteger(this.value)) return undefined;
    return new Pick(this.value);
  }

  /** @deprecated Use integer() instead */
  isInteger(): undefined | Pick<number> {
    return this.integer();
  }

  /**
   * Valida que el valor actual sea un bigint.
   *
   * @returns Una nueva instancia de Pick con el valor tipado como bigint, o undefined si no es un bigint
   *
   * @example
   * ```typescript
   * pick(123n).bigInt()?.valueOf(); // 123n
   * pick(123).bigInt(); // undefined
   * ```
   */
  bigInt(): undefined | Pick<bigint> {
    if (typeof this.value !== "bigint") return undefined;
    return new Pick(this.value);
  }

  /** @deprecated Use bigInt() instead */
  isBigInt(): undefined | Pick<bigint> {
    return this.bigInt();
  }

  /**
   * Valida que el valor actual sea un boolean.
   *
   * @returns Una nueva instancia de Pick con el valor tipado como boolean, o undefined si no es un boolean
   *
   * @example
   * ```typescript
   * pick(true).boolean()?.valueOf(); // true
   * pick(1).boolean(); // undefined
   * ```
   */
  boolean(): undefined | Pick<boolean> {
    if (!Utils.isBoolean(this.value)) return undefined;
    return new Pick(this.value);
  }

  /** @deprecated Use boolean() instead */
  isBoolean(): undefined | Pick<boolean> {
    return this.boolean();
  }

  /**
   * Valida que el valor actual sea un tipo nativo de JavaScript.
   * Los tipos nativos incluyen: string, number, boolean, Array y Object.
   *
   * @returns Una nueva instancia de Pick con el valor tipado como tipo nativo, o undefined si no es un tipo nativo
   *
   * @example
   * ```typescript
   * pick("hello").native()?.valueOf(); // "hello"
   * pick([1, 2, 3]).native()?.valueOf(); // [1, 2, 3]
   * ```
   */
  native():
    | undefined
    | Pick<string | number | boolean | Array<any> | Record<any, any>> {
    if (Utils.isString(this.value)) return new Pick(this.value);
    if (Utils.isNumber(this.value)) return new Pick(this.value);
    if (Utils.isBoolean(this.value)) return new Pick(this.value);
    if (Utils.isArray(this.value)) return new Pick(this.value);
    if (Utils.isRecord(this.value)) return new Pick(this.value);
    return undefined;
  }

  /** @deprecated Use native() instead */
  isNative():
    | undefined
    | Pick<string | number | boolean | Array<any> | Record<any, any>> {
    return this.native();
  }

  /**
   * Valida que el valor actual sea un array.
   *
   * @returns Una nueva instancia de Pick con el valor tipado como Array, o undefined si no es un array
   *
   * @example
   * ```typescript
   * pick([1, 2, 3]).array()?.valueOf(); // [1, 2, 3]
   * pick("hello").array(); // undefined
   * ```
   */
  array(): undefined | Pick<Array<unknown>> {
    if (!Utils.isArray(this.value)) return undefined;
    return new Pick(this.value);
  }

  /** @deprecated Use array() instead */
  isArray(): undefined | Pick<Array<unknown>> {
    return this.array();
  }

  /**
   * Valida que el valor actual sea un objeto (Record).
   *
   * @returns Una nueva instancia de Pick con el valor tipado como Record, o undefined si no es un objeto
   *
   * @example
   * ```typescript
   * pick({ name: "John" }).record()?.valueOf(); // { name: "John" }
   * pick(null).record(); // undefined
   * ```
   */
  record(): undefined | Pick<Record<string, unknown>> {
    if (!Utils.isRecord(this.value)) return undefined;
    return new Pick(this.value);
  }

  /** @deprecated Use record() instead */
  isRecord(): undefined | Pick<Record<string, unknown>> {
    return this.record();
  }

  /**
   * Valida que el valor actual sea un string que pertenece a un conjunto específico de valores (enum).
   *
   * @template E - El tipo de los valores del enum
   * @param values - Array de valores válidos del enum
   * @returns Una nueva instancia de Pick con el valor tipado como E, o undefined si no pertenece al enum
   *
   * @example
   * ```typescript
   * pick("red").enum(["red", "green", "blue"])?.valueOf(); // "red"
   * pick("yellow").enum(["red", "green", "blue"]); // undefined
   * ```
   */
  enum<E extends string>(values: E[]) {
    if (!Utils.isString(this.value)) return undefined;
    if (!Utils.includes(values, this.value)) return undefined;
    return new Pick<E>(this.value);
  }

  /** @deprecated Use enum() instead */
  isEnumOf<E extends string>(values: E[]) {
    return this.enum(values);
  }

  /**
   * Aplica una función de transformación al valor actual.
   *
   * @template E - El tipo del valor resultante
   * @param transform - Función que transforma el valor actual
   * @returns El resultado de aplicar la función de transformación
   *
   * @example
   * ```typescript
   * pick("hello").pipe(s => s.toUpperCase()); // "HELLO"
   * pick(5).pipe(n => n * 2); // 10
   * ```
   */
  pipe<E>(transform: (value: T) => E): Pick<E> {
    return new Pick(transform(this.value));
  }

  /**
   * Busca el primer elemento en un array que cumpla con la condición especificada.
   *
   * @param filter - Función que evalúa cada elemento del array
   * @param thisArg - Valor opcional para usar como `this` al ejecutar la función filter
   * @returns Una nueva instancia de Pick con el elemento encontrado, o undefined si no se encuentra o no es un array
   *
   * @example
   * ```typescript
   * pick([1, 2, 3, 4]).find(n => n > 2)?.valueOf(); // 3
   * ```
   */
  find(
    filter: (value: T extends any[] ? T[number] : never) => boolean,
    thisArg?: any,
  ) {
    if (!Utils.isArray(this.value)) return undefined;
    return new Pick<T extends any[] ? T[number] : unknown>(
      this.value.find(filter, thisArg),
    );
  }

  /**
   * Filtra los elementos de un array que cumplen con la condición especificada.
   *
   * @param filter - Función que evalúa cada elemento del array
   * @param thisArg - Valor opcional para usar como `this` al ejecutar la función filter
   * @returns Una nueva instancia de Pick con el array filtrado, o undefined si no es un array
   *
   * @example
   * ```typescript
   * pick([1, 2, 3, 4]).filter(n => n > 2)?.valueOf(); // [3, 4]
   * ```
   */
  filter(
    filter: (value: T extends any[] ? T[number] : never) => boolean,
    thisArg?: any,
  ) {
    if (!Utils.isArray(this.value)) return undefined;
    return new Pick(this.value.filter(filter, thisArg));
  }

  /**
   * Valida que todos los elementos de un array cumplan con una condición de validación.
   *
   * @template R - El tipo del valor resultante después de la validación
   * @param validator - Función de validación que se aplica a cada elemento del array
   * @returns Una nueva instancia de Pick con el array tipado como R[], o undefined si no es un array o algún elemento falla la validación
   *
   * @example
   * ```typescript
   * pick(["hello", "world"]).every(v => v.isString())?.valueOf(); // ["hello", "world"]
   * pick([1, 2, 3]).every(v => v.isString()); // undefined
   * pick(["a", 1]).every(v => v.isString()); // undefined
   * ```
   */
  every<R>(
    validator: (
      value: Pick<T extends any[] ? T[number] : never>,
    ) => undefined | Pick<R>,
  ): undefined | Pick<R[]> {
    if (!Utils.isArray(this.value)) return undefined;

    const results: R[] = [];
    for (const item of this.value) {
      const result = validator(new Pick(item));
      if (result === undefined) {
        return undefined;
      }
      results.push(result.valueOf());
    }

    return new Pick(results);
  }

  /**
   * Intenta aplicar una de las funciones de validación proporcionadas.
   * Retorna el resultado de la primera función que no devuelva undefined.
   *
   * @template Validators - Array de funciones de validación
   * @param validators - Array de funciones de validación a intentar
   * @returns El resultado de la primera validación exitosa, o undefined si todas fallan
   *
   * @example
   * ```typescript
   * pick({ version: "1.0.0" })
   *   .property("version")
   *   ?.oneOf([
   *     (v: Pick<unknown>) => v.isString(),
   *     (v: Pick<unknown>) => v.isNumber()
   *   ])
   *   ?.valueOf(); // "1.0.0"
   *
   * pick({ version: 2 })
   *   .property("version")
   *   ?.oneOf([
   *     (v: Pick<unknown>) => v.isString(),
   *     (v: Pick<unknown>) => v.isNumber()
   *   ])
   *   ?.valueOf(); // 2
   * ```
   */
  oneOf<Validators extends Array<(value: Pick<T>) => undefined | Pick<any>>>(
    validators: Validators,
  ):
    | undefined
    | Pick<
        Validators[number] extends (value: Pick<T>) => undefined | Pick<infer R>
          ? R
          : never
      > {
    for (const validator of validators) {
      const result = validator(this);
      if (result !== undefined) {
        return result as any;
      }
    }
    return undefined;
  }

  /**
   * Valida que el valor actual sea una fecha válida (Date, timestamp o string).
   *
   * @returns Una nueva instancia de DatePick si es una fecha válida, o undefined si no lo es
   *
   * @example
   * ```typescript
   * pick(new Date()).date()?.valueOf(); // Date object
   * pick(1234567890000).date()?.valueOf(); // timestamp
   * pick("2024-01-01").date()?.valueOf(); // "2024-01-01"
   * ```
   */
  date(): undefined | DatePick {
    if (this.value instanceof Date) {
      if (isNaN(this.value.getTime())) return undefined;
      return new DatePick(this.value);
    }
    
    if (typeof this.value === "number") {
      const date = new Date(this.value);
      if (isNaN(date.getTime())) return undefined;
      return new DatePick(this.value);
    }
    
    if (typeof this.value === "string") {
      const date = new Date(this.value);
      if (isNaN(date.getTime())) return undefined;
      return new DatePick(this.value);
    }
    
    return undefined;
  }

  /**
   * Obtiene el valor encapsulado actual.
   *
   * @returns El valor original encapsulado en esta instancia de Pick
   *
   * @example
   * ```typescript
   * pick("hello").valueOf(); // "hello"
   * pick({ name: "John" }).valueOf(); // { name: "John" }
   * ```
   */
  valueOf(): T {
    return this.value;
  }

  static utils = Utils;
}

/**
 * Clase especializada para trabajar con fechas (Date).
 * Extiende Pick<Date | number | string> con métodos específicos para validación de fechas.
 */ 
export class DatePick extends Pick<Date | number | string> {
  #valueDate?: Date;

  private getDate(): Date | undefined {
    if (this.#valueDate !== undefined) {
      return this.#valueDate;
    }

    if (this.value instanceof Date) {
      this.#valueDate = this.value;
      return this.#valueDate;
    }

    const date = new Date(this.value);
    if (isNaN(date.getTime())) return undefined;

    this.#valueDate = date;
    return this.#valueDate;
  }

  /**
   * Valida que la fecha sea posterior a una fecha mínima.
   *
   * @param min - Fecha mínima (puede ser Date, timestamp o string)
   * @returns Esta instancia si la fecha es posterior, o undefined si no cumple
   */
  after(min: Date | number | string): undefined | DatePick {
    const date = this.getDate();
    if (!date) return undefined;
    
    const minDate = new Date(min);
    if (isNaN(minDate.getTime())) return undefined;
    if (date.getTime() <= minDate.getTime()) return undefined;
    return this;
  }

  /**
   * Valida que la fecha sea anterior a una fecha máxima.
   *
   * @param max - Fecha máxima (puede ser Date, timestamp o string)
   * @returns Esta instancia si la fecha es anterior, o undefined si no cumple
   */
  before(max: Date | number | string): undefined | DatePick {
    const date = this.getDate();
    if (!date) return undefined;
    
    const maxDate = new Date(max);
    if (isNaN(maxDate.getTime())) return undefined;
    if (date.getTime() >= maxDate.getTime()) return undefined;
    return this;
  }

  /**
   * Valida que la fecha esté dentro de un rango.
   *
   * @param min - Fecha mínima
   * @param max - Fecha máxima
   * @returns Esta instancia si la fecha está en el rango, o undefined si no cumple
   */
  between(
    min: Date | number | string,
    max: Date | number | string,
  ): undefined | DatePick {
    return this.after(min)?.before(max);
  }

  /**
   * Convierte la fecha a timestamp (número).
   *
   * @returns Una nueva instancia de Pick con el timestamp
   */
  number(): Pick<number> {
    const date = this.getDate();
    if (!date) return new Pick(this.value as number);
    return new Pick(date.getTime());
  }

  /**
   * Convierte el valor a un objeto Date.
   *
   * @returns Una nueva instancia de Pick con el objeto Date
   */
  toDate(): Pick<Date> | undefined {
    const date = this.getDate();
    if (!date) return undefined;
    return new Pick(date);
  }
}

export const pick = <T = unknown>(value: T) => new Pick(value);
pick.utils = Utils;
