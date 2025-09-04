import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { WorkerStore } from "./worker-store";
import { Message } from "../queue";

describe("WorkerStore", () => {
  let worker: Worker;

  beforeEach(() => {
    worker = new Worker(new URL("./worker-store-be.ts", import.meta.url));
  });

  afterEach(() => {
    worker.terminate();
  });

  test("should create WorkerStore instance", async () => {
    new WorkerStore(worker);
  });

  test("should add message to store", async () => {
    const store = new WorkerStore(worker);

    await store.addMessage(
      Message.from({
        id: "1",
        createdAt: Date.now(),
        data: { foo: "bar" },
      }),
    );
  });

  test("should retrieve message by id", async () => {
    const store = new WorkerStore(worker);

    await store.addMessage(
      Message.from({
        id: "1",
        createdAt: Date.now(),
        data: { foo: "bar" },
      }),
    );
    const message = await store.getMessage("1");
    expect(message).not.toBeNull();
    expect(message?.id).toBe("1");
  });

  test("should acknowledge message and update acknowledgedAt timestamp", async () => {
    const store = new WorkerStore(worker);

    await store.addMessage(
      Message.from({
        id: "1",
        createdAt: Date.now(),
        data: { foo: "bar" },
      }),
    );
    const message = await store.getMessage("1");
    expect(message).not.toBeNull();
    expect(message?.id).toBe("1");
    await store.acknowledgeMessage("1");
    const message2 = await store.getMessage("1");
    expect(message2).not.toBeNull();
    expect(message2?.acknowledgedAt).not.toBeNull();
  });

  test("should delete message from store", async () => {
    const store = new WorkerStore(worker);

    await store.addMessage(
      Message.from({
        id: "1",
        createdAt: Date.now(),
        data: { foo: "bar" },
      }),
    );
    const message = await store.getMessage("1");
    expect(message).not.toBeNull();
    expect(message?.id).toBe("1");
    await store.deleteMessage("1");
    const message2 = await store.getMessage("1");
    expect(message2).toBeNull();
  });

  test("should delete acknowledged message from store", async () => {
    const store = new WorkerStore(worker);

    await store.addMessage(
      Message.from({
        id: "1",
        createdAt: Date.now(),
        data: { foo: "bar" },
      }),
    );
    const message = await store.getMessage("1");
    expect(message).not.toBeNull();
    expect(message?.id).toBe("1");
    await store.acknowledgeMessage("1");
    const message2 = await store.getMessage("1");
    expect(message2).not.toBeNull();
    expect(message2?.acknowledgedAt).not.toBeNull();
    await store.deleteMessage("1");
    const message3 = await store.getMessage("1");
    expect(message3).toBeNull();
  });

  test("should track store size correctly when adding and deleting messages", async () => {
    const store = new WorkerStore(worker);

    expect(await store.getSize()).toBe(0);

    await store.addMessage(
      Message.from({
        id: "1",
        createdAt: Date.now(),
        data: { foo: "bar" },
      }),
    );

    expect(await store.getSize()).toBe(1);

    await store.addMessage(
      Message.from({
        id: "2",
        createdAt: Date.now(),
        data: { foo: "baz" },
      }),
    );

    expect(await store.getSize()).toBe(2);

    await store.deleteMessage("1");

    expect(await store.getSize()).toBe(1);

    await store.deleteMessage("2");

    expect(await store.getSize()).toBe(0);
  });

  test("should share messages between multiple store instances using same worker", async () => {
    const store1 = new WorkerStore(worker);
    const store2 = new WorkerStore(worker);

    await store1.addMessage(
      Message.from({
        id: "1",
        createdAt: Date.now(),
        data: { foo: "bar" },
      }),
    );

    const message = await store2.getMessage("1");
    expect(message).not.toBeNull();
    expect(message?.id).toBe("1");
  });

  test("should claim available message with timeout", async () => {
    const store1 = new WorkerStore(worker);
    const store2 = new WorkerStore(worker);

    await store1.addMessage(
      Message.from({
        id: "1",
        createdAt: Date.now(),
        data: { foo: "bar" },
      }),
    );

    const message = await store2.claimMessage(5000, Date.now());
    expect(message).not.toBeNull();
    expect(message?.id).toBe("1");
  });

  test("should wait and claim message when added asynchronously", async () => {
    const store1 = new WorkerStore(worker);
    const store2 = new WorkerStore(worker);

    setTimeout(async () => {
      await store1.addMessage(
        Message.from({
          id: "1",
          createdAt: Date.now(),
          data: { foo: "bar" },
        }),
      );
    }, 100);

    const message = await store2.claimMessage(5000, Date.now());

    expect(message).not.toBeNull();
    expect(message?.id).toBe("1");
  });
});
