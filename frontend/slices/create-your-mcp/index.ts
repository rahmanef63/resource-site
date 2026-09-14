// Client-safe public barrel. Server transport/backend exports live in ./server
// so importing McpAdminView never drags node:async_hooks into browser chunks.
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
