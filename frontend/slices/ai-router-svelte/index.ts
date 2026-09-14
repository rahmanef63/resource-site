export { default as ChatFab } from "./components/ChatFab.svelte";
export { aiRouterConfig, type AiRouterConfig } from "../ai-router/config";
export { aiRouterTools, type AiRouterCtx } from "../ai-router/lib/tools";
export {
  AI_ROUTER_TIERS,
  AI_ROUTER_UNCONFIGURED_NOTICE,
  assistantMessage,
  greetingMessage,
  routePrompt,
  userMessage,
  type AiRouterMessage,
  type AiRouterRequest,
  type AiRouterResult,
  type AiRouterRoute,
  type RouteTier,
} from "../ai-router/lib/core";
