import { expect, it, describe } from "bun:test";
import { Bytes } from "./bytes.js";

describe("bytes", () => {
  it("should convert bytes to kilobytes", () => {
    const bytes = new Bytes(1024);
    expect(bytes.toKilobytes()).toBe(1);
  });

  it("should convert bytes to megabytes", () => {
    const bytes = new Bytes(1024 * 1024);
    expect(bytes.toMegabytes()).toBe(1);
  });

  it("should convert bytes to gigabytes", () => {
    const bytes = new Bytes(1024 * 1024 * 1024);
    expect(bytes.toGigabytes()).toBe(1);
  });

  it("should convert bytes to terabytes", () => {
    const bytes = new Bytes(1024 * 1024 * 1024 * 1024);
    expect(bytes.toTerabytes()).toBe(1);
  });

  it("should convert bytes to petabytes", () => {
    const bytes = new Bytes(1024 * 1024 * 1024 * 1024 * 1024);
    expect(bytes.toPetabytes()).toBe(1);
  });

  it("should return the correct byte value", () => {
    const bytes = new Bytes(12345);
    expect(bytes.toBytes()).toBe(12345);
  });

  it("should create Bytes from bytes", () => {
    const bytes = new Bytes(0).from(1024, "byte");
    expect(bytes.toBytes()).toBe(1024);
  });

  it("should create Bytes from kilobytes", () => {
    const bytes = new Bytes(0).from(1, "kilobyte");
    expect(bytes.toBytes()).toBe(1024);
  });

  it("should create Bytes from megabytes", () => {
    const bytes = new Bytes(0).from(1, "megabyte");
    expect(bytes.toBytes()).toBe(1024 * 1024);
  });

  it("should create Bytes from gigabytes", () => {
    const bytes = new Bytes(0).from(1, "gigabyte");
    expect(bytes.toBytes()).toBe(1024 * 1024 * 1024);
  });

  it("should create Bytes from terabytes", () => {
    const bytes = new Bytes(0).from(1, "terabyte");
    expect(bytes.toBytes()).toBe(1024 * 1024 * 1024 * 1024);
  });

  it("should create Bytes from petabytes", () => {
    const bytes = new Bytes(0).from(1, "petabyte");
    expect(bytes.toBytes()).toBe(1024 * 1024 * 1024 * 1024 * 1024);
  });

  it("should throw an error for invalid unit", () => {
    expect(() => new Bytes(0).from(1, "invalidUnit" as any)).toThrow(
      "Invalid unit type: invalidUnit",
    );
  });

  it("should format bytes to locale string", () => {
    const bytes = new Bytes(123456789);
    expect(bytes.toLocaleString("en-US")).toBe("117.74 MB");
  });

  it("should format kilobytes to locale string", () => {
    const bytes = new Bytes(1024);
    expect(bytes.toLocaleString("en-US")).toBe("1 kB");
  });

  it("should format megabytes to locale string", () => {
    const bytes = new Bytes(1024 * 1024);
    expect(bytes.toLocaleString("en-US")).toBe("1 MB");
  });

  it("should format gigabytes to locale string", () => {
    const bytes = new Bytes(1024 * 1024 * 1024);
    expect(bytes.toLocaleString("en-US")).toBe("1 GB");
  });

  it("should format terabytes to locale string", () => {
    const bytes = new Bytes(1024 * 1024 * 1024 * 1024);
    expect(bytes.toLocaleString("en-US")).toBe("1 TB");
  });

  it("should format petabytes to locale string", () => {
    const bytes = new Bytes(1024 * 1024 * 1024 * 1024 * 1024);
    expect(bytes.toLocaleString("en-US")).toBe("1 PB");
  });

  // it("should format bytes with custom options", () => {
  //   const bytes = new Bytes(123456789);
  //   expect(bytes.toLocaleString("en-US", { unit: "megabyte", decimalPlaces: 2 })).toBe("117.74 MB");
  // });

  it("should format bytes with a different locale", () => {
    const bytes = new Bytes(123456789);
    expect(bytes.toLocaleString("de-DE")).toBe("117,74 MB");
  });
});
