import { defineTable } from "convex/server";
import { v } from "convex/values";

// Social contact requests (user-to-user connection requests)
export const socialContactRequests = defineTable({
  senderId: v.id("users"),
  receiverId: v.id("users"),
  status: v.union(
    v.literal("pending"),
    v.literal("accepted"),
    v.literal("declined"),
    v.literal("blocked"),
  ),
  message: v.optional(v.string()),
  sentAt: v.number(),
  respondedAt: v.optional(v.number()),
})
  .index("by_sender", ["senderId"])
  .index("by_receiver", ["receiverId"])
  .index("by_sender_receiver", ["senderId", "receiverId"])
  .index("by_status", ["status"]);

// Social contacts (user-to-user connections, formerly "friendships")
export const socialContacts = defineTable({
  user1Id: v.id("users"),
  user2Id: v.id("users"),
  status: v.union(v.literal("active"), v.literal("blocked")),
  createdAt: v.number(),
  blockedBy: v.optional(v.id("users")),
})
  .index("by_user1", ["user1Id"])
  .index("by_user2", ["user2Id"])
  .index("by_users", ["user1Id", "user2Id"]);

export const starredItems = defineTable({
  userId: v.id("users"),
  workspaceId: v.id("workspaces"),
  itemType: v.union(v.literal("message"), v.literal("document"), v.literal("comment")),
  itemId: v.string(),
  starredAt: v.number(),
  metadata: v.optional(
    v.object({
      title: v.optional(v.string()),
      preview: v.optional(v.string()),
      author: v.optional(v.string()),
    })
  ),
})
  .index("by_user", ["userId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_user_workspace", ["userId", "workspaceId"])
  .index("by_item", ["itemType", "itemId"]);

export const socialTables = {
  socialContactRequests,
  socialContacts,
  starredItems,
};
