import { pipe } from "../pipe/pipe.js";

export type HashAlgorithm = "SHA-256" | "SHA-384" | "SHA-512" | "SHA-1";

/**
 * Encodes a given string into a Uint8Array using UTF-8 encoding.
 *
 * @param value - The string to encode.
 * @returns A Uint8Array containing the UTF-8 encoded bytes of the input string.
 */
export const textToByteEncoding = (value: string) =>
  new TextEncoder().encode(value);

/**
 * Decodes a given Uint8Array into a string using UTF-8 decoding.
 *
 * @param value - The Uint8Array to decode.
 * @returns A string decoded from the input Uint8Array.
 */
export const byteToTextDecoding = (value: Uint8Array) =>
  new TextDecoder().decode(value);

/**
 * Computes the SHA-256 cryptographic hash of the provided input.
 *
 * @param value - The input data to hash, provided as a BufferSource (e.g., ArrayBuffer or TypedArray).
 * @returns A Promise that resolves to an ArrayBuffer containing the SHA-256 digest of the input.
 *
 * @example
 * ```typescript
 * const data = new TextEncoder().encode("hello world");
 * const hashBuffer = await sha256Digest(data);
 * ```
 */
export const sha256Digest = async (value: BufferSource) =>
  digest("SHA-256")(value);

/**
 * Computes the SHA-384 cryptographic hash of the provided input.
 *
 * @param value - The input data to hash, provided as a BufferSource (e.g., ArrayBuffer or TypedArray).
 * @returns A Promise that resolves to an ArrayBuffer containing the SHA-384 digest of the input.
 *
 * @example
 * ```typescript
 * const data = new TextEncoder().encode("hello world");
 * const hashBuffer = await sha384Digest(data);
 * ```
 */
export const sha384Digest = async (value: BufferSource) =>
  digest("SHA-384")(value);

/**
 * Computes the SHA-512 cryptographic hash of the provided input.
 *
 * @param value - The input data to hash, provided as a BufferSource (e.g., ArrayBuffer or TypedArray).
 * @returns A Promise that resolves to an ArrayBuffer containing the SHA-512 digest of the input.
 *
 * @example
 * ```typescript
 * const data = new TextEncoder().encode("hello world");
 * const hashBuffer = await sha512Digest(data);
 * ```
 */
export const sha512Digest = async (value: BufferSource) =>
  digest("SHA-512")(value);

/**
 * Computes the SHA-1 cryptographic hash of the provided input.
 *
 * @param value - The input data to hash, provided as a BufferSource (e.g., ArrayBuffer or TypedArray).
 * @returns A Promise that resolves to an ArrayBuffer containing the SHA-1 digest of the input.
 *
 * @example
 * ```typescript
 * const data = new TextEncoder().encode("hello world");
 * const hashBuffer = await sha1Digest(data);
 * ```
 */
export const sha1Digest = async (value: BufferSource) => digest("SHA-1")(value);

/**
 * Converts a Uint8Array or ArrayBuffer to a hexadecimal string.
 *
 * @param value - The input data as Uint8Array or ArrayBuffer.
 * @returns A string representing the hexadecimal encoding of the input.
 *
 * @example
 * ```typescript
 * const data = new Uint8Array([72, 101, 108, 108, 111]);
 * const hex = toHexString(data); // "48656c6c6f"
 * ```
 */
export const toHexString = (
  value: Uint8Array | ArrayBuffer | string,
): string => {
  let arr: Uint8Array =
    typeof value === "string"
      ? textToByteEncoding(value)
      : value instanceof Uint8Array
        ? value
        : new Uint8Array(value);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

/**
 * Converts a `Uint8Array`, `ArrayBuffer`, or `string` into a single hexadecimal number.
 *
 * If the input is a string, it is first encoded into bytes using `textToByteEncoding`.
 * The bytes are then combined into a single number by shifting and OR-ing each byte.
 *
 * @param value - The input value to convert. Can be a `Uint8Array`, `ArrayBuffer`, or `string`.
 * @returns The resulting number representing the hexadecimal value of the input.
 */
export const toHex = (value: Uint8Array | ArrayBuffer | string): bigint => {
  let arr: Uint8Array =
    typeof value === "string"
      ? textToByteEncoding(value)
      : value instanceof Uint8Array
        ? value
        : new Uint8Array(value);
  return arr.reduce((acc, byte) => (acc << 8n) | BigInt(byte), 0n);
};

/**
 * Converts a hexadecimal string (with or without '0x' prefix) to a Uint8Array.
 *
 * @param hex - The hexadecimal string to convert.
 * @returns A Uint8Array representing the bytes of the hex string.
 *
 * @example
 * hexToByte('0x01020aff') // Uint8Array([1, 2, 10, 255])
 * hexToByte('01020aff')   // Uint8Array([1, 2, 10, 255])
 */
export const hexToByte = (hex: string | number | bigint): Uint8Array => {
  let clean: string;
  if (typeof hex === "number" || typeof hex === "bigint") {
    clean = hex.toString(16);
    if (clean.length % 2 !== 0) clean = "0" + clean;
  } else {
    clean = hex.startsWith("0x") ? hex.slice(2) : hex;
    if (clean.length % 2 !== 0) clean = "0" + clean;
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
  }
  return bytes;
};

/**
 * Creates a digest function using the specified cryptographic hash algorithm.
 *
 * @param algorithm - The hash algorithm to use ("SHA-256", "SHA-384", "SHA-512", or "SHA-1").
 * @returns An asynchronous function that takes a `BufferSource` and returns a `Promise` resolving to the hash as an `ArrayBuffer`.
 *
 * @example
 * ```typescript
 * const sha256Digest = digest("SHA-256");f
 * const hash = await sha256Digest(new TextEncoder().encode("hello"));
 * ```
 */
export const digest =
  (algorithm: HashAlgorithm) =>
  async (value: string | BufferSource): Promise<ArrayBuffer> => {
    const b = typeof value === "string" ? textToByteEncoding(value) : value;
    return await crypto.subtle.digest(algorithm, b);
  };

export const digestHex =
  (algorithm: HashAlgorithm) => (value: string | BufferSource) =>
    pipe(value).pipe(digest(algorithm)).pipe(toHex);
