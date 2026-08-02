import { defineTable } from "convex/server";
import { v } from "convex/values";

export const systemNotifications = defineTable({
  workspaceId: v.id("workspaces"),
  userId: v.id("users"),
  type: v.union(
    v.literal("system"),
    v.literal("mention"),
    v.literal("task"),
    v.literal("document"),
    v.literal("project"),
    v.literal("comment"),
  ),
  title: v.string(),
  message: v.string(),
  entityType: v.optional(v.string()),
  entityId: v.optional(v.string()),
  actionUrl: v.optional(v.string()),
  isRead: v.boolean(),
  actorId: v.optional(v.id("users")),
  metadata: v.optional(v.object({})),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_user", ["userId"])
  .index("by_type", ["type"])
  .index("by_user_read", ["userId", "isRead"]);

export const notifications = defineTable({
  userId: v.id("users"),
  workspaceId: v.id("workspaces"),
  type: v.union(
    v.literal("message"),
    v.literal("invitation"),
    v.literal("document"),
    v.literal("system"),
  ),
  title: v.string(),
  message: v.string(),
  actionUrl: v.optional(v.string()),
  metadata: v.optional(v.object({})),
  isRead: v.boolean(),
  createdBy: v.id("users"),
})
  .index("by_user", ["userId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_type", ["type"]);

export const notificationTables = {
  systemNotifications,
  notifications,
};
