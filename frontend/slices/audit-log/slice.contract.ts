/**
 * Slice contract for `audit-log` — v0.2.0.
 *
 * Adds `TenantAdapter` prop to hoist workspace tenancy out of the contract.
 * Multi-tenant consumers (e.g. superspace) return the active workspaceId;
 * single-tenant consumers (e.g. rahmanef) return null.
 *
 * Convex schema renamed: `auditLogs` → `audit_events` per the per-slice
 * namespace rule. Index `by_workspace` → `by_tenant_id_at` (tenantId, at).
 *
 * Migration script: `audit-log-v0.1.0-to-v0.2.0-tenant-adapter` (see
 * scripts/migrations/). Applied in-place by Convex action.
 *
 * Per docs/contract-negotiations-2026-05-15.md §3.
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "audit-log",
  version: "0.2.0",
  requires: {
    auth: "convex",
    rbac: ["audit.read", "audit.write"],
    convex: { prefix: "audit_", tables: ["audit_events"] },
    deps: ["convex-auth"],
  },
  provides: {
    tables: ["audit_events"],
    hooks: ["createAuditLogger"],
    components: [],
  },
  conflicts: [],
  migrationFrom: {
    "0.1.0": "audit-log-v0.1.0-to-v0.2.0-tenant-adapter",
  },
  bidir: {
    syncPolicy: "manual",
    generalization: {
      level: "needs-adapter",
      forbiddenTerms: ["workspaceId", "auditLogs"],
      requiredProps: ["tenantAdapter", "bindings"],
    },
  },
});
