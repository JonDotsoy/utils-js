/**
 * Type validators namespace containing utility functions for runtime type checking.
 * Provides type guards and validation functions for primitive types, objects, and complex structures.
 */
export namespace typeValidators {
  /**
   * Checks if the given data is an object (excluding arrays and null).
   * @param data - The data to check
   * @returns True if data is an object, false otherwise
   */
  export const isObject = (data: unknown): data is Record<string, unknown> =>
    typeof data === "object" && data !== null && !Array.isArray(data);

  /**
   * Checks if the given data is a string.
   * @param data - The data to check
   * @returns True if data is a string, false otherwise
   */
  export const isString = (data: unknown): data is string =>
    typeof data === "string";

  /**
   * Checks if the given data is a number.
   * @param data - The data to check
   * @returns True if data is a number, false otherwise
   */
  export const isNumber = (data: unknown): data is number =>
    typeof data === "number";

  /**
   * Checks if the given data is a boolean.
   * @param data - The data to check
   * @returns True if data is a boolean, false otherwise
   */
  export const isBoolean = (data: unknown): data is boolean =>
    typeof data === "boolean";

  /**
   * Checks if the given data is null.
   * @param data - The data to check
   * @returns True if data is null, false otherwise
   */
  export const isNull = (data: unknown): data is null => data === null;

  /**
   * Checks if the given data is undefined.
   * @param data - The data to check
   * @returns True if data is undefined, false otherwise
   */
  export const isUndefined = (data: unknown): data is undefined =>
    typeof data === "undefined";

  /**
   * Checks if the given data is an array.
   * @param data - The data to check
   * @returns True if data is an array, false otherwise
   */
  export const isArray = (data: unknown): data is unknown[] =>
    Array.isArray(data);
  /**
   * Checks if an object has a specific key.
   * @param obj - The object to check
   * @param key - The key to look for
   * @returns True if the object has the key, false otherwise
   */
  export const hasKey = <I extends object, T extends string>(
    obj: I,
    key: T,
  ): obj is I & Record<T, unknown> =>
    Object.prototype.hasOwnProperty.call(obj, key);

  /**
   * Checks if an object has a specific key with a string value.
   * @param obj - The object to check
   * @param key - The key to look for
   * @returns True if the object has the key and its value is a string, false otherwise
   */
  export const keyIsString = <I extends object, T extends string>(
    obj: I,
    key: T,
  ): obj is I & Record<T, string> => hasKey(obj, key) && isString(obj[key]);

  /**
   * Checks if an object has a specific key with a number value.
   * @param obj - The object to check
   * @param key - The key to look for
   * @returns True if the object has the key and its value is a number, false otherwise
   */
  export const keyIsNumber = <I extends object, T extends string>(
    obj: I,
    key: T,
  ): obj is I & Record<T, number> => hasKey(obj, key) && isNumber(obj[key]);

  /**
   * Checks if an object has a specific key with a boolean value.
   * @param obj - The object to check
   * @param key - The key to look for
   * @returns True if the object has the key and its value is a boolean, false otherwise
   */
  export const keyIsBoolean = <I extends object, T extends string>(
    obj: I,
    key: T,
  ): obj is I & Record<T, boolean> => hasKey(obj, key) && isBoolean(obj[key]);

  /**
   * Checks if an object has a specific key with a null value.
   * @param obj - The object to check
   * @param key - The key to look for
   * @returns True if the object has the key and its value is null, false otherwise
   */
  export const keyIsNull = <I extends object, T extends string>(
    obj: I,
    key: T,
  ): obj is I & Record<T, null> => hasKey(obj, key) && isNull(obj[key]);

  /**
   * Checks if an object has a specific key with an undefined value.
   * @param obj - The object to check
   * @param key - The key to look for
   * @returns True if the object has the key and its value is undefined, false otherwise
   */
  export const keyIsUndefined = <I extends object, T extends string>(
    obj: I,
    key: T,
  ): obj is I & Record<T, undefined> =>
    hasKey(obj, key) && isUndefined(obj[key]);

