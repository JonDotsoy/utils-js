export namespace Utils {
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
