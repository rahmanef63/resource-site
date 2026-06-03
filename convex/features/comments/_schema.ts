import { defineTable } from "convex/server"
import { v } from "convex/values"

/**
 * comment_threads — v0.2.0 polymorphic-target shape.
 *
 * Renamed from `comments` per per-slice namespace rule. Migration script:
 * scripts/migrations/comments-v0.1.0-to-v0.2.0-polymorphic-target.ts.
 *
 * Target tuple `(targetKind, targetId, targetSubId?)` lets consumers anchor
 * threads against any entity ("page", "blog", "task", ...) without the
 * contract knowing the consumer's data model.
 */
export const commentsTables = {
  comment_threads: defineTable({
    /** Multi-tenant id (e.g. workspaceId) or null for single-tenant. */
    tenantId: v.union(v.string(), v.null()),
    /** Actor user/session id (consumer-resolved via TenantAdapter). */
    actorId: v.string(),
    /** Consumer-defined kind literal — "page", "blog", "task", etc. */
    targetKind: v.string(),
    /** Primary entity id. */
    targetId: v.string(),
    /** Optional secondary anchor (e.g. blockId within a page). */
    targetSubId: v.optional(v.string()),
    /** Parent comment id for replies. Absent on top-level comments. */
    parentId: v.optional(v.id("comment_threads")),
    body: v.string(),
    resolvedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_target_kind_id", ["targetKind", "targetId"])
    .index("by_target_kind_id_subId", ["targetKind", "targetId", "targetSubId"])
    .index("by_parent", ["parentId"])
    .index("by_tenant", ["tenantId"])
    .index("by_actor", ["actorId"]),
}
