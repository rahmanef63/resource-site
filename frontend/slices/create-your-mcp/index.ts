// create-your-mcp — turn any rr-based app into an MCP server that
// ChatGPT custom apps, Claude.ai connectors, Cursor MCP, and other AI
// clients can authenticate to via OAuth 2.1 + PKCE.
//
// Architecture:
//   - Convex backend (convex/features/create_your_mcp/) holds the
//     oauthCodes + oauthAccessTokens tables + PKCE helpers + mutations
//     (createCode/exchangeCode/revokeToken/touchToken) + queries
//     (adminList, findToken).
//   - Two Next.js API route templates (routes/) drop into the consumer's
//     app/api/ tree: /api/mcp (Bearer-gated JSON-RPC) + /api/oauth/token
//     (RFC 6749 §3.2 token endpoint).
//   - One admin view (views/McpAdminView.tsx) shows live tokens + the
//     setup form to paste into the AI client's connector UI.

// Client-safe surface only. Server-only modules MUST be deep-imported:
//   - `./lib/context` (AsyncLocalStorage — node:async_hooks)
//   - `./lib/auth` (process.env access — fine in browser but admin-side)
//   - `./lib/server` (pure dispatcher — safe but no reason to barrel)
// The route templates in routes/ already deep-import these, so consumer
// wiring doesn't need barrel re-exports for server bits.
//
// Pulling server-only modules into this barrel breaks the preview build
// because Next/Turbopack chunks the entire barrel into the client bundle
// when any client component imports any single name from it.

export { createYourMcpFeature } from "./config";
export {
  McpAdminView,
  type McpAdminViewProps,
  type McpTokenRow,
  type SetupField,
} from "./views/McpAdminView";
export type {
  ToolDef,
  ToolResult,
  ToolContent,
  ToolAnnotations,
  JsonRpcRequest,
  JsonRpcResponse,
} from "./lib/types";
