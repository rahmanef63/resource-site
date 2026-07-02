/**
 * ai-admin — section discovery constants + defaults.
 *
 * (Formerly the body of `config.ts` in the rr-vendored slice. Superspace
 * reserves `config.ts` for the `defineFeature()` SSOT consumed by the feature
 * registry, so these console-tab constants live here and are re-exported from
 * the slice barrel `index.ts`.)
 */

import type { ModelCapability } from "./types";

/** Section id registered to admin-panel's ADMIN_SECTIONS registry. */
export const AI_ADMIN_SECTION_ID = "ai";

/** Sub-tabs rendered inside the AI admin section. */
export const AI_ADMIN_TABS = [
  "providers",
  "models",
  "instructions",
  "skills",
  "tools",
  "agents",
] as const;

export type AiAdminTabId = (typeof AI_ADMIN_TABS)[number];

/** Capability badge icon names (lucide-react). */
export const CAPABILITY_ICON: Record<ModelCapability, string> = {
  vision: "Eye",
  tools: "Wrench",
  "long-context": "FileText",
  fast: "Zap",
  reasoning: "Sparkles",
};

/** RBAC permission gating each tab. */
export const TAB_PERMISSION: Record<AiAdminTabId, string> = {
  providers: "ai.manage_providers",
  models: "ai.manage_models",
  instructions: "ai.manage_instructions",
  skills: "ai.manage_skills",
  tools: "ai.manage_tools",
  agents: "ai.manage_agents",
};
