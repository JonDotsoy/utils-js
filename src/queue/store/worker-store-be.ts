/**
 * Worker Store Backend - Handles JSON-RPC requests in a Web Worker context.
 * This module provides the backend implementation for the WorkerStore that runs
 * inside a Web Worker to handle message store operations asynchronously.
 */

import { Message } from "../queue.js";
import { MemoryStore } from "./memory-store.js";
import type {
  JsonRpcErrorPayload,
  JsonRpcResultPayload,
} from "./utils/dto/json-rpc-payload.js";
import { parseJsonRpcRequest } from "./utils/parse-json-rpc-payload.js";
import { typeValidators } from "./utils/type-validators.js";

/**
 * Custom error class for JSON-RPC error responses.
 * Extends the standard Error class with JSON-RPC specific properties.
 */
class JsonRpcError extends Error {
  /**
   * Creates a new JsonRpcError instance.
   * @param code - The JSON-RPC error code
   * @param message - The error message
   * @param id - The request ID associated with this error (optional)
   */
  constructor(
    public code: number,
    message: string,
  ) {
    super(message);
  }
}

/** Worker instance reference for handling messages */
const worker = self as unknown as Worker;

/** Memory store instance for managing messages */
const store = new MemoryStore();

/** Map to track abort controllers for cancellable operations */
const abortControllers = new Map<string, AbortController>();

/**
 * Main message event listener for handling JSON-RPC requests from the main thread.
 * Processes various store operations and responds with appropriate JSON-RPC responses.
 */
worker.addEventListener("message", async (event) => {
  let requestId: string | null = null;
  try {
    const data = parseJsonRpcRequest(event.data);

    if (!data)
      throw new JsonRpcError(-32700, "Parse error: invalid JSON-RPC request");

    const id = data.id;
    requestId = id;
    const method = data.method;
    const params: any = data.params;

    // Ping method - health check endpoint
    if (method === "ping") {
      worker.postMessage({
        jsonrpc: "2.0",
        id,
        result: "pong",
      } satisfies JsonRpcResultPayload);
      return;
    }

    // Add message method - stores a new message in the queue
    if (method === "addMessage") {
      if (typeValidators.isMessage(params) === false) {
        throw new JsonRpcError(
          -32602,
          "Invalid params: 'params' must be a valid Message object",
        );
      }
      await store.addMessage(Message.from(params));
      worker.postMessage({
        jsonrpc: "2.0",
        id,
        result: true,
      } satisfies JsonRpcResultPayload);
      return;
    }

    // Get message method - retrieves a message by ID
    if (method === "getMessage") {
      if (typeof params.id !== "string") {
        throw new JsonRpcError(-32602, "Invalid params: 'id' must be a string");
      }
      const message = await store.getMessage(params.id);
      worker.postMessage({
        jsonrpc: "2.0",
        id,
        result: message,
      } satisfies JsonRpcResultPayload);
      return;
    }

    // Acknowledge message method - marks a message as acknowledged
    if (method === "acknowledgeMessage") {
      if (typeof params.id !== "string") {
        throw new JsonRpcError(-32602, "Invalid params: 'id' must be a string");
      }
      await store.acknowledgeMessage(params.id);
      worker.postMessage({
        jsonrpc: "2.0",
        id,
        result: true,
      } satisfies JsonRpcResultPayload);
      return;
    }

    // Delete message method - removes a message from the store
    if (method === "deleteMessage") {
      if (typeof params.id !== "string") {
        throw new JsonRpcError(-32602, "Invalid params: 'id' must be a string");
      }
      await store.deleteMessage(params.id);
      worker.postMessage({
        jsonrpc: "2.0",
        id,
        result: true,
      } satisfies JsonRpcResultPayload);
      return;
    }

    // Claim message abort method - cancels an ongoing claim operation
    if (method === "claimMessage/abort") {
      const abortController = abortControllers.get(id);
      if (abortController) {
        abortController.abort();
        abortControllers.delete(id);
      }
      worker.postMessage({
        jsonrpc: "2.0",
        id,
        result: true,
      } satisfies JsonRpcResultPayload);
      return;
    }

    // Claim message method - claims the next available message with timeout
    if (method === "claimMessage") {
      if (typeof params.acknowledgeTimeoutMs !== "number") {
        throw new JsonRpcError(
          -32602,
          "Invalid params: 'acknowledgeTimeoutMs' must be a number",
        );
      }
      if (typeof params.now !== "number") {
        throw new JsonRpcError(
          -32602,
          "Invalid params: 'now' must be a number",
        );
      }
      const abortController = new AbortController();
      abortControllers.set(id, abortController);
      const message = await store.claimMessage(
        params.acknowledgeTimeoutMs,
        params.now,
        abortController.signal,
      );
      worker.postMessage({
        jsonrpc: "2.0",
        id,
        result: message,
      } satisfies JsonRpcResultPayload);
      return;
    }

    // Get size method - returns the number of messages in the store
    if (method === "getSize") {
      const size = await store.getSize();
      worker.postMessage({
        jsonrpc: "2.0",
        id,
        result: size,
      } satisfies JsonRpcResultPayload);
      return;
    }

    // Close method - closes the store and cleans up resources
    if (method === "close") {
      await store.close();
      worker.postMessage({
        jsonrpc: "2.0",
        id,
        result: true,
      } satisfies JsonRpcResultPayload);
      return;
    }

    throw new JsonRpcError(-32601, "Method not found");
  } catch (error) {
    if (error instanceof JsonRpcError) {
      const errorJsonRpc: JsonRpcErrorPayload = {
        jsonrpc: "2.0",
        id: requestId ?? crypto.randomUUID(),
        error: {
          code: error.code,
          message: error.message,
        },
      };
      worker.postMessage(errorJsonRpc);
      return;
    }
    console.error("Error handling message:", error);
  }
});
