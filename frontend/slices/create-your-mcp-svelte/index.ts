// Client-safe Svelte barrel. Import server handler factories from ./server.
export { default as McpAdminView } from "./views/McpAdminView.svelte";
export { default as McpSetupPanel } from "./views/McpSetupPanel.svelte";
export { default as McpTokenTable } from "./views/McpTokenTable.svelte";
export { createYourMcpConfig, type CreateYourMcpSvelteConfig } from "./config";
export type {
  McpTokenRow,
  SetupField,
  SetupFieldKind,
} from "../create-your-mcp/views/mcp-admin-helpers";
export type {
  ToolDef,
  ToolResult,
  ToolContent,
  ToolAnnotations,
  JsonRpcRequest,
  JsonRpcResponse,
} from "../create-your-mcp/lib/types";
