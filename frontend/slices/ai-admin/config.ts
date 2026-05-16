/** Compile-time config for ai-admin section discovery + defaults. */

import type { ModelCapability } from "./types";

/** Section id registered to admin-panel's ADMIN_SECTIONS registry. */
export const AI_ADMIN_SECTION_ID = "ai";

/** Sub-tabs rendered inside the AI admin section. */
export const AI_ADMIN_TABS = [
  "providers",
  "models",
  "skills",
  "tools",
  "agents",
  "budgets",
  "audit",
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
  skills: "ai.manage_skills",
  tools: "ai.manage_tools",
  agents: "ai.manage_agents",
  budgets: "ai.manage_budgets",
  audit: "ai.read_audit",
};
