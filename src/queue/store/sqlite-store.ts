import { Database } from "bun:sqlite";
import type { Message } from "../message/message.js";
import { Store } from "./store.js";

/**
 * SQLite-based implementation of the Store abstract class.
 *
 * This store persists messages in a SQLite database for durability and persistence
 * across application restarts. It provides atomic operations for concurrent access and
 * implements a message claiming mechanism to prevent duplicate processing.
 *
 * The store creates a `messages` table with indexes on `createdAt` and `acknowledgedAt`
 * fields for efficient querying and message ordering.
 *
 * @example
 * ```typescript
 * // Create a store with in-memory database
 * const store = new SQLiteStore(":memory:");
 *
 * // Create a store with persistent file database
 * const store = new SQLiteStore("./queue.db");
 *
 * // Use with Queue
 * const queue = new Queue({ store });
 * ```
 */
export class SQLiteStore extends Store {
  /** SQLite database instance */
  private db: Database;

  /** Database file path */
  private dbPath: string;

  /** Prepared statement for adding messages */
  private insertMessageStmt: any;

  /** Prepared statement for getting messages by ID */
  private getMessageStmt: any;

  /** Prepared statement for updating message acknowledgment */
  private updateAckStmt: any;

  /** Prepared statement for deleting messages */
  private deleteMessageStmt: any;

  /** Prepared statement for getting message count */
  private getCountStmt: any;

  /** Prepared statement for claiming messages */
  private claimMessageStmt: any;

  /**
   * Creates a new SQLite store instance.
   *
   * @param dbPath - The path to the SQLite database file. Use ":memory:" for in-memory database
   * @throws {Error} When SQLite database cannot be opened or initialized
   *
   * @example
   * ```typescript
   * // Persistent database
   * const store = new SQLiteStore("./my-queue.db");
   *
   * // In-memory database (useful for testing)
   * const store = new SQLiteStore(":memory:");
   * ```
   */
  constructor(dbPath: string) {
    super();
    this.dbPath = dbPath;
    this.db = new Database(dbPath);
    this.initializeDatabase();
    this.prepareStatements();
  }

  /**
   * Initializes the SQLite database and creates the messages table with indexes.
   *
   * This method:
   * - Creates the messages table if it doesn't exist
   * - Creates indexes on createdAt and acknowledgedAt for efficient querying
   * - Enables WAL mode for better concurrent access
   *
   * @private
   * @throws {Error} If database initialization fails
   */
  private initializeDatabase(): void {
    try {
      // Enable WAL mode for better concurrent access
      this.db.exec("PRAGMA journal_mode = WAL;");
      
      // Create messages table
      this.db.exec(`CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        acknowledgedAt INTEGER
      );`);

      // Create indexes for efficient querying - wait for table creation first
      this.db.exec("CREATE INDEX IF NOT EXISTS idx_messages_createdAt ON messages(createdAt);");
      this.db.exec("CREATE INDEX IF NOT EXISTS idx_messages_acknowledgedAt ON messages(acknowledgedAt);");
    } catch (error) {
      // For more detailed debugging, log the actual error
      console.error('SQLite initialization error:', error);
      throw new Error(`Failed to initialize SQLite database: ${error}`);
    }
  }

