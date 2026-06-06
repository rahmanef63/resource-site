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

// Host wiring seam (real LLM replies as an async text-delta stream).
export { configureAssistantStream } from "./lib/host";
export type { AssistantStreamFn, WireMsg, AppDescriptor } from "./lib/host";

export { assistantConfig } from "./config";
export type { AssistantConfig } from "./config";
