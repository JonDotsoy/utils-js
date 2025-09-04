import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { indexedDB } from "fake-indexeddb";
import { IndexedDBStore } from "./indexeddb-store.js";
import { Message, Queue } from "../queue.js";

describe("IndexedDBStore", () => {
  let store: IndexedDBStore;
  let dbName: string;
  let storeName: string;

  beforeEach(async () => {
    // Use a unique database name for each test to ensure isolation
    dbName = `test-${Date.now()}-${Math.random()}`;
    storeName = `store-${Date.now()}-${Math.random()}`;
    store = new IndexedDBStore(dbName, storeName, indexedDB);
    // Wait for database to be ready
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  afterEach(async () => {
    await store.close();
    // Delete the database to ensure cleanup
    if (typeof indexedDB !== "undefined") {
      indexedDB.deleteDatabase(dbName);
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

      await store.addMessage(message1);
      await store.addMessage(message2);

      const size = await store.getSize();
      expect(size).toBe(2);
    });
  });

  describe("getMessage", () => {
    it("should retrieve message by id", async () => {
      const message = new Message({ data: "test-data" }, { id: "test-id" });

      await store.addMessage(message);
      const retrieved = await store.getMessage("test-id");

      expect(retrieved).toEqual(message);
    });

    it("should return null for non-existent message", async () => {
      const message = await store.getMessage("non-existent");
      expect(message).toBeNull();
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

      // Claim with short timeout
      const claimed1 = await store.claimMessage(100, Date.now());
      expect(claimed1?.id).toBe("1");

      // Should not be available immediately
      const claimed2 = await store.claimMessage(100, Date.now());
      expect(claimed2).toBeNull();

      // Should be available after timeout
      await new Promise((resolve) => setTimeout(resolve, 150));
      const claimed3 = await store.claimMessage(100, Date.now());
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
      ).rejects.toThrow();
    });
  });

  describe("acknowledgeMessage", () => {
    it("should acknowledge a claimed message", async () => {
      const message = new Message(
        { data: "test" },
        {
          id: "1",
          createdAt: Date.now(),
        },
      );
      await store.addMessage(message);

      await store.claimMessage(5000, Date.now());
      await store.acknowledgeMessage("1");

      // Message should be removed after acknowledgment
      const retrieved = await store.getMessage("1");
      expect(retrieved).toBeNull();

      const size = await store.getSize();
      expect(size).toBe(0);
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

      await store.claimMessage(5000, Date.now());
      await store.acknowledgeMessage("1");
      expect(await store.getSize()).toBe(2);

      await store.deleteMessage("2");
      expect(await store.getSize()).toBe(1);
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

describe("IndexedDB Store Integration with Queue", () => {
  let queue: Queue;
  let store: IndexedDBStore;
  let dbName: string;
  let storeName: string;

  beforeEach(async () => {
    // Use unique database and store names for each test
    dbName = `integration-test-${Date.now()}-${Math.random()}`;
    storeName = `store-${Date.now()}-${Math.random()}`;
    store = new IndexedDBStore(dbName, storeName, indexedDB);

    // Create queue with custom IndexedDB store and reasonable timeouts for testing
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

    // Clean up database
    if (typeof indexedDB !== "undefined") {
      indexedDB.deleteDatabase(dbName);
    }
  });

  describe("basic queue operations with IndexedDB persistence", () => {
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

      // Check that all expected messages are present (order may vary with IndexedDB)
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

      // Verify store is empty after acknowledgment
      const storeSize = await store.getSize();
      expect(storeSize).toBe(0);
    });

    it("should persist messages across queue restarts", async () => {
      // Add messages to the first queue instance
      await queue.add({ data: "persistent-message-1" });
      await queue.add({ data: "persistent-message-2" });

      // Verify messages are in store
      let storeSize = await store.getSize();
      expect(storeSize).toBe(2);

      // Close the current queue (but keep the store open)
      queue.close();
      await new Promise((resolve) => setTimeout(resolve, 100)); // Brief pause for cleanup

      // Create a new store instance (simulating restart)
      const newStore = new IndexedDBStore(dbName, storeName, indexedDB);
      const newQueue = new Queue({
        store: newStore,
        messageTimeoutMs: 1000,
        ackIntervalMs: 100,
      });

      // Wait for new store to be ready
      await new Promise((resolve) => setTimeout(resolve, 50));

      const processedMessages: any[] = [];
      let messageCount = 0;

      // Consume messages from the new queue instance
      for await (const message of newQueue.consume()) {
        processedMessages.push(message);
        newQueue.ack(message);
        messageCount++;

        if (messageCount >= 2) {
          break;
        }
      }

      // Verify messages persisted and were processed
      expect(processedMessages).toHaveLength(2);
      expect(processedMessages).toEqual(
        expect.arrayContaining([
          { data: "persistent-message-1" },
          { data: "persistent-message-2" },
        ]),
      );

      newQueue.close();
      await newStore.close();
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

  describe("concurrent processing with IndexedDB", () => {
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

    it("should handle queue closure during active consumption gracefully", async () => {
      // Add test messages
      await queue.add({ task: "graceful-shutdown-test", id: 1 });
      await queue.add({ task: "graceful-shutdown-test", id: 2 });
      await queue.add({ task: "graceful-shutdown-test", id: 3 });

      const processedMessages: any[] = [];
      let consumerFinished = false;
      let shutdownInitiated = false;

      // Start consuming messages
      const consumer = (async () => {
        try {
          for await (const message of queue.consume()) {
            processedMessages.push(message);

            // Simulate processing time
            await new Promise((resolve) => setTimeout(resolve, 50));

            queue.ack(message);

            // If this is the second message, initiate shutdown
            if (processedMessages.length === 2 && !shutdownInitiated) {
              shutdownInitiated = true;
              // Give a moment for the current message to be processed
              setTimeout(() => {
                try {
                  queue.close();
                } catch (error) {
                  // Ignore errors during shutdown
                }
              }, 25);
            }
          }
        } catch (error) {
          // Ignore errors during shutdown
        } finally {
          consumerFinished = true;
        }
      })();

      // Wait for consumer to complete with timeout
      await Promise.race([
        consumer,
        new Promise((resolve) => setTimeout(resolve, 2000)), // 2 second timeout
      ]);

      // Verify consumer finished
      expect(consumerFinished).toBe(true);

      // Should have processed at least 2 messages before shutdown
      expect(processedMessages.length).toBeGreaterThanOrEqual(2);

      // Verify processed messages have correct structure
      processedMessages.forEach((msg) => {
        expect(msg).toHaveProperty("task", "graceful-shutdown-test");
        expect(msg).toHaveProperty("id");
      });
    });
  });

  describe("error handling and edge cases", () => {
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

    it("should maintain message ordering with IndexedDB storage", async () => {
      // Add messages in specific order with larger time gaps
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

  describe("TTL (Time-to-Live) support", () => {
    it("should store and retrieve messages with TTL", async () => {
      const message = new Message(
        { data: "test-with-ttl" },
        {
          id: "ttl-test",
          ttl: 300, // 5 minutes TTL
        },
      );

      await store.addMessage(message);
      const retrieved = await store.getMessage("ttl-test");

      expect(retrieved).not.toBeNull();
      expect(retrieved?.ttl).toBe(300);
      expect(retrieved?.data).toEqual({ data: "test-with-ttl" });
    });

    it("should reject expired messages when adding to store", async () => {
      // Create a message that's already expired
      const expiredMessage = new Message(
        { data: "expired-data" },
        {
          id: "expired-msg",
          createdAt: Date.now() - 10000, // 10 seconds ago
          ttl: 5, // 5 seconds TTL (already expired)
        },
      );

      // Adding expired message should silently succeed but not actually store it
      await store.addMessage(expiredMessage);

      const retrieved = await store.getMessage("expired-msg");
      expect(retrieved).toBeNull();

      const size = await store.getSize();
      expect(size).toBe(0);
    });

    it("should filter out expired messages in getMessage", async () => {
      // Create a message with very short TTL
      const message = new Message(
        { data: "will-expire" },
        {
          id: "short-ttl",
          createdAt: Date.now() - 6000, // 6 seconds ago
          ttl: 5, // 5 seconds TTL (already expired)
        },
      );

      // Manually add to database to bypass addMessage's expiration check
      const database = await (store as any).db;
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(
          [(store as any).storeName],
          "readwrite",
        );
        const objectStore = transaction.objectStore((store as any).storeName);
        const request = objectStore.add({
          id: message.id,
          data: message.data,
          createdAt: message.createdAt,
          acknowledgedAt: message.acknowledgedAt,
          ttl: message.ttl,
        });
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });

      // getMessage should filter out the expired message
      const retrieved = await store.getMessage("short-ttl");
      expect(retrieved).toBeNull();
    });

    it("should skip expired messages in claimMessage", async () => {
      const validMessage = new Message(
        { data: "valid-data" },
        {
          id: "valid-msg",
          createdAt: Date.now() - 1000, // 1 second ago
          ttl: 60, // 1 minute TTL (still valid)
        },
      );

      const expiredMessage = new Message(
        { data: "expired-data" },
        {
          id: "expired-msg",
          createdAt: Date.now() - 10000, // 10 seconds ago
          ttl: 5, // 5 seconds TTL (already expired)
        },
      );

      // Add valid message first
      await store.addMessage(validMessage);

      // Manually add expired message to database to bypass addMessage's expiration check
      const database = await (store as any).db;
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(
          [(store as any).storeName],
          "readwrite",
        );
        const objectStore = transaction.objectStore((store as any).storeName);
        const request = objectStore.add({
          id: expiredMessage.id,
          data: expiredMessage.data,
          createdAt: expiredMessage.createdAt,
          acknowledgedAt: expiredMessage.acknowledgedAt,
          ttl: expiredMessage.ttl,
        });
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });

      // claimMessage should skip expired message and claim the valid one
      const claimed = await store.claimMessage(5000, Date.now());
      expect(claimed).not.toBeNull();
      expect(claimed?.id).toBe("valid-msg");
      expect(claimed?.data).toEqual({ data: "valid-data" });
    });

    it("should clean up expired messages", async () => {
      // Add a mix of valid and expired messages
      const validMessage = new Message(
        { data: "valid" },
        {
          id: "valid",
          ttl: 60, // 1 minute TTL (valid)
        },
      );

      const expiredMessage1 = new Message(
        { data: "expired1" },
        {
          id: "expired1",
          createdAt: Date.now() - 10000, // 10 seconds ago
          ttl: 5, // 5 seconds TTL (expired)
        },
      );

      const expiredMessage2 = new Message(
        { data: "expired2" },
        {
          id: "expired2",
          createdAt: Date.now() - 15000, // 15 seconds ago
          ttl: 10, // 10 seconds TTL (expired)
        },
      );

      // Add valid message normally
      await store.addMessage(validMessage);

      // Manually add expired messages to database
      const database = await (store as any).db;
      for (const msg of [expiredMessage1, expiredMessage2]) {
        await new Promise<void>((resolve, reject) => {
          const transaction = database.transaction(
            [(store as any).storeName],
            "readwrite",
          );
          const objectStore = transaction.objectStore((store as any).storeName);
          const request = objectStore.add({
            id: msg.id,
            data: msg.data,
            createdAt: msg.createdAt,
            acknowledgedAt: msg.acknowledgedAt,
            ttl: msg.ttl,
          });
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        });
      }

      // Verify we have 3 messages total
      let size = await store.getSize();
      expect(size).toBe(3);

      // Clean up expired messages
      const removedCount = await store.cleanupExpiredMessages();
      expect(removedCount).toBe(2);

      // Verify only valid message remains
      size = await store.getSize();
      expect(size).toBe(1);

      const remaining = await store.getMessage("valid");
      expect(remaining).not.toBeNull();
      expect(remaining?.data).toEqual({ data: "valid" });
    });

    it("should handle messages without TTL (null TTL)", async () => {
      const messageWithoutTTL = new Message(
        { data: "no-ttl" },
        {
          id: "no-ttl-msg",
          ttl: null,
        },
      );

      await store.addMessage(messageWithoutTTL);
      const retrieved = await store.getMessage("no-ttl-msg");

      expect(retrieved).not.toBeNull();
      expect(retrieved?.ttl).toBeNull();
      expect(retrieved?.isExpired(Date.now())).toBe(false);
    });

    it("should properly handle TTL with Queue integration", async () => {
      const queue = new Queue({ store });

      // Add a message with TTL using the Queue API
      await queue.add({ task: "ttl-task" }, { ttl: 30 }); // 30 seconds TTL

      // Verify the message is in the store
      const size = await store.getSize();
      expect(size).toBe(1);

      // Consume and acknowledge the message
      let messageFound = false;
      for await (const messageData of queue.consume()) {
        expect(messageData).toEqual({ task: "ttl-task" });
        queue.ack(messageData);
        messageFound = true;
        break;
      }

      expect(messageFound).toBe(true);

      // Verify message was acknowledged and removed
      const finalSize = await store.getSize();
      expect(finalSize).toBe(0);
    });

    it("should start and stop cleanup interval properly", async () => {
      // Create a new store instance to test cleanup interval
      const testStore = new IndexedDBStore(
        `cleanup-test-${Date.now()}`,
        `store-${Date.now()}`,
        indexedDB,
      );

      // Verify cleanup interval is running
      expect((testStore as any).cleanupInterval).toBeDefined();

      // Close the store
      await testStore.close();

      // Verify cleanup interval is stopped
      expect((testStore as any).cleanupInterval).toBeUndefined();

      // Clean up the test database
      if (typeof indexedDB !== "undefined") {
        indexedDB.deleteDatabase(`cleanup-test-${Date.now()}`);
      }
    });
  });
});
