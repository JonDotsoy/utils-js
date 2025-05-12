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
    const bytes = Bytes.from(1024, "byte");
    expect(bytes.toBytes()).toBe(1024);
  });

  it("should create Bytes from kilobytes", () => {
    const bytes = Bytes.from(1, "kilobyte");
    expect(bytes.toBytes()).toBe(1024);
  });

  it("should create Bytes from megabytes", () => {
    const bytes = Bytes.from(1, "megabyte");
    expect(bytes.toBytes()).toBe(1024 * 1024);
  });

  it("should create Bytes from gigabytes", () => {
    const bytes = Bytes.from(1, "gigabyte");
    expect(bytes.toBytes()).toBe(1024 * 1024 * 1024);
  });

  it("should create Bytes from terabytes", () => {
    const bytes = Bytes.from(1, "terabyte");
    expect(bytes.toBytes()).toBe(1024 * 1024 * 1024 * 1024);
  });

  it("should create Bytes from petabytes", () => {
    const bytes = Bytes.from(1, "petabyte");
    expect(bytes.toBytes()).toBe(1024 * 1024 * 1024 * 1024 * 1024);
  });

  it("should throw an error for invalid unit", () => {
    expect(() => Bytes.from(1, "invalidUnit" as any)).toThrow(
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

  it("should parse '1mb' as 1 megabyte in bytes", () => {
    const result = Bytes.from("1mb");
    expect(result.toBytes()).toBe(1048576); // 1 MB in bytes
  });

  it("should parse '1kb' as 1 kilobyte in bytes", () => {
    const result = Bytes.from("1kb");
    expect(result.toBytes()).toBe(1024); // 1 KB in bytes
  });

  it("should parse '20' as 20 bytes", () => {
    const result = Bytes.from("20");
    expect(result.toBytes()).toBe(20); // 20 bytes
  });

  it("should parse '20b' as 20 bytes", () => {
    const result = Bytes.from("20b");
    expect(result.toBytes()).toBe(20); // 20 bytes
  });

  it("should parse '10 gigabytes' as 10 gigabytes in bytes", () => {
    const result = Bytes.from("10 gigabytes");
    expect(result.toBytes()).toBe(10737418240); // 10 GB in bytes
  });

  it("should parse '10 kb' as 10 kilobytes in bytes", () => {
    const result = Bytes.from("10 kb");
    expect(result.toBytes()).toBe(10240); // 10 KB in bytes
  });

  it("should parse '5tb' as 5 terabytes in bytes", () => {
    const result = Bytes.from("5tb");
    expect(result.toBytes()).toBe(5497558138880); // 5 TB in bytes
  });

  it("should parse '2 petabytes' as 2 petabytes in bytes", () => {
    const result = Bytes.from("2 petabytes");
    expect(result.toBytes()).toBe(2251799813685248); // 2 PB in bytes
  });

  it("should parse '0.5mb' as 0.5 megabytes in bytes", () => {
    const result = Bytes.from("0.5mb");
    expect(result.toBytes()).toBe(524288); // 0.5 MB in bytes
  });

  it("should parse '100 bytes' as 100 bytes", () => {
    const result = Bytes.from("100 bytes");
    expect(result.toBytes()).toBe(100); // 100 bytes
  });

  it("should parse '1.5gb' as 1.5 gigabytes in bytes", () => {
    const result = Bytes.from("1.5gb");
    expect(result.toBytes()).toBe(1610612736); // 1.5 GB in bytes
  });

  it("should parse '1 kilobyte' as 1 kilobyte in bytes", () => {
    const result = Bytes.from("1 kilobyte");
    expect(result.toBytes()).toBe(1024); // 1 KB in bytes
  });

  it("should throw an error for invalid input", () => {
    expect(() => Bytes.from("invalid")).toThrowError("Invalid byte format");
  });

  it("should throw an error for empty input", () => {
    expect(() => Bytes.from("")).toThrowError("Invalid byte format");
  });

  it("should create Bytes from 10 bytes", () => {
    const bytes = Bytes.from(10, "byte");
    expect(bytes.toBytes()).toBe(10);
  });
});