  /**
   * Prepares SQL statements for better performance.
   *
   * @private
   */
  private prepareStatements(): void {
    this.insertMessageStmt = this.db.prepare(`
      INSERT INTO messages (id, data, createdAt, acknowledgedAt)
      VALUES (?, ?, ?, ?)
    `);

    this.getMessageStmt = this.db.prepare(`
      SELECT id, data, createdAt, acknowledgedAt
      FROM messages
      WHERE id = ?
    `);

    this.updateAckStmt = this.db.prepare(`
      UPDATE messages
      SET acknowledgedAt = ?
      WHERE id = ?
    `);

    this.deleteMessageStmt = this.db.prepare(`
      DELETE FROM messages WHERE id = ?
    `);

    this.getCountStmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM messages
    `);

    this.claimMessageStmt = this.db.prepare(`
      SELECT id, data, createdAt, acknowledgedAt
      FROM messages
      WHERE acknowledgedAt IS NULL OR acknowledgedAt < ?
      ORDER BY createdAt ASC
      LIMIT 1
    `);
  }

  /**
   * Adds a new message to the SQLite store.
   *
   * The message is stored with all its properties including id, serialized data,
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
    try {
      this.insertMessageStmt.run(
        message.id,
        JSON.stringify(message.data),
        message.createdAt,
        message.acknowledgedAt
      );
    } catch (error) {
      throw new Error(`Failed to add message: ${error}`);
    }
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
    try {
      const row = this.getMessageStmt.get(messageId);
      
      if (!row) {
        return null;
      }

      // Reconstruct Message instance
      const { Message } = await import("../message/message.js");
      return new Message(JSON.parse(row.data), {
        id: row.id,
        createdAt: row.createdAt,
        acknowledgedAt: row.acknowledgedAt,
      });
    } catch (error) {
      throw new Error(`Failed to get message: ${error}`);
    }
  }

  /**
   * Acknowledges a message by updating its acknowledgedAt timestamp.
   *
   * In this SQLite implementation, acknowledging a message sets its acknowledgedAt
   * timestamp to the current time, marking it as processed but keeping it in the store.
   *
   * @param messageId - The unique identifier of the message to acknowledge
   * @returns Promise that resolves when the message is acknowledged
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
    try {
      this.updateAckStmt.run(Date.now(), messageId);
    } catch (error) {
      throw new Error(`Failed to acknowledge message: ${error}`);
    }
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
    try {
      this.deleteMessageStmt.run(messageId);
    } catch (error) {
      throw new Error(`Failed to delete message: ${error}`);
    }
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

    try {
      // Import Message class before transaction
      const { Message } = await import("../message/message.js");
      
      // Use a transaction to ensure atomicity
      return this.db.transaction(() => {
        if (abort?.aborted) {
          throw new Error("Operation was aborted");
        }

        // Find the oldest unacknowledged message
        const timeoutThreshold = now - acknowledgeTimeoutMs;
        const row = this.claimMessageStmt.get(timeoutThreshold);

        if (!row) {
          return null;
        }

        // Claim this message by acknowledging it
        this.updateAckStmt.run(now, row.id);

        // Return the claimed message
        return new Message(JSON.parse(row.data), {
          id: row.id,
          createdAt: row.createdAt,
          acknowledgedAt: now,
        });
      })();
    } catch (error) {
      if (error instanceof Error && error.message === "Operation was aborted") {
        throw error;
      }
      throw new Error(`Failed to claim message: ${error}`);
    }
  }

  /**
   * Returns the total number of messages currently stored in the SQLite store.
   *
   * This includes both acknowledged and unacknowledged messages since acknowledged
   * messages are not deleted in this implementation.
   *
   * @returns Promise that resolves to the number of messages in the store
   * @throws {Error} If the database operation fails
   *
   * @example
   * ```typescript
   * const count = await store.getSize();
   * console.log(`Queue has ${count} messages`);
   * ```
   */
  async getSize(): Promise<number> {
    try {
      const row = this.getCountStmt.get();
      return row.count;
    } catch (error) {
      throw new Error(`Failed to get message count: ${error}`);
    }
  }

  /**
   * Closes the SQLite database connection.
   *
   * This method should be called when the store is no longer needed to ensure
   * proper resource cleanup. After calling this method, the store should not be
   * used for further operations.
   *
   * @returns Promise that resolves when the database is closed
   *
   * @example
   * ```typescript
   * const store = new SQLiteStore('./queue.db');
   * // ... use the store
   * await store.close(); // Clean up database connection
   * ```
   */
  async close(): Promise<void> {
    try {
      this.db.close();
    } catch (error) {
      throw new Error(`Failed to close database: ${error}`);
    }
  }
}