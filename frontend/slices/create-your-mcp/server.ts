// Server-only entrypoint for MCP/OAuth transport and Convex integration.
export { createConvexMcpBackend, getEnvConvexMcpBackend } from "./lib/backend";
export type {
  McpBackend,
  ExchangeCodeArgs,
  ExchangeCodeResult,
  TokenLookup,
} from "./lib/backend";
export { checkAuth, extractBearer, tokenMatches } from "./lib/auth";
export { dispatchJsonRpc } from "./lib/server";
export { handleMcpGet, handleMcpPost } from "./lib/mcp-http";
export type { McpHttpOptions } from "./lib/mcp-http";
export { handleOauthTokenGet, handleOauthTokenPost } from "./lib/oauth-http";
export { runWithMcpContext, getMcpContext } from "./lib/context";