  /**
   * Checks if an object has a specific key with an array value.
   * @param obj - The object to check
   * @param key - The key to look for
   * @returns True if the object has the key and its value is an array, false otherwise
   */
  export const keyIsArray = <I extends object, T extends string>(
    obj: I,
    key: T,
  ): obj is I & Record<T, unknown[]> => hasKey(obj, key) && isArray(obj[key]);

  /**
   * Checks if an object has a specific key with an object value.
   * @param obj - The object to check
   * @param key - The key to look for
   * @returns True if the object has the key and its value is an object, false otherwise
   */
  export const keyIsObject = <I extends object, T extends string>(
    obj: I,
    key: T,
  ): obj is I & Record<T, object> => hasKey(obj, key) && isObject(obj[key]);
  /**
   * Validates if the given data is a JSON-RPC 2.0 request payload.
   * @param data - The data to validate
   * @returns True if data is a valid JSON-RPC request payload, false otherwise
   */
  export const isJsonRpcRequestPayload = (
    data: unknown,
  ): data is {
    jsonrpc: "2.0";
    id: string;
    method: string;
    params: unknown;
  } => {
    if (!isObject(data)) return false;
    // check version 2.0
    if (!hasKey(data, "jsonrpc") || data.jsonrpc !== "2.0") return false;
    if (!hasKey(data, "id") || !isString(data.id)) return false;
    if (!hasKey(data, "method") || !isString(data.method)) return false;
    if (!hasKey(data, "params")) return false;
    return true;
  };

  /**
   * Validates if the given data is a JSON-RPC 2.0 result payload.
   * @param data - The data to validate
   * @returns True if data is a valid JSON-RPC result payload, false otherwise
   */
  export const isJsonRpcResultPayload = (
    data: unknown,
  ): data is { jsonrpc: "2.0"; id: string; result: unknown } => {
    if (!isObject(data)) return false;
    // check version 2.0
    if (!hasKey(data, "jsonrpc") || data.jsonrpc !== "2.0") return false;
    if (!hasKey(data, "id") || !isString(data.id)) return false;
    if (!hasKey(data, "result")) return false;
    return true;
  };

  /**
   * Validates if the given data is a JSON-RPC 2.0 error payload.
   * @param data - The data to validate
   * @returns True if data is a valid JSON-RPC error payload, false otherwise
   */
  export const isJsonRpcErrorPayload = (
    data: unknown,
  ): data is {
    jsonrpc: "2.0";
    id: string;
    error: { code: number; message: string; data?: unknown };
  } => {
    if (!isObject(data)) return false;
    // check version 2.0
    if (!hasKey(data, "jsonrpc") || data.jsonrpc !== "2.0") return false;
    if (!hasKey(data, "id") || !isString(data.id)) return false;
    if (!hasKey(data, "error") || !isObject(data.error)) return false;
    if (!hasKey(data.error, "code") || !isNumber(data.error.code)) return false;
    if (!hasKey(data.error, "message") || !isString(data.error.message))
      return false;
    if (hasKey(data.error, "data") && !("data" in data.error)) return false;
    return true;
  };

  /**
   * Validates if the given data is a message object with the expected structure.
   * @param data - The data to validate
   * @returns True if data is a valid message object, false otherwise
   */
  export const isMessage = (
    data: unknown,
  ): data is {
    id: string;
    data: object;
    createdAt: number;
    acknowledgedAt?: null | number;
    ttl?: null | number;
  } => {
    if (!isObject(data)) return false;
    if (!hasKey(data, "id") || !isString(data.id)) return false;
    if (!hasKey(data, "data") || !isObject(data.data)) return false;
    if (!hasKey(data, "createdAt") || !isNumber(data.createdAt)) return false;
    if (
      !hasKey(data, "acknowledgedAt") ||
      !(isNull(data.acknowledgedAt) || isNumber(data.acknowledgedAt))
    )
      return false;
    if (hasKey(data, "ttl") && !(isNull(data.ttl) || isNumber(data.ttl)))
      return false;
    return true;
  };
}
