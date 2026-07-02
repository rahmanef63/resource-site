/**
 * ai-admin slice — public barrel.
 *
 * Central operator console for the whole AI stack. Surfaces sub-tabs for
 * Providers / Models / Instructions / Skills / Tools / Agents. Every other
 * ai-* slice reads its registries from here at runtime.
 *
 *   import {
 *     AI_ADMIN_SECTION_ID, AI_ADMIN_TABS,
 *   } from "@/frontend/slices/ai-admin";
 *
 * Status: non-functional scaffold (0.1.0). Feature config SSOT is `./config`
 * (`defineFeature`); page renders at /dashboard/ai-admin. Real impl pending.
 */

export { default as aiAdminConfig } from "./config"

export type {
  AIProvider, ProviderStatus, AIModel, ModelCapability,
  AISkill, AITool, AIAgent, Budget, AuditEntry,
} from "./types";
export {
  AI_ADMIN_SECTION_ID, AI_ADMIN_TABS, CAPABILITY_ICON, TAB_PERMISSION,
  type AiAdminTabId,
} from "./sections";
