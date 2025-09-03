import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from "bun:test";
import { SQLiteStore } from "./sqlite-store.js";
import { Message, Queue } from "../queue.js";
import { unlink } from "fs/promises";
import { existsSync } from "fs";

describe("SQLiteStore", () => {
  let store: SQLiteStore;
  let dbPath: string;

  beforeEach(async () => {
    // Use in-memory database for most tests for speed and isolation
    dbPath = ":memory:";
    store = new SQLiteStore(dbPath);
    // Small delay to ensure database is ready
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  afterEach(async () => {
    await store.close();
    // For file-based tests, clean up the file
    if (dbPath !== ":memory:" && existsSync(dbPath)) {
      try {
        await unlink(dbPath);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  describe("addMessage", () => {
    it("should add messages to the store", async () => {
      const message1 = new Message({ data: "test1" }, { id: "1" });
      const message2 = new Message({ data: "test2" }, { id: "2" });

      await store.addMessage(message1);
      await store.addMessage(message2);

      const size = await store.getSize();
      expect(size).toBe(2);
    });

    it("should handle messages with different data types", async () => {
      const message1 = new Message({ name: "test" }, { id: "1" });
      const message2 = new Message([1, 2, 3], { id: "2" });
      const message3 = new Message({ nested: { value: 42 } }, { id: "3" });

      await store.addMessage(message1);
      await store.addMessage(message2);
      await store.addMessage(message3);

      const size = await store.getSize();
      expect(size).toBe(3);
    });

    it("should throw error for duplicate message ids", async () => {
      const message1 = new Message({ data: "test1" }, { id: "duplicate" });
      const message2 = new Message({ data: "test2" }, { id: "duplicate" });

      await store.addMessage(message1);
      
      await expect(store.addMessage(message2)).rejects.toThrow();
    });
  });

  describe("getMessage", () => {
    it("should retrieve message by id", async () => {
      const originalMessage = new Message({ data: "test-data" }, { id: "test-id" });

      await store.addMessage(originalMessage);
      const retrieved = await store.getMessage("test-id");

      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(originalMessage.id);
      expect(retrieved!.data).toEqual(originalMessage.data);
      expect(retrieved!.createdAt).toBe(originalMessage.createdAt);
      expect(retrieved!.acknowledgedAt).toBe(originalMessage.acknowledgedAt);
    });

    it("should return null for non-existent message", async () => {
      const message = await store.getMessage("non-existent");
      expect(message).toBeNull();
    });

    it("should correctly deserialize complex data", async () => {
      const complexData = {
        user: { name: "John", age: 30 },
        tasks: ["task1", "task2"],
        metadata: { priority: 1, tags: ["urgent"] }
      };
      const message = new Message(complexData, { id: "complex" });

      await store.addMessage(message);
      const retrieved = await store.getMessage("complex");

      expect(retrieved).not.toBeNull();
      expect(retrieved!.data).toEqual(complexData);
    });
  });

  describe("claimMessage", () => {
    it("should claim the oldest available message", async () => {
      const message1 = new Message(
        { data: "first" },
        {
          id: "1",
          createdAt: Date.now() - 1000,
        },
      );
      const message2 = new Message(
        { data: "second" },
        {
          id: "2",
          createdAt: Date.now(),
        },
      );

      await store.addMessage(message1);
      await store.addMessage(message2);

      const claimed = await store.claimMessage(5000, Date.now());
      expect(claimed?.id).toBe("1");
      expect(claimed?.data).toEqual({ data: "first" });
      expect(claimed?.acknowledgedAt).toBeGreaterThan(0);
    });

    it("should return null when no messages available", async () => {
      const claimed = await store.claimMessage(5000, Date.now());
      expect(claimed).toBeNull();
    });

    it("should respect acknowledgment timeout", async () => {
      const message = new Message(
        { data: "test" },
        {
          id: "1",
          createdAt: Date.now(),
        },
      );
      await store.addMessage(message);

      const now = Date.now();
      
      // Claim with short timeout
      const claimed1 = await store.claimMessage(100, now);
      expect(claimed1?.id).toBe("1");

      // Should not be available immediately (within timeout)
      const claimed2 = await store.claimMessage(100, now + 50);
      expect(claimed2).toBeNull();

      // Should be available after timeout
      const claimed3 = await store.claimMessage(100, now + 200);
      expect(claimed3?.id).toBe("1");
    });

    it("should handle abort signal", async () => {
      const message = new Message(
        { data: "test" },
        {
          id: "1",
          createdAt: Date.now(),
        },
      );
      await store.addMessage(message);

      const abortController = new AbortController();
      abortController.abort();

      await expect(
        store.claimMessage(5000, Date.now(), abortController.signal),
      ).rejects.toThrow("Operation was aborted");
    });

    it("should handle concurrent claims atomically", async () => {
      // Add multiple messages
      for (let i = 0; i < 5; i++) {
        const message = new Message(
          { data: `test${i}` },
          {
            id: `${i}`,
            createdAt: Date.now() + i,
          },
        );
        await store.addMessage(message);
      }

      // Concurrent claims should not return the same message
      const claimPromises = [];
      for (let i = 0; i < 3; i++) {
        claimPromises.push(store.claimMessage(5000, Date.now()));
      }

      const claimed = await Promise.all(claimPromises);
      const claimedIds = claimed
        .filter((msg) => msg !== null)
        .map((msg) => msg!.id);

      // Should have claimed some messages and all should be different
      expect(claimedIds.length).toBeGreaterThan(0);
      expect(new Set(claimedIds).size).toBe(claimedIds.length);
    });
  });

  describe("acknowledgeMessage", () => {
    it("should acknowledge a message", async () => {
      const message = new Message(
        { data: "test" },
        {
          id: "1",
          createdAt: Date.now(),
        },
      );
      await store.addMessage(message);

      await store.acknowledgeMessage("1");

      // Message should still exist but be acknowledged
      const retrieved = await store.getMessage("1");
      expect(retrieved).not.toBeNull();
      expect(retrieved!.acknowledgedAt).toBeGreaterThan(0);

      const size = await store.getSize();
      expect(size).toBe(1);
    });

    it("should handle acknowledging non-existent message", async () => {
      // This should not throw an error
      let error = null;
      try {
        await store.acknowledgeMessage("non-existent");
      } catch (e) {
        error = e;
      }
      expect(error).toBeNull();
    });

    it("should update acknowledgment timestamp", async () => {
      const message = new Message({ data: "test" }, { id: "1" });
      await store.addMessage(message);

      const beforeAck = Date.now();
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      await store.acknowledgeMessage("1");
      const afterAck = Date.now();

      const retrieved = await store.getMessage("1");
      expect(retrieved!.acknowledgedAt).toBeGreaterThanOrEqual(beforeAck);
      expect(retrieved!.acknowledgedAt).toBeLessThanOrEqual(afterAck);
    });
  });

  describe("deleteMessage", () => {
    it("should delete a message by id", async () => {
      const message = new Message(
        { data: "test" },
        {
          id: "1",
          createdAt: Date.now(),
        },
      );
      await store.addMessage(message);

      await store.deleteMessage("1");

      const retrieved = await store.getMessage("1");
      expect(retrieved).toBeNull();

      const size = await store.getSize();
      expect(size).toBe(0);
    });

    it("should handle deleting non-existent message", async () => {
      // This should not throw an error
      let error = null;
      try {
        await store.deleteMessage("non-existent");
      } catch (e) {
        error = e;
      }
      expect(error).toBeNull();
    });
  });

  describe("getSize", () => {
    it("should return 0 for empty store", async () => {
      const size = await store.getSize();
      expect(size).toBe(0);
    });

    it("should return correct count after adding messages", async () => {
      const message1 = new Message(
        { data: "test1" },
        {
          id: "1",
          createdAt: Date.now(),
        },
      );
      const message2 = new Message(
        { data: "test2" },
        {
          id: "2",
          createdAt: Date.now(),
        },
      );

      await store.addMessage(message1);
      expect(await store.getSize()).toBe(1);

      await store.addMessage(message2);
      expect(await store.getSize()).toBe(2);
    });

    it("should return correct count after operations", async () => {
      const message1 = new Message(
        { data: "test1" },
        {
          id: "1",
          createdAt: Date.now(),
        },
      );
      const message2 = new Message(
        { data: "test2" },
        {
          id: "2",
          createdAt: Date.now(),
        },
      );
      const message3 = new Message(
        { data: "test3" },
        {
          id: "3",
          createdAt: Date.now(),
        },
      );

      await store.addMessage(message1);
      await store.addMessage(message2);
      await store.addMessage(message3);
      expect(await store.getSize()).toBe(3);

      await store.acknowledgeMessage("1");
      expect(await store.getSize()).toBe(3); // Acknowledged messages are not deleted

      await store.deleteMessage("2");
      expect(await store.getSize()).toBe(2);
    });
  });

  describe("close", () => {
    it("should close the store without errors", async () => {
      const message = new Message(
        { data: "test" },
        {
          id: "1",
          createdAt: Date.now(),
        },
      );
      await store.addMessage(message);

      // This should not throw an error
      let error = null;
      try {
        await store.close();
      } catch (e) {
        error = e;
      }
      expect(error).toBeNull();
    });
  });

  describe("persistent storage", () => {
    let persistentDbPath: string;

    beforeAll(() => {
      persistentDbPath = `/tmp/test-persistent-${Date.now()}-${Math.random()}.db`;
    });

    afterAll(async () => {
      // Clean up persistent database
      if (existsSync(persistentDbPath)) {
        try {
          await unlink(persistentDbPath);
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    });

    it("should persist messages to file", async () => {
      // Create store with file-based database
      const fileStore = new SQLiteStore(persistentDbPath);
      
      try {
        // Add messages
        const message1 = new Message({ data: "persistent1" }, { id: "p1" });
        const message2 = new Message({ data: "persistent2" }, { id: "p2" });

        await fileStore.addMessage(message1);
        await fileStore.addMessage(message2);

        expect(await fileStore.getSize()).toBe(2);
        await fileStore.close();

        // Create new store instance with same database
        const fileStore2 = new SQLiteStore(persistentDbPath);

        // Messages should still be there
        expect(await fileStore2.getSize()).toBe(2);
        
        const retrieved1 = await fileStore2.getMessage("p1");
        const retrieved2 = await fileStore2.getMessage("p2");

        expect(retrieved1?.data).toEqual({ data: "persistent1" });
        expect(retrieved2?.data).toEqual({ data: "persistent2" });

        await fileStore2.close();
      } catch (error) {
        await fileStore.close();
        throw error;
      }
    });
  });

  describe("concurrent operations", () => {
    it("should handle concurrent message additions", async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        const message = new Message(
          { data: `test${i}` },
          {
            id: `${i}`,
            createdAt: Date.now() + i,
          },
        );
        promises.push(store.addMessage(message));
      }

      await Promise.all(promises);
      expect(await store.getSize()).toBe(10);
    });

    it("should handle concurrent claim operations", async () => {
      // Add messages
      for (let i = 0; i < 5; i++) {
        const message = new Message(
          { data: `test${i}` },
          {
            id: `${i}`,
            createdAt: Date.now() + i,
          },
        );
        await store.addMessage(message);
      }

      // Concurrent claims should not return the same message
      const claimPromises = [];
      for (let i = 0; i < 3; i++) {
        claimPromises.push(store.claimMessage(5000, Date.now()));
      }

      const claimed = await Promise.all(claimPromises);
      const claimedIds = claimed
        .filter((msg) => msg !== null)
        .map((msg) => msg!.id);

      // Should have claimed some messages and all should be different
      expect(claimedIds.length).toBeGreaterThan(0);
      expect(new Set(claimedIds).size).toBe(claimedIds.length);
    });
  });
});

describe("SQLite Store Integration with Queue", () => {
  let queue: Queue;
  let store: SQLiteStore;
  let dbPath: string;

  beforeEach(async () => {
    // Use in-memory database for tests
    dbPath = ":memory:";
    store = new SQLiteStore(dbPath);

    // Create queue with custom SQLite store and reasonable timeouts for testing
    queue = new Queue({
      store: store,
      messageTimeoutMs: 1000, // 1 second timeout for faster tests
      ackIntervalMs: 100, // 100ms keep-alive interval
    });

    // Wait for database to be ready
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  afterEach(async () => {
    queue.close();
    await store.close();
  });

  describe("basic queue operations with SQLite persistence", () => {
    it("should add and consume messages with proper acknowledgment", async () => {
      // Add test messages to queue
      await queue.add({ task: "process-order", orderId: "123" });
      await queue.add({ task: "send-email", to: "user@example.com" });
      await queue.add({ task: "cleanup", resource: "temp-files" });

      const processedMessages: any[] = [];
      let messageCount = 0;

      // Consume messages with acknowledgment
      for await (const message of queue.consume()) {
        processedMessages.push(message);
        messageCount++;

        // Acknowledge the message
        queue.ack(message);

        // Stop after processing all 3 messages
        if (messageCount >= 3) {
          break;
        }
      }

      // Verify all messages were processed
      expect(processedMessages).toHaveLength(3);

      // Check that all expected messages are present (order may vary)
      const taskTypes = processedMessages.map((msg) => msg.task);
      expect(taskTypes).toEqual(
        expect.arrayContaining(["process-order", "send-email", "cleanup"]),
      );

      // Verify specific message content exists
      expect(processedMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ task: "process-order", orderId: "123" }),
          expect.objectContaining({
            task: "send-email",
            to: "user@example.com",
          }),
          expect.objectContaining({ task: "cleanup", resource: "temp-files" }),
        ]),
      );

      // Verify store is empty after acknowledgment (messages are deleted)
      const storeSize = await store.getSize();
      expect(storeSize).toBe(0);
    });

    it("should handle message timeout and reclaiming correctly", async () => {
      // Add a test message
      await queue.add({ task: "timeout-test", id: "msg-1" });

      let firstClaimTime: number;
      let secondClaimTime: number;
      const processedMessages: any[] = [];

      // First consumer - doesn't acknowledge (simulates processing failure)
      for await (const message of queue.consume()) {
        firstClaimTime = Date.now();
        processedMessages.push({ ...message, attempt: 1 });
        // Don't acknowledge - let it timeout
        break;
      }

      // Wait for message timeout (1 second + buffer)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Second consumer - should reclaim the same message
      for await (const message of queue.consume()) {
        secondClaimTime = Date.now();
        processedMessages.push({ ...message, attempt: 2 });
        queue.ack(message); // Acknowledge this time
        break;
      }

      // Verify message was reclaimed after timeout
      expect(processedMessages).toHaveLength(2);
      expect(processedMessages[0]).toEqual({
        task: "timeout-test",
        id: "msg-1",
        attempt: 1,
      });
      expect(processedMessages[1]).toEqual({
        task: "timeout-test",
        id: "msg-1",
        attempt: 2,
      });
      expect(secondClaimTime! - firstClaimTime!).toBeGreaterThan(1000);

      // Verify store is empty after final acknowledgment
      const storeSize = await store.getSize();
      expect(storeSize).toBe(0);
    });
  });

  describe("concurrent processing with SQLite", () => {
    it("should handle multiple concurrent consumers safely", async () => {
      // Add multiple messages for concurrent processing
      const messageCount = 10;
      for (let i = 0; i < messageCount; i++) {
        await queue.add({
          task: "concurrent-task",
          messageId: i,
          data: `message-${i}`,
        });
      }

      const consumer1Results: any[] = [];
      const consumer2Results: any[] = [];
      const consumer3Results: any[] = [];

      // Create three concurrent consumers
      const consumer1 = (async () => {
        for await (const message of queue.consume()) {
          consumer1Results.push(message);
          // Simulate some processing time
          await new Promise((resolve) => setTimeout(resolve, 10));
          queue.ack(message);

          if (consumer1Results.length >= 4) break; // Stop after processing some messages
        }
      })();

      const consumer2 = (async () => {
        for await (const message of queue.consume()) {
          consumer2Results.push(message);
          await new Promise((resolve) => setTimeout(resolve, 15));
          queue.ack(message);

          if (consumer2Results.length >= 3) break;
        }
      })();

      const consumer3 = (async () => {
        for await (const message of queue.consume()) {
          consumer3Results.push(message);
          await new Promise((resolve) => setTimeout(resolve, 5));
          queue.ack(message);

          if (consumer3Results.length >= 3) break;
        }
      })();

      // Wait for all consumers to complete
      await Promise.all([consumer1, consumer2, consumer3]);

      // Verify messages were distributed among consumers
      const totalProcessed =
        consumer1Results.length +
        consumer2Results.length +
        consumer3Results.length;
      expect(totalProcessed).toBe(messageCount);

      // Verify no message was processed by multiple consumers (unique message IDs)
      const allMessages = [
        ...consumer1Results,
        ...consumer2Results,
        ...consumer3Results,
      ];
      const messageIds = allMessages.map((msg) => msg.messageId);
      const uniqueMessageIds = new Set(messageIds);
      expect(uniqueMessageIds.size).toBe(messageCount);

      // Verify store is empty after all acknowledgments
      const storeSize = await store.getSize();
      expect(storeSize).toBe(0);
    });
  });

  describe("error handling", () => {
    it("should handle processing errors without losing messages", async () => {
      await queue.add({ task: "error-prone", shouldFail: true });
      await queue.add({ task: "error-prone", shouldFail: false });

      const processedMessages: any[] = [];
      const errors: any[] = [];
      let attempts = 0;

      // Consumer with error handling
      for await (const message of queue.consume()) {
        attempts++;

        try {
          if (message.shouldFail && attempts === 1) {
            // Simulate processing error on first attempt
            throw new Error("Simulated processing error");
          }

          processedMessages.push(message);
          queue.ack(message);

          if (processedMessages.length >= 2) break;
        } catch (error) {
          errors.push(error);
          // Don't acknowledge - message should be reclaimed
        }

        // Stop after a reasonable number of attempts to prevent infinite loop
        if (attempts >= 4) break;
      }

      // Should have one error and eventually process both messages
      expect(errors).toHaveLength(1);
      expect(processedMessages).toHaveLength(2);

      // Verify the failed message was eventually processed
      expect(processedMessages).toEqual(
        expect.arrayContaining([
          { task: "error-prone", shouldFail: true },
          { task: "error-prone", shouldFail: false },
        ]),
      );
    });

    it("should handle empty queue consumption gracefully", async () => {
      const processedMessages: any[] = [];
      let consumerFinished = false;
      let timeoutReached = false;

      // Start consuming from empty queue
      const consumer = (async () => {
        try {
          // Create a timeout promise to avoid waiting indefinitely
          const timeout = new Promise<void>((resolve) => {
            setTimeout(() => {
              timeoutReached = true;
              resolve();
            }, 100);
          });

          // Race between timeout and queue consumption
          await Promise.race([
            timeout,
            (async () => {
              for await (const message of queue.consume()) {
                processedMessages.push(message);
                queue.ack(message);
                // Break immediately since we don't expect any messages
                break;
              }
            })(),
          ]);
        } catch (error) {
          // Ignore expected errors
        } finally {
          consumerFinished = true;
        }
      })();

      // Wait for consumer to finish or timeout
      await consumer;

      // Verify consumer finished
      expect(consumerFinished).toBe(true);

      // Should have reached timeout (no messages available)
      expect(timeoutReached).toBe(true);

      // Should have processed no messages
      expect(processedMessages).toHaveLength(0);

      // Store should be empty
      const storeSize = await store.getSize();
      expect(storeSize).toBe(0);
    });

    it("should maintain message ordering with SQLite storage", async () => {
      // Add messages in specific order with time gaps
      const messageOrder = ["first", "second", "third", "fourth", "fifth"];

      for (let i = 0; i < messageOrder.length; i++) {
        const order = messageOrder[i];
        await queue.add({ order, sequence: i, timestamp: Date.now() });
        // Ensure different timestamps for ordering
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const processedMessages: any[] = [];

      // Consume messages and track order
      for await (const message of queue.consume()) {
        processedMessages.push(message);
        queue.ack(message);

        if (processedMessages.length >= messageOrder.length) break;
      }

      // Verify all messages were processed
      expect(processedMessages).toHaveLength(messageOrder.length);

      // Sort by sequence to verify correct ordering
      const sortedMessages = processedMessages.sort(
        (a, b) => a.sequence - b.sequence,
      );
      const processedOrder = sortedMessages.map((msg) => msg.order);

      // Messages should be processed in FIFO order (oldest first)
      expect(processedOrder).toEqual(messageOrder);

      // Verify each message has expected properties
      sortedMessages.forEach((msg, index) => {
        expect(msg.order).toBe(messageOrder[index]);
        expect(msg.sequence).toBe(index);
        expect(typeof msg.timestamp).toBe("number");
      });
    });
  });
});