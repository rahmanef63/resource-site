import { Sparkles } from "lucide-react";
import type { AppDescriptor } from "./lib/host";

// Public barrel — consumers import ONLY from here.
//
// Two ways in:
//   1. <Assistant /> — mount the agent workspace directly. Unwired it runs a
//      typing demo stream; agents/skills/automations persist in localStorage.
//   2. `assistantApp` — appshell-style descriptor (lazy `load`) for hosts
//      that mount apps via a dock/launcher manifest.
export { default as Assistant } from "./app";

export const assistantApp: AppDescriptor = {
  id: "assistant",
  title: "Alfa",
  icon: Sparkles,
  gradient: "linear-gradient(160deg,#a855f7,#6d28d9)",
  load: () => import("./app"),
  defaultSize: { w: 520, h: 620 },
};

// Central agent host: register each installed slice's ToolCollection once
// (registerAssistantTools) and wire the ONE shared model seam
// (configureAgentStream) — the chat then function-calls across every slice.
export { registerAssistantTools, getAssistantRegistry } from "./lib/agentic-host";
export { configureAgentStream, isAgentStreamConfigured } from "./lib/host";
export type { AgentStreamFn } from "./lib/host";

// Deprecated text-only seam (kept for back-compat; funnels into the shared one).
export { configureAssistantStream } from "./lib/host";
export type { AssistantStreamFn, WireMsg, AppDescriptor } from "./lib/host";

export { assistantConfig } from "./config";
export type { AssistantConfig } from "./config";
