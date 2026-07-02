import { defineTable } from "convex/server";
import { v } from "convex/values";

export default {
  wishlists: defineTable({
    workspaceId: v.string(),
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
    slug: v.optional(v.string()),
    shareToken: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("archived")
    ),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"])
    .index("by_workspace_user", ["workspaceId", "userId"])
    .index("by_slug", ["slug"])
    .index("by_share_token", ["shareToken"]),

  wishlistItems: defineTable({
    workspaceId: v.string(),
    wishlistId: v.string(),
    itemType: v.union(
      v.literal("product"),
      v.literal("service"),
      v.literal("post"),
      v.literal("portfolio")
    ),
    itemId: v.string(),
    addedBy: v.string(),
    notes: v.optional(v.string()),
    quantity: v.optional(v.number()),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    )),
    status: v.union(
      v.literal("active"),
      v.literal("purchased"),
      v.literal("removed")
    ),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_wishlist", ["wishlistId"])
    .index("by_item", ["itemType", "itemId"])
    .index("by_wishlist_item", ["wishlistId", "itemType", "itemId"]),
} as const;
