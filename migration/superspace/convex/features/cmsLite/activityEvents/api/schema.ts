import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tables = {
  activityEvents: defineTable({
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
    .index("by_entity", ["entityType", "entityId"]),
} as const;
