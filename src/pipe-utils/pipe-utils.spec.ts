import { describe, it, expect } from "bun:test";
import {
  byteToTextDecoding,
  textToByteEncoding,
  digest,
  sha1Digest,
  sha256Digest,
  sha384Digest,
  sha512Digest,
  toHexString,
  toHex,
  hexToByte,
} from "./pipe-utils.js";
import { pipe } from "../pipe/pipe.js";

describe("pipe-utils", () => {
  it("should encode text to bytes using pipe(input).pipe(textToByteEncoding)", async () => {
    const input = "hello world";
    const result = await pipe(input).pipe(textToByteEncoding);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(Array.from(result)).toEqual(
      Array.from(new TextEncoder().encode(input)),
    );
  });
  it("should decode bytes to text using await pipe(input).pipe(byteToTextDecoding)", async () => {
    const input = new TextEncoder().encode("hola mundo");
    const result = await pipe(input).pipe(byteToTextDecoding);
    expect(result).toBe("hola mundo");
  });
  it("should convert bytes to hex string using await pipe(input).pipe(toHexString)", async () => {
    const input = new Uint8Array([1, 2, 10, 255]);
    const result = await pipe(input).pipe(toHexString);
    expect(result).toBe("01020aff");
  });
  it("should convert bytes to number using await pipe(input).pipe(toHex)", async () => {
    // 0x01020aff === 16908799
    const input = new Uint8Array([1, 2, 10, 255]);
    const result = await pipe(input).pipe(toHex);
    expect(result).toBe(0x01020affn);
  });
  it("should convert plain text to number using await pipe(input).pipe(toHex)", async () => {
    // "AB" en UTF-8 es [65, 66] => 0x4142 === 16706
    const input = "AB";
    const result = await pipe(input).pipe(toHex);
    expect(result).toBe(0x4142n);
  });
  it("should hash text using SHA-512 and convert to hex string", async () => {
    const result = await pipe("hello")
      .pipe(digest("SHA-512"))
      .pipe(toHexString);
    expect(result).toEqual(
      "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043",
    );
  });
  it("should hash text using digestHex (SHA-256) and return a bigint", async () => {
    const { digestHex } = await import("./pipe-utils.js");
    const result = await digestHex("SHA-256")("hello");
    // El resultado esperado es el hash SHA-256 de "hello" como bigint
    // Comprobamos que es un bigint y que su representación hexadecimal es la esperada
    expect(typeof result).toBe("bigint");
    // SHA-256("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
    expect(result.toString(16)).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
  });
  it("should hash text using digestHex (SHA-256) and return a bigint using pipe", async () => {
    const { digestHex } = await import("./pipe-utils.js");
    const result = await pipe("hello").pipe(digestHex("SHA-256"));
    expect(typeof result).toBe("bigint");
    expect(result.toString(16)).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
  });
  it("should convert hex string to Uint8Array using hexToByte", () => {
    expect(Array.from(hexToByte("0x01020aff"))).toEqual([1, 2, 10, 255]);
    expect(Array.from(hexToByte("01020aff"))).toEqual([1, 2, 10, 255]);
    expect(Array.from(hexToByte("a"))).toEqual([10]);
    expect(Array.from(hexToByte("0a"))).toEqual([10]);
  });
  it("should convert hex string to Uint8Array using pipe(input).pipe(hexToByte)", async () => {
    const input = "0x01020aff";
    const result = await pipe(input).pipe(hexToByte);
    expect(Array.from(result)).toEqual([1, 2, 10, 255]);
  });
  it("should convert number to Uint8Array using hexToByte", () => {
    expect(Array.from(hexToByte(0x01020aff))).toEqual([1, 2, 10, 255]);
    expect(Array.from(hexToByte(0xa))).toEqual([10]);
    expect(Array.from(hexToByte(0x0a))).toEqual([10]);
    expect(Array.from(hexToByte(0x4142))).toEqual([65, 66]);
  });
  it("should convert bigint to Uint8Array using hexToByte", () => {
    expect(Array.from(hexToByte(0x01020affn))).toEqual([1, 2, 10, 255]);
    expect(Array.from(hexToByte(0xan))).toEqual([10]);
    expect(Array.from(hexToByte(0x0an))).toEqual([10]);
    expect(Array.from(hexToByte(0x4142n))).toEqual([65, 66]);
  });
});
