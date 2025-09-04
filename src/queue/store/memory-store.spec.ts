import {
  beforeEach,
  describe,
  expect,
  test,
  setSystemTime,
  afterEach,
} from "bun:test";
import { Message, Queue } from "../queue.js";
import { MemoryStore } from "./memory-store.js";

const JANUARY = 0;
const FEBRUARY = 1;
const MARCH = 2;
const APRIL = 3;
const MAY = 4;
const JUNE = 5;
const JULY = 6;
const AUGUST = 7;
const SEPTEMBER = 8;
const OCTOBER = 9;
const NOVEMBER = 10;
const DECEMBER = 11;

const utc = ({
  year,
  month: monthIndex,
  date,
  hours,
  minutes,
  seconds,
}: {
  year: number;
  month: number;
  date: number;
  hours: number;
  minutes: number;
  seconds: number;
}) => Date.UTC(year, monthIndex, date, hours, minutes, seconds);

describe("MemoryStore", () => {
  afterEach(() => {
    setSystemTime();
  });

  test("should automatically clean up expired messages after TTL", async () => {
    MemoryStore.defaultPerformance.cleanupIntervalMilliseconds = 10;

    setSystemTime(
      utc({
        year: 2025,
        month: JANUARY,
        date: 1,
        hours: 0,
        minutes: 0,
        seconds: 0,
      }),
    );

    const message = Message.from({
      id: "1",
      createdAt: utc({
        year: 2025,
        month: JANUARY,
        date: 1,
        hours: 0,
        minutes: 0,
        seconds: 0,
      }),
      data: {},
      ttl: 120,
    });

    const store = new MemoryStore();

    store.addMessage(message);

    expect(store.messages.length).toBe(1);

    setSystemTime(
      utc({
        year: 2025,
        month: JANUARY,
        date: 1,
        hours: 0,
        minutes: 2,
        seconds: 0,
      }),
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(store.messages.length).toBe(0);

    store.close();
  });

  test("should reject expired messages when adding them to the store", () => {
    setSystemTime(
      utc({
        year: 2025,
        month: JANUARY,
        date: 1,
        hours: 0,
        minutes: 0,
        seconds: 0,
      }),
    );

    const message = Message.from({
      id: "1",
      createdAt: utc({
        year: 2025,
        month: JANUARY,
        date: 1,
        hours: 0,
        minutes: 0,
        seconds: 0,
      }),
      data: {},
      ttl: 120,
    });

    const store = new MemoryStore();

    setSystemTime(
      utc({
        year: 2025,
        month: JANUARY,
        date: 1,
        hours: 0,
        minutes: 5,
        seconds: 0,
      }),
    );

    store.addMessage(message);

    expect(store.messages.length).toBe(0);
  });

  test("should keep messages in queue when TTL has not expired", async () => {
    MemoryStore.defaultPerformance.cleanupIntervalMilliseconds = 10;
    setSystemTime(
      utc({
        year: 2025,
        month: JANUARY,
        date: 1,
        hours: 0,
        minutes: 0,
        seconds: 0,
      }),
    );

    const store = new MemoryStore();

    const queue = new Queue({ store });

    queue.add({ id: "1", data: "test" }, { ttl: 120 });

    expect(store.messages.length).toBe(1);

    setSystemTime(
      utc({
        year: 2025,
        month: JANUARY,
        date: 1,
        hours: 0,
        minutes: 1,
        seconds: 0,
      }),
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(store.messages.length).toBe(1);

    store.close();
  });

  test("should remove messages from queue through cleanup when TTL expires", async () => {
    MemoryStore.defaultPerformance.cleanupIntervalMilliseconds = 10;
    setSystemTime(
      utc({
        year: 2025,
        month: JANUARY,
        date: 1,
        hours: 0,
        minutes: 0,
        seconds: 0,
      }),
    );

    const store = new MemoryStore();

    const queue = new Queue({ store });

    queue.add({ id: "1", data: "test" }, { ttl: 120 });

    expect(store.messages.length).toBe(1);

    setSystemTime(
      utc({
        year: 2025,
        month: JANUARY,
        date: 1,
        hours: 0,
        minutes: 2,
        seconds: 0,
      }),
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(store.messages.length).toBe(0);

    store.close();
  });
});
