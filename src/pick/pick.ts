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
   * @returns Una nueva instancia de StringPick con el valor tipado como string, o undefined si no es un string
   *
   * @example
   * ```typescript
   * pick("hello").string()?.valueOf(); // "hello"
   * pick(123).string(); // undefined
   * ```
   */
  string(): undefined | StringPick {
    if (!Utils.isString(this.value)) return undefined;
    return new StringPick(this.value);
  }

  /** @deprecated Use string() instead */
  isString(): undefined | StringPick {
    return this.string();
  }

  /**
   * Valida que el valor actual sea un number.
   *
   * @returns Una nueva instancia de NumberPick con el valor tipado como number, o undefined si no es un number
   *
   * @example
   * ```typescript
   * pick(123).number()?.valueOf(); // 123
   * pick("hello").number(); // undefined
   * ```
   */
  number(): undefined | NumberPick {
    if (!Utils.isNumber(this.value)) return undefined;
    return new NumberPick(this.value);
  }

  /** @deprecated Use number() instead */
  isNumber(): undefined | NumberPick {
    return this.number();
  }

  /**
   * Valida que el valor actual sea un número entero.
   *
   * @returns Una nueva instancia de IntegerPick con el valor tipado como number, o undefined si no es un entero
   *
   * @example
   * ```typescript
   * pick(42).integer()?.valueOf(); // 42
   * pick(3.14).integer(); // undefined
   * pick("hello").integer(); // undefined
   * ```
   */
  integer(): undefined | IntegerPick {
    if (!Utils.isNumber(this.value)) return undefined;
    if (!Number.isInteger(this.value)) return undefined;
    return new IntegerPick(this.value);
  }

  /** @deprecated Use integer() instead */
  isInteger(): undefined | IntegerPick {
    return this.integer();
  }

  /**
   * Valida que el valor actual sea un bigint.
   *
   * @returns Una nueva instancia de BigIntPick con el valor tipado como bigint, o undefined si no es un bigint
   *
   * @example
   * ```typescript
   * pick(123n).bigInt()?.valueOf(); // 123n
   * pick(123).bigInt(); // undefined
   * ```
   */
  bigInt(): undefined | BigIntPick {
    if (typeof this.value !== "bigint") return undefined;
    return new BigIntPick(this.value);
  }

  /** @deprecated Use bigInt() instead */
  isBigInt(): undefined | BigIntPick {
    return this.bigInt();
  }

  /**
   * Valida que el valor actual sea un boolean.
   *
   * @returns Una nueva instancia de BooleanPick con el valor tipado como boolean, o undefined si no es un boolean
   *
   * @example
   * ```typescript
   * pick(true).boolean()?.valueOf(); // true
   * pick(1).boolean(); // undefined
   * ```
   */
  boolean(): undefined | BooleanPick {
    if (!Utils.isBoolean(this.value)) return undefined;
    return new BooleanPick(this.value);
  }

  /** @deprecated Use boolean() instead */
  isBoolean(): undefined | BooleanPick {
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
   * @returns Una nueva instancia de ArrayPick con el valor tipado como Array, o undefined si no es un array
   *
   * @example
   * ```typescript
   * pick([1, 2, 3]).array()?.valueOf(); // [1, 2, 3]
   * pick("hello").array(); // undefined
   * ```
   */
  array(): undefined | ArrayPick<unknown> {
    if (!Utils.isArray(this.value)) return undefined;
    return new ArrayPick(this.value);
  }

  /** @deprecated Use array() instead */
  isArray(): undefined | ArrayPick<unknown> {
    return this.array();
  }

  /**
   * Valida que el valor actual sea un objeto (Record).
   *
   * @returns Una nueva instancia de RecordPick con el valor tipado como Record, o undefined si no es un objeto
   *
   * @example
   * ```typescript
   * pick({ name: "John" }).record()?.valueOf(); // { name: "John" }
   * pick(null).record(); // undefined
   * ```
   */
  record(): undefined | RecordPick {
    if (!Utils.isRecord(this.value)) return undefined;
    return new RecordPick(this.value);
  }

  /** @deprecated Use record() instead */
  isRecord(): undefined | RecordPick {
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
 * Clase especializada para trabajar con enteros.
 * Extiende NumberPick con validaciones específicas para números enteros.
 */
export class IntegerPick extends Pick<number> {
  /**
   * Valida que el entero sea mayor que el valor especificado.
   *
   * @param min - Valor mínimo (exclusivo)
   * @returns Esta instancia si cumple, o undefined si no
   */
  gt(min: number): undefined | IntegerPick {
    if (this.value <= min) return undefined;
    return this;
  }

  /**
   * Valida que el entero sea mayor o igual que el valor especificado.
   *
   * @param min - Valor mínimo (inclusivo)
   * @returns Esta instancia si cumple, o undefined si no
   */
  gte(min: number): undefined | IntegerPick {
    if (this.value < min) return undefined;
    return this;
  }

  /**
   * Valida que el entero sea menor que el valor especificado.
   *
   * @param max - Valor máximo (exclusivo)
   * @returns Esta instancia si cumple, o undefined si no
   */
  lt(max: number): undefined | IntegerPick {
    if (this.value >= max) return undefined;
    return this;
  }

  /**
   * Valida que el entero sea menor o igual que el valor especificado.
   *
   * @param max - Valor máximo (inclusivo)
   * @returns Esta instancia si cumple, o undefined si no
   */
  lte(max: number): undefined | IntegerPick {
    if (this.value > max) return undefined;
    return this;
  }

  /**
   * Valida que el entero esté dentro de un rango.
   *
   * @param min - Valor mínimo (inclusivo)
   * @param max - Valor máximo (inclusivo)
   * @returns Esta instancia si cumple, o undefined si no
   */
  between(min: number, max: number): undefined | IntegerPick {
    if (this.value < min || this.value > max) return undefined;
    return this;
  }

  /**
   * Valida que el entero sea positivo (mayor que 0).
   *
   * @returns Esta instancia si es positivo, o undefined si no
   */
  positive(): undefined | IntegerPick {
    if (this.value <= 0) return undefined;
    return this;
  }

  /**
   * Valida que el entero sea negativo (menor que 0).
   *
   * @returns Esta instancia si es negativo, o undefined si no
   */
  negative(): undefined | IntegerPick {
    if (this.value >= 0) return undefined;
    return this;
  }

  /**
   * Valida que el entero sea un múltiplo del valor especificado.
   *
   * @param divisor - El divisor
   * @returns Esta instancia si es múltiplo, o undefined si no
   */
  multipleOf(divisor: number): undefined | IntegerPick {
    if (this.value % divisor !== 0) return undefined;
    return this;
  }

  /**
   * Valida que el entero sea par.
   *
   * @returns Esta instancia si es par, o undefined si no
   */
  even(): undefined | IntegerPick {
    if (this.value % 2 !== 0) return undefined;
    return this;
  }

  /**
   * Valida que el entero sea impar.
   *
   * @returns Esta instancia si es impar, o undefined si no
   */
  odd(): undefined | IntegerPick {
    if (this.value % 2 === 0) return undefined;
    return this;
  }
}

/**
 * Clase especializada para trabajar con bigints.
 * Extiende Pick<bigint> con métodos específicos para validación de bigints.
 */
export class BigIntPick extends Pick<bigint> {
  /**
   * Valida que el bigint sea mayor que el valor especificado.
   *
   * @param min - Valor mínimo (exclusivo)
   * @returns Esta instancia si cumple, o undefined si no
   */
  gt(min: bigint): undefined | BigIntPick {
    if (this.value <= min) return undefined;
    return this;
  }

  /**
   * Valida que el bigint sea mayor o igual que el valor especificado.
   *
   * @param min - Valor mínimo (inclusivo)
   * @returns Esta instancia si cumple, o undefined si no
   */
  gte(min: bigint): undefined | BigIntPick {
    if (this.value < min) return undefined;
    return this;
  }

  /**
   * Valida que el bigint sea menor que el valor especificado.
   *
   * @param max - Valor máximo (exclusivo)
   * @returns Esta instancia si cumple, o undefined si no
   */
  lt(max: bigint): undefined | BigIntPick {
    if (this.value >= max) return undefined;
    return this;
  }

  /**
   * Valida que el bigint sea menor o igual que el valor especificado.
   *
   * @param max - Valor máximo (inclusivo)
   * @returns Esta instancia si cumple, o undefined si no
   */
  lte(max: bigint): undefined | BigIntPick {
    if (this.value > max) return undefined;
    return this;
  }

  /**
   * Valida que el bigint esté dentro de un rango.
   *
   * @param min - Valor mínimo (inclusivo)
   * @param max - Valor máximo (inclusivo)
   * @returns Esta instancia si cumple, o undefined si no
   */
  between(min: bigint, max: bigint): undefined | BigIntPick {
    if (this.value < min || this.value > max) return undefined;
    return this;
  }

  /**
   * Valida que el bigint sea positivo (mayor que 0n).
   *
   * @returns Esta instancia si es positivo, o undefined si no
   */
  positive(): undefined | BigIntPick {
    if (this.value <= 0n) return undefined;
    return this;
  }

  /**
   * Valida que el bigint sea negativo (menor que 0n).
   *
   * @returns Esta instancia si es negativo, o undefined si no
   */
  negative(): undefined | BigIntPick {
    if (this.value >= 0n) return undefined;
    return this;
  }
}

/**
 * Clase especializada para trabajar con booleanos.
 * Extiende Pick<boolean> con métodos específicos para validación de booleanos.
 */
export class BooleanPick extends Pick<boolean> {
  /**
   * Valida que el valor sea true.
   *
   * @returns Esta instancia si es true, o undefined si no
   */
  true(): undefined | BooleanPick {
    if (this.value !== true) return undefined;
    return this;
  }

  /**
   * Valida que el valor sea false.
   *
   * @returns Esta instancia si es false, o undefined si no
   */
  false(): undefined | BooleanPick {
    if (this.value !== false) return undefined;
    return this;
  }

  /**
   * Invierte el valor booleano.
   *
   * @returns Una nueva instancia de BooleanPick con el valor invertido
   */
  not(): BooleanPick {
    return new BooleanPick(!this.value);
  }
}

/**
 * Clase especializada para trabajar con arrays.
 * Extiende Pick<Array<T>> con métodos específicos para validación y manipulación de arrays.
 */
export class ArrayPick<T = unknown> extends Pick<Array<T>> {
  /**
   * Valida que el array tenga una longitud mínima.
   *
   * @param min - Longitud mínima (inclusiva)
   * @returns Esta instancia si cumple, o undefined si no
   */
  minLength(min: number): undefined | ArrayPick<T> {
    if (this.value.length < min) return undefined;
    return this;
  }

  /**
   * Valida que el array tenga una longitud máxima.
   *
   * @param max - Longitud máxima (inclusiva)
   * @returns Esta instancia si cumple, o undefined si no
   */
  maxLength(max: number): undefined | ArrayPick<T> {
    if (this.value.length > max) return undefined;
    return this;
  }

  /**
   * Valida que el array tenga una longitud exacta.
   *
   * @param length - Longitud exacta
   * @returns Esta instancia si cumple, o undefined si no
   */
  length(length: number): undefined | ArrayPick<T> {
    if (this.value.length !== length) return undefined;
    return this;
  }

  /**
   * Valida que el array no esté vacío.
   *
   * @returns Esta instancia si no está vacío, o undefined si está vacío
   */
  notEmpty(): undefined | ArrayPick<T> {
    if (this.value.length === 0) return undefined;
    return this;
  }

  /**
   * Valida que el array contenga un elemento específico.
   *
   * @param item - Elemento a buscar
   * @returns Esta instancia si contiene el elemento, o undefined si no
   */
  includes(item: T): undefined | ArrayPick<T> {
    if (!this.value.includes(item)) return undefined;
    return this;
  }

  /**
   * Obtiene el primer elemento del array.
   *
   * @returns Una nueva instancia de Pick con el primer elemento, o undefined si está vacío
   */
  first(): Pick<T> | undefined {
    if (this.value.length === 0) return undefined;
    return new Pick(this.value[0]);
  }

  /**
   * Obtiene el último elemento del array.
   *
   * @returns Una nueva instancia de Pick con el último elemento, o undefined si está vacío
   */
  last(): Pick<T> | undefined {
    if (this.value.length === 0) return undefined;
    return new Pick(this.value[this.value.length - 1]);
  }

  /**
   * Obtiene un elemento en un índice específico.
   *
   * @param index - Índice del elemento
   * @returns Una nueva instancia de Pick con el elemento, o undefined si el índice no existe
   */
  at(index: number): Pick<T> | undefined {
    const item = this.value.at(index);
    if (item === undefined) return undefined;
    return new Pick(item);
  }
}

/**
 * Clase especializada para trabajar con objetos (Records).
 * Extiende Pick<Record<string, unknown>> con métodos específicos para validación de objetos.
 */
export class RecordPick extends Pick<Record<string, unknown>> {
  /**
   * Valida que el objeto tenga una clave específica.
   *
   * @param key - Clave a buscar
   * @returns Esta instancia si tiene la clave, o undefined si no
   */
  hasKey(key: string): undefined | RecordPick {
    if (!(key in this.value)) return undefined;
    return this;
  }

  /**
   * Valida que el objeto tenga todas las claves especificadas.
   *
   * @param keys - Array de claves a buscar
   * @returns Esta instancia si tiene todas las claves, o undefined si falta alguna
   */
  hasKeys(keys: string[]): undefined | RecordPick {
    for (const key of keys) {
      if (!(key in this.value)) return undefined;
    }
    return this;
  }

  /**
   * Valida que el objeto no esté vacío.
   *
   * @returns Esta instancia si no está vacío, o undefined si está vacío
   */
  notEmpty(): undefined | RecordPick {
    if (Object.keys(this.value).length === 0) return undefined;
    return this;
  }

  /**
   * Obtiene las claves del objeto.
   *
   * @returns Una nueva instancia de ArrayPick con las claves
   */
  keys(): ArrayPick<string> {
    return new ArrayPick(Object.keys(this.value));
  }

  /**
   * Obtiene los valores del objeto.
   *
   * @returns Una nueva instancia de ArrayPick con los valores
   */
  values(): ArrayPick<unknown> {
    return new ArrayPick(Object.values(this.value));
  }

  /**
   * Valida que el objeto tenga un número mínimo de claves.
   *
   * @param min - Número mínimo de claves
   * @returns Esta instancia si cumple, o undefined si no
   */
  minKeys(min: number): undefined | RecordPick {
    if (Object.keys(this.value).length < min) return undefined;
    return this;
  }

  /**
   * Valida que el objeto tenga un número máximo de claves.
   *
   * @param max - Número máximo de claves
   * @returns Esta instancia si cumple, o undefined si no
   */
  maxKeys(max: number): undefined | RecordPick {
    if (Object.keys(this.value).length > max) return undefined;
    return this;
  }
}

/**
 * Clase especializada para trabajar con strings.
 * Extiende Pick<string> con métodos específicos para validación y manipulación de strings.
 */
export class StringPick extends Pick<string> {
  /**
   * Valida que el string tenga una longitud mínima.
   *
   * @param min - Longitud mínima (inclusiva)
   * @returns Esta instancia si cumple, o undefined si no
   */
  minLength(min: number): undefined | StringPick {
    if (this.value.length < min) return undefined;
    return this;
  }

  /**
   * Valida que el string tenga una longitud máxima.
   *
   * @param max - Longitud máxima (inclusiva)
   * @returns Esta instancia si cumple, o undefined si no
   */
  maxLength(max: number): undefined | StringPick {
    if (this.value.length > max) return undefined;
    return this;
  }

  /**
   * Valida que el string tenga una longitud exacta.
   *
   * @param length - Longitud exacta
   * @returns Esta instancia si cumple, o undefined si no
   */
  length(length: number): undefined | StringPick {
    if (this.value.length !== length) return undefined;
    return this;
  }

  /**
   * Valida que el string coincida con una expresión regular.
   *
   * @param pattern - Expresión regular o string
   * @returns Esta instancia si coincide, o undefined si no
   */
  matches(pattern: RegExp | string): undefined | StringPick {
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
    if (!regex.test(this.value)) return undefined;
    return this;
  }

  /**
   * Valida que el string comience con un prefijo específico.
   *
   * @param prefix - Prefijo a buscar
   * @returns Esta instancia si comienza con el prefijo, o undefined si no
   */
  startsWith(prefix: string): undefined | StringPick {
    if (!this.value.startsWith(prefix)) return undefined;
    return this;
  }

  /**
   * Valida que el string termine con un sufijo específico.
   *
   * @param suffix - Sufijo a buscar
   * @returns Esta instancia si termina con el sufijo, o undefined si no
   */
  endsWith(suffix: string): undefined | StringPick {
    if (!this.value.endsWith(suffix)) return undefined;
    return this;
  }

  /**
   * Valida que el string contenga un substring específico.
   *
   * @param substring - Substring a buscar
   * @returns Esta instancia si contiene el substring, o undefined si no
   */
  includes(substring: string): undefined | StringPick {
    if (!this.value.includes(substring)) return undefined;
    return this;
  }

  /**
   * Valida que el string no esté vacío.
   *
   * @returns Esta instancia si no está vacío, o undefined si está vacío
   */
  notEmpty(): undefined | StringPick {
    if (this.value.length === 0) return undefined;
    return this;
  }

  /**
   * Valida que el string sea un email válido.
   *
   * @returns Esta instancia si es un email válido, o undefined si no
   */
  email(): undefined | StringPick {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.value)) return undefined;
    return this;
  }

  /**
   * Valida que el string sea una URL válida.
   *
   * @returns Esta instancia si es una URL válida, o undefined si no
   */
  url(): undefined | StringPick {
    try {
      new URL(this.value);
      return this;
    } catch {
      return undefined;
    }
  }

  /**
   * Transforma el string a mayúsculas.
   *
   * @returns Una nueva instancia de StringPick con el string en mayúsculas
   */
  toUpperCase(): StringPick {
    return new StringPick(this.value.toUpperCase());
  }

  /**
   * Transforma el string a minúsculas.
   *
   * @returns Una nueva instancia de StringPick con el string en minúsculas
   */
  toLowerCase(): StringPick {
    return new StringPick(this.value.toLowerCase());
  }

  /**
   * Elimina espacios en blanco al inicio y final del string.
   *
   * @returns Una nueva instancia de StringPick con el string sin espacios
   */
  trim(): StringPick {
    return new StringPick(this.value.trim());
  }
}

