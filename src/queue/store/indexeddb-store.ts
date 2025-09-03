import { Message } from "../message/message.js";
import { Store } from "./store.js";

/**
 * IndexedDB-based implementation of the Store abstract class.
 *
 * This store persists messages in the browser's IndexedDB for durability and persistence
 * across browser sessions. It provides atomic operations for concurrent access and
 * implements a message claiming mechanism to prevent duplicate processing.
 *
 * The store creates an object store with indexes on `createdAt` and `acknowledgedAt`
 * fields for efficient querying and message ordering.
 *
 * @example
 * ```typescript
 * // Create a store with default object store name
 * const store = new IndexedDBStore('my-queue-db');
 *
 * // Create a store with custom object store name
 * const store = new IndexedDBStore('my-queue-db', 'custom-messages');
 *
 * // Use with fake-indexeddb for testing
 * import FDBFactory from 'fake-indexeddb/lib/FDBFactory.js';
 * const testStore = new IndexedDBStore('test-db', 'messages', new FDBFactory());
 * ```
 */
export class IndexedDBStore extends Store {
  /** Promise that resolves to the opened IndexedDB database instance */
  private db: Promise<IDBDatabase>;

  /** Name of the IndexedDB database */
  private dbName: string;

  /** Name of the object store within the database */
  private storeName: string;

  /** IndexedDB factory instance for creating database connections */
  private idbFactory: IDBFactory;

  /**
   * Creates a new IndexedDB store instance.
   *
   * @param dbName - The name of the IndexedDB database
   * @param storeName - The name of the object store (defaults to "messages")
   * @param indexedDBFactory - Optional IndexedDB factory (defaults to globalThis.indexedDB)
   * @throws {Error} When IndexedDB is not available and no factory is provided
   *
   * @example
   * ```typescript
   * // Basic usage
   * const store = new IndexedDBStore('queue-db');
   *
   * // With custom store name
   * const store = new IndexedDBStore('queue-db', 'tasks');
   *
   * // With custom factory (useful for testing)
   * const store = new IndexedDBStore('test-db', 'messages', customFactory);
   * ```
   */
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

  /**
   * Initializes the IndexedDB database and creates the object store with indexes.
   *
   * This method:
   * - Opens or creates the database with version 1
   * - Creates the object store with 'id' as the key path
   * - Creates indexes on 'createdAt' and 'acknowledgedAt' for efficient querying
   *
   * @private
   * @returns Promise that resolves to the opened IDBDatabase instance
   * @throws {Error} If database initialization fails
   */
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

  /**
   * Closes the IndexedDB database connection.
   *
   * This method should be called when the store is no longer needed to free up resources.
   * After calling this method, the store should not be used for further operations.
   *
   * @returns Promise that resolves when the database is closed
   */
  async close(): Promise<void> {
    const database = await this.db;
    database.close();
  }

  /**
   * Adds a new message to the IndexedDB store.
   *
   * The message is stored with all its properties including id, data,
   * createdAt timestamp, and acknowledgedAt timestamp (if any).
   *
   * @param message - The message to add to the store
   * @returns Promise that resolves when the message is successfully added
   * @throws {Error} If the message cannot be added (e.g., duplicate id)
   *
   * @example
   * ```typescript
   * const message = new Message({ text: 'Hello' });
   * await store.addMessage(message);
   * ```
   */
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

  /**
   * Retrieves a message from the store by its ID.
   *
   * @param messageId - The unique identifier of the message to retrieve
   * @returns Promise that resolves to the Message instance or null if not found
   * @throws {Error} If the database operation fails
   *
   * @example
   * ```typescript
   * const message = await store.getMessage('msg-123');
   * if (message) {
   *   console.log('Found message:', message.data);
   * } else {
   *   console.log('Message not found');
   * }
   * ```
   */
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

  /**
   * Acknowledges a message by removing it from the store.
   *
   * In this IndexedDB implementation, acknowledging a message means deleting it
   * from the store entirely, which is different from the memory store that just
   * updates the acknowledgedAt timestamp.
   *
   * @param messageId - The unique identifier of the message to acknowledge
   * @returns Promise that resolves when the message is acknowledged (deleted)
   * @throws {Error} If the database operation fails
   *
   * @example
   * ```typescript
   * // Process and acknowledge a message
   * const message = await store.claimMessage(5000, Date.now());
   * if (message) {
   *   await processMessage(message.data);
   *   await store.acknowledgeMessage(message.id);
   * }
   * ```
   */
  async acknowledgeMessage(messageId: string): Promise<void> {
    // In IndexedDB store, acknowledging a message removes it
    // This is different from memory store which just updates the timestamp
    return this.deleteMessage(messageId);
  }

  /**
   * Deletes a message from the store by its ID.
   *
   * @param messageId - The unique identifier of the message to delete
   * @returns Promise that resolves when the message is successfully deleted
   * @throws {Error} If the database operation fails
   *
   * @example
   * ```typescript
   * await store.deleteMessage('msg-123');
   * console.log('Message deleted');
   * ```
   */
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

  /**
   * Claims the oldest unacknowledged message from the store for processing.
   *
   * This method implements an atomic claim operation that:
   * 1. Finds the oldest message (by createdAt timestamp) that is either unacknowledged
   *    or has timed out (acknowledgedAt + timeout < now)
   * 2. Updates its acknowledgedAt timestamp to claim it
   * 3. Returns the claimed message
   *
   * The operation is atomic to prevent race conditions when multiple consumers
   * try to claim messages simultaneously.
   *
   * @param acknowledgeTimeoutMs - Timeout in milliseconds after which a message becomes claimable again
   * @param now - Current timestamp in milliseconds
   * @param abort - Optional AbortSignal to cancel the operation
   * @returns Promise that resolves to the claimed Message or null if no message is available
   * @throws {Error} If the operation is aborted or database operation fails
   *
   * @example
   * ```typescript
   * // Claim a message with 30-second timeout
   * const message = await store.claimMessage(30000, Date.now());
   * if (message) {
   *   console.log('Claimed message:', message.id);
   *   // Process the message...
   *   await store.acknowledgeMessage(message.id);
   * }
   *
   * // With abort signal
   * const controller = new AbortController();
   * setTimeout(() => controller.abort(), 5000); // Cancel after 5s
   *
   * try {
   *   const message = await store.claimMessage(30000, Date.now(), controller.signal);
   * } catch (error) {
   *   console.log('Operation was cancelled');
   * }
   * ```
   */
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

  /**
   * Returns the total number of messages currently stored in the IndexedDB store.
   *
   * This includes both acknowledged and unacknowledged messages since acknowledged
   * messages are deleted in this implementation.
   *
   * @returns Promise that resolves to the number of messages in the store
   * @throws {Error} If the database operation fails
   *
   * @example
   * ```typescript
   * const count = await store.getSize();
   * console.log(`Queue has ${count} pending messages`);
   * ```
   */
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
