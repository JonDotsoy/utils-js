import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { indexedDB } from "fake-indexeddb";
import { IndexedDBStore } from "./indexeddb-store.js";
import { Message } from "../queue.js";

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
      const message1 = new Message({ data: "test1" });
      message1.id = "1";
      const message2 = new Message({ data: "test2" });
      message2.id = "2";

      await store.addMessage(message1);
      await store.addMessage(message2);

      const size = await store.getSize();
      expect(size).toBe(2);
    });

    it("should handle messages with different data types", async () => {
      const message1 = new Message({ name: "test" });
      message1.id = "1";
      const message2 = new Message([1, 2, 3]);
      message2.id = "2";

      await store.addMessage(message1);
      await store.addMessage(message2);

      const size = await store.getSize();
      expect(size).toBe(2);
    });
  });

  describe("getMessage", () => {
    it("should retrieve message by id", async () => {
      const message = new Message({ data: "test-data" });
      message.id = "test-id";

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
      const message1 = new Message({ data: "first" }, Date.now() - 1000);
      message1.id = "1";
      const message2 = new Message({ data: "second" }, Date.now());
      message2.id = "2";

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
      const message = new Message({ data: "test" }, Date.now());
      message.id = "1";
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
      const message = new Message({ data: "test" }, Date.now());
      message.id = "1";
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
      const message = new Message({ data: "test" }, Date.now());
      message.id = "1";
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
      const message = new Message({ data: "test" }, Date.now());
      message.id = "1";
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
      const message1 = new Message({ data: "test1" }, Date.now());
      message1.id = "1";
      const message2 = new Message({ data: "test2" }, Date.now());
      message2.id = "2";

      await store.addMessage(message1);
      expect(await store.getSize()).toBe(1);

      await store.addMessage(message2);
      expect(await store.getSize()).toBe(2);
    });

    it("should return correct count after operations", async () => {
      const message1 = new Message({ data: "test1" }, Date.now());
      message1.id = "1";
      const message2 = new Message({ data: "test2" }, Date.now());
      message2.id = "2";
      const message3 = new Message({ data: "test3" }, Date.now());
      message3.id = "3";

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
      const message = new Message({ data: "test" }, Date.now());
      message.id = "1";
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
        const message = new Message({ data: `test${i}` }, Date.now() + i);
        message.id = `${i}`;
        promises.push(store.addMessage(message));
      }

      await Promise.all(promises);
      expect(await store.getSize()).toBe(10);
    });

    it("should handle concurrent claim operations", async () => {
      // Add messages
      for (let i = 0; i < 5; i++) {
        const message = new Message({ data: `test${i}` }, Date.now() + i);
        message.id = `${i}`;
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