/**
 * Clase especializada para trabajar con números.
 * Extiende Pick<number> con métodos específicos para validación de números.
 */
export class NumberPick extends Pick<number> {
  /**
   * Valida que el número sea mayor que el valor especificado.
   *
   * @param min - Valor mínimo (exclusivo)
   * @returns Esta instancia si cumple, o undefined si no
   */
  gt(min: number): undefined | NumberPick {
    if (this.value <= min) return undefined;
    return this;
  }

  /**
   * Valida que el número sea mayor o igual que el valor especificado.
   *
   * @param min - Valor mínimo (inclusivo)
   * @returns Esta instancia si cumple, o undefined si no
   */
  gte(min: number): undefined | NumberPick {
    if (this.value < min) return undefined;
    return this;
  }

  /**
   * Valida que el número sea menor que el valor especificado.
   *
   * @param max - Valor máximo (exclusivo)
   * @returns Esta instancia si cumple, o undefined si no
   */
  lt(max: number): undefined | NumberPick {
    if (this.value >= max) return undefined;
    return this;
  }

  /**
   * Valida que el número sea menor o igual que el valor especificado.
   *
   * @param max - Valor máximo (inclusivo)
   * @returns Esta instancia si cumple, o undefined si no
   */
  lte(max: number): undefined | NumberPick {
    if (this.value > max) return undefined;
    return this;
  }

