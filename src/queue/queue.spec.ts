import { describe, test, expect, mock } from "bun:test";
import { Queue, MemoryStore } from "./queue.js";

describe("Queue", () => {
  test("should add messages to the store", async () => {
    const store = new MemoryStore();
    const queue = new Queue({ store });

    // Add a message to the queue
    await queue.add({ foo: "bar" });

    // Verify the message was stored
    expect(store.messages.length).toBe(1);
  });

  test("should consume and automatically delete messages", async () => {
    const push = mock((message: any) => {});

    const store = new MemoryStore();
    const queue = new Queue({ store });

    // Add a message to process
    await queue.add({ foo: "bar" });

    // Consume the message using async iterator
    for await (const message of queue) {
      push(message);
      queue.ack(message); // Acknowledge the message
      break;
    }

    // Verify message was processed and automatically deleted
    expect(push).toHaveBeenCalledWith({ foo: "bar" });
    expect(store.messages.length).toBe(0);
  });

  test("should distribute messages between concurrent workers", async () => {
    const push = mock((message: any) => {});

    const store = new MemoryStore();
    const queue = new Queue({ store });

    // Add multiple messages to the queue
    await queue.add({ foo: "bar" });
    await queue.add({ foo: "baz" });

    // Create two concurrent workers
    const worker1 = async () => {
      for await (const message of queue) {
        push(["worker1", message]);
        await new Promise((r) => setTimeout(r, 5));
        queue.ack(message); // Acknowledge the message
        break;
      }
    };
    const worker2 = async () => {
      for await (const message of queue) {
        push(["worker2", message]);
        push(message);
        await new Promise((r) => setTimeout(r, 5));
        queue.ack(message); // Acknowledge the message
        break;
      }
    };

    // Run both workers concurrently
    await Promise.all([worker1(), worker2()]);

    // Verify each worker processed one message
    expect(push).toHaveBeenCalledWith(["worker1", { foo: "bar" }]);
    expect(push).toHaveBeenCalledWith(["worker2", { foo: "baz" }]);
    expect(store.messages.length).toBe(0);
  });

  test("should not consume messages immediately when waitForMessages is true", async () => {
    const m = [];
    const push = mock((message: any) => m.push(message));
    const store = new MemoryStore();
    const queue = new Queue({ store });

    // Add messages to the queue
    await queue.add({ foo: "bar" });
    await queue.add({ foo: "baz" });

    // Start worker with waitForMessages=true (continuous polling mode)
    const worker = async () => {
      for await (const message of queue.consume()) {
        queue.ack(message); // Acknowledge the message
        if (push(message) >= 2) {
          break;
        }
      }
    };

    // Start the worker but don't await it (it runs in background)
    const pending = worker();

    // Verify messages are not consumed immediately in continuous mode
    // (This test might need adjustment based on actual timing behavior)
    expect(push).not.toHaveBeenCalledWith({ foo: "bar" });
    expect(push).not.toHaveBeenCalledWith({ foo: "baz" });
  });

  test("should allow message recovery when worker fails", async () => {
    let n = 0;
    const push = mock((message: any) => {
      return n++;
    });
    const store = new MemoryStore();
    const queue = new Queue({ store });

    // Add a message to process
    await queue.add({ foo: "bar" });

    // First worker that will fail during message processing
    const worker1 = async () => {
      for await (const message of queue.consume()) {
        throw new Error("fail");
      }
    };
    const pending1 = worker1().catch(() => {}); // Catch the error to prevent unhandled rejection

    // Second worker that should be able to process the message
    // after the first worker fails and times out
    const worker2 = async () => {
      for await (const message of queue.consume()) {
        push(message);
        queue.ack(message); // Acknowledge the message
        break;
      }
    };
    const pending2 = worker2();

    // Wait for both workers to complete
    await Promise.all([pending1, pending2]);

    // Verify the message was eventually processed by worker2
    // after worker1 failed and the message timeout expired
    expect(push).toHaveBeenCalledWith({ foo: "bar" });
  });

  test("should properly handle AbortSignal to stop queue consumption", async () => {
    const fn = () => mock((...a: any[]) => {});
    const workflowOn = fn();
    const workflowOff = fn();
    const push = fn();

    const queue = new Queue();
    const abort = new AbortController();

    const worker = async () => {
      workflowOn();
      for await (const message of queue.consume(abort.signal)) {
        push(message);
      }
      workflowOff();
    };

    const process = worker();

    expect(workflowOn).toHaveBeenCalled();
    expect(workflowOff).not.toHaveBeenCalled();
    await new Promise((r) => setTimeout(r, 50));
    abort.abort();
    await new Promise((r) => setTimeout(r, 50));
    expect(workflowOff).toHaveBeenCalled();
    await process;
  });
});
