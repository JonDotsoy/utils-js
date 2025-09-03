import {
  beforeEach,
  describe,
  expect,
  test,
  setSystemTime,
  afterEach,
} from "bun:test";
import { Message } from "../queue.js";
import { MemoryStore } from "./memory-store.js";

describe("MemoryStore", () => {
  afterEach(() => {
    setSystemTime();
  });

  test("should automatically clean up expired messages after TTL", async () => {
    MemoryStore.defaultPerformance.cleanupIntervalMilliseconds = 10;

    setSystemTime(1000);

    const message = Message.from({
      id: "1",
      createdAt: 1000,
      data: {},
      ttl: 2000,
    });

    const store = new MemoryStore();

    store.addMessage(message);

    expect(store.messages.length).toBe(1);

    setSystemTime(2000);

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(store.messages.length).toBe(0);

    store.close();
  });

  test("should reject expired messages when adding them to the store", () => {
    setSystemTime(3000);

    const message = Message.from({
      id: "1",
      createdAt: 1000,
      data: {},
      ttl: 2000,
    });

    const store = new MemoryStore();

    store.addMessage(message);

    expect(store.messages.length).toBe(0);
  });
});
