# Pipe Utils

Utilities for data manipulation, encoding, decoding, and hashing using a functional approach with `pipe`.

## Methods

### textToByteEncoding(value: string): Uint8Array

Converts a string to a `Uint8Array` using UTF-8 encoding.

### byteToTextDecoding(value: Uint8Array): string

Converts a `Uint8Array` to a string using UTF-8 decoding.

### toHexString(value: Uint8Array | ArrayBuffer | string): string

Converts a byte array, buffer, or string to its hexadecimal representation (without `0x` prefix).

### toHex(value: Uint8Array | ArrayBuffer | string): bigint

Converts a byte array, buffer, or string to a hexadecimal number (`bigint`).

### hexToByte(hex: string | number | bigint): Uint8Array

Converts a hexadecimal string (with or without `0x` prefix), number, or bigint to a `Uint8Array`.

### digest(algorithm: HashAlgorithm): (value: string | BufferSource) => Promise<ArrayBuffer>

Creates a function to compute the hash using the specified algorithm (`SHA-256`, `SHA-384`, `SHA-512`, `SHA-1`).

### sha256Digest(value: BufferSource): Promise<ArrayBuffer>

SHA-256 hash of the data.

### sha384Digest(value: BufferSource): Promise<ArrayBuffer>

SHA-384 hash of the data.

### sha512Digest(value: BufferSource): Promise<ArrayBuffer>

SHA-512 hash of the data.

### sha1Digest(value: BufferSource): Promise<ArrayBuffer>

SHA-1 hash of the data.

### digestHex(algorithm: HashAlgorithm): (value: string | BufferSource) => Promise<bigint>

Creates a function that computes the hash and returns it as a `bigint`.

## Usage Example

```ts
import { pipe } from "../pipe/pipe.js";
import {
  textToByteEncoding,
  toHexString,
  digest,
  hexToByte,
} from "./pipe-utils.js";

const bytes = await pipe("hola").pipe(textToByteEncoding);
const hex = await pipe(bytes).pipe(toHexString);
const hash = await pipe("hola").pipe(digest("SHA-256"));
const bytesFromHex = await pipe("0x686f6c61").pipe(hexToByte);
```
