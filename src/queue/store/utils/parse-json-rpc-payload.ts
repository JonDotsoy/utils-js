import type {
  JsonRpcErrorPayload,
  JsonRpcRequestPayload,
  JsonRpcResultPayload,
} from "./dto/json-rpc-payload.js";
import { typeValidators } from "./type-validators.js";

export const parseJsonRpcRequest = (
  data: unknown,
): JsonRpcRequestPayload | null => {
  if (typeValidators.isJsonRpcRequestPayload(data)) return data;
  return null;
};

export const parseJsonRpcResult = (
  data: unknown,
): JsonRpcResultPayload | null => {
  if (typeValidators.isJsonRpcResultPayload(data)) return data;
  return null;
};

export const parseJsonRpcError = (
  data: unknown,
): JsonRpcErrorPayload | null => {
  if (typeValidators.isJsonRpcErrorPayload(data)) return data;
  return null;
};
