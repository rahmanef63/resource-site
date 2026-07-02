// MCP JSON-RPC + tool registry types.
//
// Reference:
//   - https://modelcontextprotocol.io/specification/2025-11-25
//   - https://www.jsonrpc.org/specification

export type JsonRpcId = number | string | null;

export type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: JsonRpcId;
  method: string;
  params?: Record<string, unknown>;
};

export type JsonRpcSuccess = {
  jsonrpc: "2.0";
  id: JsonRpcId;
  result: unknown;
};

export type JsonRpcError = {
  jsonrpc: "2.0";
  id: JsonRpcId;
  error: { code: number; message: string; data?: unknown };
};

export type JsonRpcResponse = JsonRpcSuccess | JsonRpcError;

// MCP error codes — JSON-RPC reserved range + a couple MCP-specific.
export const RPC_ERROR = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  UNAUTHORIZED: -32001,
  RATE_LIMITED: -32002,
} as const;

// MCP tool definition. `handler` receives the parsed `arguments` object
// and returns whatever the JSON-RPC `result` payload should be. Throw
// to surface an error to the client.
export type ToolContent =
  | { type: "text"; text: string }
  | { type: "image"; data: string; mimeType: string }
  | { type: "resource"; resource: { uri: string; text?: string; mimeType?: string } };

export type ToolResult = {
  content: ToolContent[];
  isError?: boolean;
};

export type ToolAnnotations = {
  /** Tool only reads — never mutates state. */
  readOnlyHint?: boolean;
  /** Tool may have destructive effects (delete, irreversible mutations). */
  destructiveHint?: boolean;
  /** Tool is idempotent — multiple identical calls = same effect as one. */
  idempotentHint?: boolean;
  /** Hint that this tool talks to external/open-world systems. */
  openWorldHint?: boolean;
};

export type ToolDef = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: ToolAnnotations;
  /** OAuth scope claim required to invoke this tool. Null = always allowed. */
  requiredScope?: string;
  handler: (args: Record<string, unknown>) => Promise<ToolResult> | ToolResult;
};
