// create-your-mcp — turn any rr-based app into an MCP server that
// ChatGPT custom apps, Claude.ai connectors, Cursor MCP, and other AI
// clients can authenticate to via OAuth 2.1 + PKCE.
//
// Architecture:
//   - Convex backend (convex/features/create-your-mcp/) holds the
//     oauthCodes + oauthAccessTokens tables + PKCE helpers + mutations
//     (createCode/exchangeCode/revokeToken/touchToken) + queries
//     (adminList, findToken).
//   - Two Next.js API route templates (routes/) drop into the consumer's
//     app/api/ tree: /api/mcp (Bearer-gated JSON-RPC) + /api/oauth/token
//     (RFC 6749 §3.2 token endpoint).
//   - One admin view (views/McpAdminView.tsx) shows live tokens + the
//     setup form to paste into the AI client's connector UI.

export { createYourMcpFeature } from "./config";
export { McpAdminView, type McpAdminViewProps, type McpTokenRow, type SetupField } from "./views/McpAdminView";
export type { ToolDef, ToolResult, ToolContent, ToolAnnotations, JsonRpcRequest, JsonRpcResponse } from "./lib/types";
export { dispatchJsonRpc, type ServerInfo, type DispatchOptions } from "./lib/server";
export { checkAuth, extractBearer, scopeAllows, type AuthResult } from "./lib/auth";
export { runWithMcpContext, getMcpContext, type McpContext } from "./lib/context";
