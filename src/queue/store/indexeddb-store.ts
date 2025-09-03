import { Message } from "../message/message.js";
import { Store } from "./store.js";

/**
 * IndexedDB-based implementation of the Store abstract class.
 *
 * This store persists messages in the browser's IndexedDB for durability.
 * It supports atomic operations for concurrent access and message claiming.
 */
export class IndexedDBStore extends Store {
  private db: Promise<IDBDatabase>;
  private dbName: string;
  private storeName: string;
  private idbFactory: IDBFactory;

  constructor(
    dbName: string,
    storeName?: string,
    indexedDBFactory?: IDBFactory,
  ) {
    super();
    this.dbName = dbName;
    this.storeName = storeName || "messages";
    this.idbFactory = indexedDBFactory || (globalThis as any).indexedDB;

    if (!this.idbFactory) {
      throw new Error(
        "IndexedDB is not available. Please provide an IndexedDB factory or ensure IndexedDB is supported.",
      );
    }

    this.db = this.initializeDatabase();
  }

  private initializeDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const dbRequest = this.idbFactory.open(this.dbName, 1);

      dbRequest.onerror = () => reject(dbRequest.error);
      dbRequest.onsuccess = () => {
        const database = dbRequest.result;
        resolve(database);
      };
      dbRequest.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;
        if (!database.objectStoreNames.contains(this.storeName)) {
          const store = database.createObjectStore(this.storeName, {
            keyPath: "id",
          });
          // Create indexes for efficient querying
          store.createIndex("createdAt", "createdAt", { unique: false });
          store.createIndex("acknowledgedAt", "acknowledgedAt", {
            unique: false,
          });
        }
      };
    });
  }

  async close(): Promise<void> {
    const database = await this.db;
    database.close();
  }

  async addMessage(message: Message): Promise<void> {
    const database = await this.db;
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      const request = store.add({
        id: message.id,
        data: message.data,
        createdAt: message.createdAt,
        acknowledgedAt: message.acknowledgedAt,
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getMessage(messageId: string): Promise<Message | null> {
    const database = await this.db;
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(messageId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        // Reconstruct Message instance
        const message = new Message(result.data, {
          id: result.id,
          createdAt: result.createdAt,
          acknowledgedAt: result.acknowledgedAt,
        });
        resolve(message);
      };
    });
  }

  async acknowledgeMessage(messageId: string): Promise<void> {
    // In IndexedDB store, acknowledging a message removes it
    // This is different from memory store which just updates the timestamp
    return this.deleteMessage(messageId);
  }

  async deleteMessage(messageId: string): Promise<void> {
    const database = await this.db;
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(messageId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async claimMessage(
    acknowledgeTimeoutMs: number,
    now: number,
    abort?: AbortSignal,
  ): Promise<Message | null> {
    if (abort?.aborted) {
      throw new Error("Operation was aborted");
    }

    const database = await this.db;
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const index = store.index("createdAt");

      // Find the oldest unacknowledged message
      const request = index.openCursor();

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest)
          .result as IDBCursorWithValue;

        if (!cursor) {
          resolve(null);
          return;
        }

        const record = cursor.value;
        const isUnacknowledged =
          record.acknowledgedAt === null ||
          record.acknowledgedAt < now - acknowledgeTimeoutMs;

        if (isUnacknowledged) {
          // Claim this message by acknowledging it
          const updatedRecord = {
            ...record,
            acknowledgedAt: now,
          };

          const updateRequest = cursor.update(updatedRecord);
          updateRequest.onerror = () => reject(updateRequest.error);
          updateRequest.onsuccess = () => {
            // Reconstruct Message instance
            const message = new Message(record.data, {
              id: record.id,
              createdAt: record.createdAt,
              acknowledgedAt: now,
            });
            resolve(message);
          };
        } else {
          cursor.continue();
        }
      };

      if (abort) {
        abort.addEventListener("abort", () => {
          transaction.abort();
          reject(new Error("Operation was aborted"));
        });
      }
    });
  }

  async getSize(): Promise<number> {
    const database = await this.db;
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.count();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
}
