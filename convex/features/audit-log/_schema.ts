/**
 * Audit Log Feature Schema — v0.2.0.
 *
 * Tenant-aware audit event recorder. `tenantId` is optional (null for
 * single-tenant consumers). Action follows `feature.entity.verb`
 * convention (e.g. `workspace.member.invite`).
 *
 * Renamed from `auditLogs` → `audit_events` per per-slice namespace rule.
 * See scripts/migrations/audit-log-v0.1.0-to-v0.2.0-tenant-adapter.ts.
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const auditLogTables = {
  audit_events: defineTable({
    /** Multi-tenant id (e.g. workspaceId) or null for single-tenant. */
    tenantId: v.union(v.string(), v.null()),
    /** Actor user/session id (consumer-resolved via TenantAdapter). */
    actorId: v.string(),
    /** Verb following `feature.entity.verb` convention. */
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    /** Event timestamp (ms since epoch). */
    at: v.number(),
    diff: v.optional(
      v.record(
        v.string(),
        v.object({ before: v.any(), after: v.any() })
      )
    ),
    metadata: v.optional(v.record(v.string(), v.any())),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })
    .index("by_tenant_id_at", ["tenantId", "at"])
    .index("by_actor", ["actorId"])
    .index("by_entity", ["entityType", "entityId"])
    .index("by_action", ["action"]),
};

export default auditLogTables;
