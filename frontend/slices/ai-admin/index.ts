/**
 * ai-admin — framework-neutral compile-time contract.
 *
 * The canonical slice intentionally ships types and taxonomy/config constants
 * only. It does not ship an admin renderer, persistence schema, provider-key
 * storage, CRUD operations, or authorization implementation.
 */

export type {
  AIProvider,
  ProviderStatus,
  AIModel,
  ModelCapability,
  AISkill,
  AITool,
  AIAgent,
  Budget,
  AuditEntry,
} from "./types";
export {
  aiAdminConfig,
  AI_ADMIN_SECTION_ID,
  AI_ADMIN_TABS,
  CAPABILITY_ICON,
  TAB_PERMISSION,
  type AiAdminConfig,
  type AiAdminTabId,
} from "./config";
