import { describe, test, expect } from "bun:test";
import { Message } from "./message.js";

const TTL_TWO_MINUTES_IN_SECONDS = 120;

describe("Message", () => {
  test("should create message with empty data and default options", () => {
    new Message({});
  });

  test("should create message with data and custom options", () => {
    new Message(
      {},
      {
        id: "1",
        createdAt: Date.parse("2025-01-01T00:00:00Z"),
        acknowledgedAt: null,
        ttl: null,
      },
    );
  });

  test("should create message from object using static from method", () => {
    const message = Message.from({
      id: "1",
      data: {},
      createdAt: Date.parse("2025-01-01T00:00:00Z"),
      acknowledgedAt: null,
      ttl: null,
    });

    expect(message).toBeInstanceOf(Message);
  });

  test("should return false for isExpired when message has no TTL set", () => {
    const message = Message.from({
      id: "1",
      data: {},
      createdAt: Date.parse("2025-01-01T00:00:00Z"),
      acknowledgedAt: null,
      ttl: null,
    });

    expect(message.isExpired(Date.parse("2025-02-01T00:00:00Z"))).toBe(false);
  });

  test("should return false for isExpired when message TTL has not yet expired", () => {
    const message = Message.from({
      id: "1",
      data: {},
      createdAt: Date.parse("2025-01-01T00:00:00Z"),
      acknowledgedAt: null,
      ttl: TTL_TWO_MINUTES_IN_SECONDS,
    });

    expect(message.isExpired(Date.parse("2025-01-01T00:01:59Z"))).toBe(false);
  });

  test("should return true for isExpired when message TTL has exactly expired", () => {
    const message = Message.from({
      id: "1",
      data: {},
      createdAt: Date.parse("2025-01-01T00:00:00Z"),
      acknowledgedAt: null,
      ttl: TTL_TWO_MINUTES_IN_SECONDS,
    });

    expect(message.isExpired(Date.parse("2025-01-01T00:02:00Z"))).toBe(true);
  });

  test("should return true for isExpired when message TTL has long expired", () => {
    const message = Message.from({
      id: "1",
      data: {},
      createdAt: Date.parse("2025-01-01T00:00:00Z"),
      acknowledgedAt: null,
      ttl: TTL_TWO_MINUTES_IN_SECONDS,
    });

    expect(message.isExpired(Date.parse("2025-01-01T00:03:00Z"))).toBe(true);
  });
});
