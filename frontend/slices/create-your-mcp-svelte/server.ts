// Server-only SvelteKit entrypoint.
export { createSvelteKitMcpHandlers } from "./routes/mcp";
export type { SvelteMcpRouteOptions } from "./routes/mcp";
export { createSvelteKitOauthTokenHandlers } from "./routes/oauth-token";
export {
  createConvexMcpBackend,
  getEnvConvexMcpBackend,
  checkAuth,
  extractBearer,
  tokenMatches,
  dispatchJsonRpc,
  handleMcpGet,
  handleMcpPost,
  handleOauthTokenGet,
  handleOauthTokenPost,
  runWithMcpContext,
  getMcpContext,
} from "../create-your-mcp/server";
export type {
  McpBackend,
  ExchangeCodeArgs,
  ExchangeCodeResult,
  TokenLookup,
  McpHttpOptions,
} from "../create-your-mcp/server";