  /**
   * Valida que el número esté dentro de un rango.
   *
   * @param min - Valor mínimo (inclusivo)
   * @param max - Valor máximo (inclusivo)
   * @returns Esta instancia si cumple, o undefined si no
   */
  between(min: number, max: number): undefined | NumberPick {
    if (this.value < min || this.value > max) return undefined;
    return this;
  }

  /**
   * Valida que el número sea positivo (mayor que 0).
   *
   * @returns Esta instancia si es positivo, o undefined si no
   */
  positive(): undefined | NumberPick {
    if (this.value <= 0) return undefined;
    return this;
  }

  /**
   * Valida que el número sea negativo (menor que 0).
   *
   * @returns Esta instancia si es negativo, o undefined si no
   */
  negative(): undefined | NumberPick {
    if (this.value >= 0) return undefined;
    return this;
  }

  /**
   * Valida que el número sea un entero.
   *
   * @returns Una nueva instancia de IntegerPick si es entero, o undefined si no
   */
  integer(): undefined | IntegerPick {
    if (!Number.isInteger(this.value)) return undefined;
    return new IntegerPick(this.value);
  }

  /**
   * Valida que el número sea finito.
   *
   * @returns Esta instancia si es finito, o undefined si no
   */
  finite(): undefined | NumberPick {
    if (!Number.isFinite(this.value)) return undefined;
    return this;
  }

  /**
   * Valida que el número sea un múltiplo del valor especificado.
   *
   * @param divisor - El divisor
   * @returns Esta instancia si es múltiplo, o undefined si no
   */
  multipleOf(divisor: number): undefined | NumberPick {
    if (this.value % divisor !== 0) return undefined;
    return this;
  }
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
   * @returns Una nueva instancia de NumberPick con el timestamp
   */
  number(): NumberPick {
    const date = this.getDate();
    if (!date) return new NumberPick(this.value as number);
    return new NumberPick(date.getTime());
  }

  /**
   * Convierte el valor a un objeto Date.
   *
   * @returns Una nueva instancia de DatePick con el objeto Date
   */
  toDate(): DatePick | undefined {
    const date = this.getDate();
    if (!date) return undefined;
    return new DatePick(date);
  }
}

export const pick = <T = unknown>(value: T) => new Pick(value);
pick.utils = Utils;
