/** Framework-neutral compile-time contract for the future AI admin console. */

import type { ModelCapability } from "./types";

export type AiAdminConfig = {
  slug: "ai-admin";
  title: "AI Admin — Contract";
  category: "ai";
  routes: readonly [];
};

export const aiAdminConfig: AiAdminConfig = {
  slug: "ai-admin",
  title: "AI Admin — Contract",
  category: "ai",
  routes: [],
};

/** Section id reserved for hosts that build an admin renderer around this contract. */
export const AI_ADMIN_SECTION_ID = "ai";

/** Canonical tab taxonomy for a future host implementation. */
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

/** Framework-neutral icon names. Hosts choose their own icon renderer. */
export const CAPABILITY_ICON: Record<ModelCapability, string> = {
  vision: "Eye",
  tools: "Wrench",
  "long-context": "FileText",
  fast: "Zap",
  reasoning: "Sparkles",
};

/** Suggested permission names for a future host implementation. */
export const TAB_PERMISSION: Record<AiAdminTabId, string> = {
  providers: "ai.manage_providers",
  models: "ai.manage_models",
  skills: "ai.manage_skills",
  tools: "ai.manage_tools",
  agents: "ai.manage_agents",
  budgets: "ai.manage_budgets",
  audit: "ai.read_audit",
};
