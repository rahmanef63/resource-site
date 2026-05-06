/**
 * Canonical AI agent registry/router facade.
 */

export type {
  SubAgent,
  SubAgentTool,
  SubAgentContext,
  SubAgentResponse,
  ToolParameter,
  ToolResult,
  ToolCall,
  LLMToolDefinition,
  SubAgentRegistryEntry,
  RoutingOptions,
  RoutingResult,
  AgentSuggestion,
} from "./types";

export {
  subAgentRegistry,
  SubAgentRegistry,
  getAgentById,
  AVAILABLE_AGENTS,
  listAvailableAgents as listRegisteredAgents,
  subAgentRegistryInstance,
} from "./registry";

export {
  executeTool,
  executeToolCall,
  processSubAgentQuery,
  buildAgentSystemPrompt,
  formatToolResult,
  getAgentSummary,
  listAvailableAgents,
} from "./router";

export type { AgentFallback } from "../registry";
export { frontendAgentRegistry } from "../registry";
