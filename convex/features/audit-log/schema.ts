/**
 * Audit Log Feature Schema
 * Provides audit logging functionality
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const auditLogTables = {
  // Audit log entries
  auditLogs: defineTable({
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    userId: v.id("users"),
    userName: v.optional(v.string()),
    userEmail: v.optional(v.string()),
    changes: v.optional(v.record(v.string(), v.object({
      before: v.any(),
      after: v.any(),
    }))),
    metadata: v.optional(v.record(v.string(), v.any())),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
    workspaceId: v.id("workspaces"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"])
    .index("by_entity", ["entityType", "entityId"])
    .index("by_action", ["action"])
    .index("by_timestamp", ["timestamp"]),
};

export default auditLogTables;
