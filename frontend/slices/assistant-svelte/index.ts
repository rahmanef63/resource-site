export { default as Assistant } from "./components/Assistant.svelte";
export { default as ChatPanel } from "./components/ChatPanel.svelte";
export { assistantConfig, type AssistantSvelteConfig } from "./config";

export const assistantApp = {
  id: "assistant",
  title: "Alfa",
  icon: "sparkles",
  gradient: "linear-gradient(160deg,#a855f7,#6d28d9)",
  load: () => import("./components/Assistant.svelte"),
  defaultSize: { w: 520, h: 620 },
};

export { registerAssistantTools, getAssistantRegistry } from "@/features/assistant/lib/agentic-host";
export {
  configureAgentStream,
  configureAssistantStream,
  isAgentStreamConfigured,
  streamReply,
  type AgentStreamFn,
  type AssistantStreamFn,
  type WireMsg,
} from "@/features/assistant/lib/stream-core";
export {
  activeAgentOf,
  assistantStoreActions,
  getAssistantStoreSnapshot,
  subscribeAssistantStore,
  type AssistantStoreState,
} from "@/features/assistant/lib/store-core";
export {
  ASSISTANT_SUGGESTED,
  assistantErrorText,
  automationDemoMessage,
  automationPrompt,
  runAssistantTurn,
} from "@/features/assistant/lib/chat-core";
export {
  assistantCatalog,
  catalogGroups,
  toolsForAgent,
  toolById,
} from "@/features/assistant/lib/tools";
export type { Agent, Automation, AutomationStep, ChatMessage, Skill, Tool } from "@/features/assistant/lib/types";
