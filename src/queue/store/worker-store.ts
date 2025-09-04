/**
 * Worker Store - A store implementation that communicates with a Web Worker backend.
 * This class provides a store interface that delegates operations to a worker thread
 * using JSON-RPC protocol for inter-thread communication.
 */

import { Message } from "../queue.js";
import { Store } from "./store.js";
import type {
  JsonRpcErrorPayload,
  JsonRpcRequestPayload,
  JsonRpcResultPayload,
} from "./utils/dto/json-rpc-payload.js";
import { typeValidators } from "./utils/type-validators.js";

/**
 * WorkerStore class that extends Store to provide worker-based message storage.
 * All operations are delegated to a Web Worker that handles the actual storage logic.
 */
export class WorkerStore extends Store {
  /** Private worker instance for handling store operations */
  #worker: Worker;

  /**
   * Creates a new WorkerStore instance.
   * @param worker - The Web Worker instance that will handle store operations
   */
  constructor(worker: Worker) {
    super();
    this.#worker = worker;
  }

  /**
   * Subscribes to worker message events and calls the provided callback.
   * @param cb - Callback function to handle incoming worker messages
   * @returns Unsubscribe function to remove the event listener
   */
  subscribeWorkerMessage(cb: (data: unknown) => void) {
    this.#worker.addEventListener("message", (event) => {
      cb(event.data);
    });

    return () => {
      this.#worker.removeEventListener("message", cb);
    };
  }

  /**
   * Awaits a JSON-RPC response from the worker for a specific request ID.
   * @param id - The request ID to wait for
   * @returns Promise that resolves with the JSON-RPC response
   */
  async awaitJsonRpcResponse(id: string) {
    const jsonRpcPromise = Promise.withResolvers<
      JsonRpcResultPayload | JsonRpcErrorPayload
    >();
    const unsubscribe = this.subscribeWorkerMessage((data) => {
      if (
        typeValidators.isJsonRpcResultPayload(data) ||
        typeValidators.isJsonRpcErrorPayload(data)
      ) {
        if (data.id === id) return jsonRpcPromise.resolve(data);
      }
    });
    await jsonRpcPromise.promise;
    unsubscribe();
    return jsonRpcPromise.promise;
  }

  /**
   * Sends a JSON-RPC request to the worker and awaits the response.
   * @param method - The method name to call on the worker
   * @param params - Parameters to pass to the worker method
   * @param id - Optional request ID (auto-generated if not provided)
   * @returns Promise that resolves with the method result
   * @throws Error if the worker returns an error response
   */
  async workerRequest(
    method: string,
    params: any,
    id: string = crypto.randomUUID(),
  ) {
    const responsePromise = this.awaitJsonRpcResponse(id);
    this.#worker.postMessage({
      jsonrpc: "2.0",
      id,
      method,
      params,
    } satisfies JsonRpcRequestPayload);
    const response = await responsePromise;
    if ("error" in response) {
      throw new Error(
        `Error in worker request: ${response.error.message} (code: ${response.error.code})`,
      );
    }
    return response.result;
  }

  /**
   * Sends a ping request to the worker to check if it's responsive.
   * @returns Promise that resolves with "pong" if the worker is healthy
   * @throws Error if the worker doesn't respond correctly
   */
  async ping(): Promise<string> {
    const result = await this.workerRequest("ping", {});
    if (typeof result !== "string") {
      throw new Error("Invalid ping response from worker");
    }
    return result;
  }

  /**
   * Adds a new message to the store via the worker.
   * @param message - The message to add to the store
   * @returns Promise that resolves when the message is added
   */
  async addMessage(message: Message): Promise<void> {
    await this.workerRequest("addMessage", message);
  }

  /**
   * Retrieves a message by ID from the store via the worker.
   * @param messageId - The ID of the message to retrieve
   * @returns Promise that resolves with the message or null if not found
   * @throws Error if the worker returns invalid message data
   */
  async getMessage(messageId: string): Promise<Message | null> {
    const result = await this.workerRequest("getMessage", { id: messageId });
    if (result === null) return null;
    if (typeValidators.isMessage(result) === false) {
      throw new Error("Invalid message received from worker");
    }
    return Message.from(result);
  }

  /**
   * Acknowledges a message by ID via the worker.
   * @param messageId - The ID of the message to acknowledge
   * @returns Promise that resolves when the message is acknowledged
   */
  async acknowledgeMessage(messageId: string): Promise<void> {
    await this.workerRequest("acknowledgeMessage", { id: messageId });
  }

  /**
   * Deletes a message by ID via the worker.
   * @param messageId - The ID of the message to delete
   * @returns Promise that resolves when the message is deleted
   */
  async deleteMessage(messageId: string): Promise<void> {
    await this.workerRequest("deleteMessage", { id: messageId });
  }

  /**
   * Claims the next available message from the store via the worker.
   * @param acknowledgeTimeoutMs - Timeout in milliseconds for acknowledgment
   * @param now - Current timestamp for timeout calculations
   * @param abort - Optional AbortSignal to cancel the operation
   * @returns Promise that resolves with the claimed message or null if none available
   * @throws Error if the worker returns invalid message data
   */
  async claimMessage(
    acknowledgeTimeoutMs: number,
    now: number,
    abort?: AbortSignal,
  ): Promise<Message | null> {
    const id = crypto.randomUUID();

    abort?.addEventListener(
      "abort",
      () => {
        this.#worker.postMessage({
          jsonrpc: "2.0",
          id,
          method: "claimMessage/abort",
          params: {},
        } satisfies JsonRpcRequestPayload);
      },
      { once: true },
    );

    const result = await this.workerRequest(
      "claimMessage",
      { acknowledgeTimeoutMs, now },
      id,
    );

    if (result === null) return null;
    if (typeValidators.isMessage(result) === false) {
      throw new Error("Invalid message received from worker");
    }

    return Message.from(result);
  }

  /**
   * Gets the current size (number of messages) in the store via the worker.
   * @returns Promise that resolves with the number of messages in the store
   * @throws Error if the worker returns invalid size data
   */
  async getSize(): Promise<number> {
    const result = await this.workerRequest("getSize", {});
    if (typeof result !== "number") {
      throw new Error("Invalid size response from worker");
    }
    return result;
  }

  /**
   * Closes the store. Note: This method doesn't actually close the worker
   * as worker lifecycle is managed externally.
   * @returns Promise that resolves immediately
   */
  async close(): Promise<void> {
    console.warn(
      "WorkerStore.close() called - no action taken as worker lifecycle is managed externally.",
    );
  }
}
