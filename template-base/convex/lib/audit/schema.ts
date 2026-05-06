/**
 * Audit log schema — `activityEvents` is the canonical immutable
 * audit-event table. Backfilled from superspace's
 * convex/features/cmsLite/activityEvents/api/schema.ts.
 *
 * This table backs `logAudit` in convex/lib/audit/logger.ts. Every
 * mutation that changes workspace state writes a row here for
 * compliance + replay + debug.
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

const activityEvents = defineTable({
  actorUserId: v.id("users"),
  workspaceId: v.id("workspaces"),
  actorId: v.optional(v.string()),
  entityType: v.string(),
  entity: v.optional(v.string()),
  entityId: v.string(),
  action: v.string(),
  diff: v.optional(v.any()),
  changes: v.optional(v.any()),
  createdAt: v.number(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_actor", ["actorUserId"])
  .index("by_entity", ["entityType", "entityId"]);

export const auditTables = {
  activityEvents,
};
