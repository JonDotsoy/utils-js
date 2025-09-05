export type JsonRpcPayload =
  | JsonRpcRequestPayload
  | JsonRpcResultPayload
  | JsonRpcErrorPayload;

export interface JsonRpcRequestPayload {
  jsonrpc: "2.0";
  id: string;
  method: string;
  params: unknown;
}

export interface JsonRpcResultPayload {
  jsonrpc: "2.0";
  id: string;
  result: unknown;
}

export interface JsonRpcErrorPayload {
  jsonrpc: "2.0";
  id: string;
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
}
