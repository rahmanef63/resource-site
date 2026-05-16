/**
 * ai-admin slice — public barrel.
 *
 * Central operator console for the whole AI stack. Plugs into the
 * `admin-panel` slice's ADMIN_SECTIONS registry — the `AI` section
 * surfaces sub-tabs for Providers / Models / Skills / Tools / Agents
 * / Budgets / Audit. Every other ai-* slice reads its registries
 * from here at runtime.
 *
 *   import {
 *     AI_ADMIN_SECTION_ID, AI_ADMIN_TABS, AdminSection,
 *   } from "@/features/ai-admin";
 *
 * Status: scaffold (0.1.0). Real impl pending. UX target at
 * /preview/slices/ai-admin.
 */

export type {
  AIProvider, ProviderStatus, AIModel, ModelCapability,
  AISkill, AITool, AIAgent, Budget, AuditEntry,
} from "./types";
export {
  AI_ADMIN_SECTION_ID, AI_ADMIN_TABS, CAPABILITY_ICON, TAB_PERMISSION,
  type AiAdminTabId,
} from "./config";
