import { defineTable } from "convex/server";
import { v } from "convex/values";

export const statuses = defineTable({
  userId: v.id("users"),
  workspaceId: v.id("workspaces"),
  type: v.union(v.literal("text"), v.literal("image"), v.literal("video")),
  content: v.string(),
  storageId: v.optional(v.id("_storage")),
  backgroundColor: v.optional(v.string()),
  textColor: v.optional(v.string()),
  font: v.optional(v.string()),
  viewCount: v.number(),
  createdAt: v.number(),
  expiresAt: v.number(),
  metadata: v.optional(
    v.object({
      caption: v.optional(v.string()),
      duration: v.optional(v.number()),
      thumbnail: v.optional(v.string()),
    })
  ),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_user", ["userId"])
  .index("by_user_workspace", ["userId", "workspaceId"])
  .index("by_expiry", ["expiresAt"])
  .index("by_created_at", ["createdAt"]);

export const statusViews = defineTable({
  statusId: v.id("statuses"),
  viewerId: v.id("users"),
  viewedAt: v.number(),
})
  .index("by_status", ["statusId"])
  .index("by_viewer", ["viewerId"])
  .index("by_status_viewer", ["statusId", "viewerId"]);

export const statusTables = {
  statuses,
  statusViews,
};
