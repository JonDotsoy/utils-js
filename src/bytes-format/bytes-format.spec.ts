import { describe, it, expect } from "bun:test";
import { BytesFormat } from "./bytes-format.js";

describe("BytesFormat", () => {
  it("should format bytes to kilobytes", () => {
    const formatter = new BytesFormat("en-US");
    const result = formatter.format(2048); // 2 KB
    expect(result).toBe("2 kB");
  });

  it("should format bytes to megabytes", () => {
    const formatter = new BytesFormat("en-US");
    const result = formatter.format(1048576); // 1 MB
    expect(result).toBe("1 MB");
  });

  it("should format bytes to gigabytes", () => {
    const formatter = new BytesFormat("en-US");
    const result = formatter.format(1073741824); // 1 GB
    expect(result).toBe("1 GB");
  });

  it("should format bytes to terabytes", () => {
    const formatter = new BytesFormat("en-US");
    const result = formatter.format(1099511627776); // 1 TB
    expect(result).toBe("1 TB");
  });

  it("should format bytes to petabytes", () => {
    const formatter = new BytesFormat("en-US");
    const result = formatter.format(1125899906842624); // 1 PB
    expect(result).toBe("1 PB");
  });

  it("should format bytes less than 1 KB correctly", () => {
    const formatter = new BytesFormat("en-US");
    const result = formatter.format(512); // 512 bytes
    expect(result).toBe("512 byte");
  });

  it("should format bytes with unitDisplay set to 'long'", () => {
    const formatter = new BytesFormat("en-US", { unitDisplay: "long" });
    const result = formatter.format(2048); // 2 kilobytes
    expect(result).toBe("2 kilobytes");
  });

  it("should format bytes with unitDisplay set to 'short'", () => {
    const formatter = new BytesFormat("en-US", { unitDisplay: "short" });
    const result = formatter.format(1048576); // 1 MB
    expect(result).toBe("1 MB");
  });

  it("should format bytes with unitDisplay set to 'narrow'", () => {
    const formatter = new BytesFormat("en-US", { unitDisplay: "narrow" });
    const result = formatter.format(1073741824); // 1GB
    expect(result).toBe("1GB");
  });

  it("should format bytes with unitDisplay set to 'long' for terabytes", () => {
    const formatter = new BytesFormat("en-US", { unitDisplay: "long" });
    const result = formatter.format(1099511627776); // 1 terabyte
    expect(result).toBe("1 terabyte");
  });

  it("should format bytes with unitDisplay set to 'short' for petabytes", () => {
    const formatter = new BytesFormat("en-US", { unitDisplay: "short" });
    const result = formatter.format(1125899906842624); // 1 PB
    expect(result).toBe("1 PB");
  });

  it("should format bytes less than 1 KB with unitDisplay set to 'narrow'", () => {
    const formatter = new BytesFormat("en-US", { unitDisplay: "narrow" });
    const result = formatter.format(512); // 512B
    expect(result).toBe("512B");
  });

  it("should format bytes with maximumFractionDigits set to 0", () => {
    const formatter = new BytesFormat("en-US", { maximumFractionDigits: 0 });
    const result = formatter.format(1536); // 1.5 KB -> 2 KB
    expect(result).toBe("2 kB");
  });

  it("should format bytes with maximumFractionDigits set to 1", () => {
    const formatter = new BytesFormat("en-US", { maximumFractionDigits: 1 });
    const result = formatter.format(1536); // 1.5 KB
    expect(result).toBe("1.5 kB");
  });

  it("should format bytes with maximumFractionDigits set to 3", () => {
    const formatter = new BytesFormat("en-US", { maximumFractionDigits: 3 });
    const result = formatter.format(1538); // 1.5 KB
    expect(result).toBe("1.502 kB");
  });

  it("should format bytes with maximumFractionDigits set to 0 for megabytes", () => {
    const formatter = new BytesFormat("en-US", { maximumFractionDigits: 0 });
    const result = formatter.format(15728640); // 15 MB
    expect(result).toBe("15 MB");
  });

  it("should format bytes with maximumFractionDigits set to 2 for gigabytes", () => {
    const formatter = new BytesFormat("en-US", { maximumFractionDigits: 2 });
    const result = formatter.format(1740912739); // 1.5 GB
    expect(result).toBe("1.62 GB");
  });

  it("should format bytes with maximumSignificantDigits set to 1", () => {
    const formatter = new BytesFormat("en-US", { maximumSignificantDigits: 1 });
    const result = formatter.format(1536); // 1.5 KB -> 2 KB
    expect(result).toBe("2 kB");
  });

  it("should format bytes with maximumSignificantDigits set to 2", () => {
    const formatter = new BytesFormat("en-US", { maximumSignificantDigits: 2 });
    const result = formatter.format(1536); // 1.5 KB
    expect(result).toBe("1.5 kB");
  });

  it("should format bytes with maximumSignificantDigits set to 3", () => {
    const formatter = new BytesFormat("en-US", { maximumSignificantDigits: 3 });
    const result = formatter.format(1538); // 1.5 KB
    expect(result).toBe("1.5 kB");
  });

  it("should format bytes with maximumSignificantDigits set to 1 for megabytes", () => {
    const formatter = new BytesFormat("en-US", { maximumSignificantDigits: 1 });
    const result = formatter.format(15728640); // 15 MB
    expect(result).toBe("20 MB");
  });

  it("should format bytes with maximumSignificantDigits set to 4 for gigabytes", () => {
    const formatter = new BytesFormat("en-US", { maximumSignificantDigits: 4 });
    const result = formatter.format(1740912739); // 1.5 GB
    expect(result).toBe("1.621 GB");
  });
});
