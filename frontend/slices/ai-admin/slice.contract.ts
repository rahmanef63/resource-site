/**
 * Slice contract for `ai-admin` — v0.2.0.
 *
 * Operator console for the whole AI stack (providers, models, skills, tools,
 * agents, budgets, audit). Plugs into the admin-panel section registry; every
 * other ai-* slice reads its registries from here.
 *
 * Convex tables: aiAdminTables (see `convex/features/ai-admin/schema.ts`).
 * API keys are AES-encrypted at rest via AI_ADMIN_ENCRYPTION_KEY.
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "ai-admin",
  version: "0.2.0",
  requires: {
    auth: "convex",
    rbac: ["admin.read", "admin.write"],
    env: ["AI_ADMIN_ENCRYPTION_KEY"],
    deps: ["convex-auth", "rbac-roles", "admin-panel", "audit-log"],
  },
  provides: {
    components: [
      "AdminSection",
      "ProvidersTable",
      "ModelsGrid",
      "SkillsGrid",
      "ToolsTable",
      "AgentsTable",
      "BudgetsCard",
      "AuditTable",
    ],
  },
  conflicts: [],
  bidir: {
    syncPolicy: "manual",
    generalization: {
      level: "portable",
      forbiddenTerms: ["rahmanef", "rahmanef.com"],
      requiredProps: [],
    },
  },
});
