import { defineTable } from "convex/server";
import { v } from "convex/values";

export const activityEvents = defineTable({
  actorUserId: v.id("users"),
  workspaceId: v.id("workspaces"),
  entityType: v.string(),
  entityId: v.string(),
  action: v.string(),
  diff: v.optional(v.any()),
  createdAt: v.number(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_actor", ["actorUserId"])
  .index("by_entity", ["entityType", "entityId"]);

export const activityTables = {
  activityEvents,
};
