import { defineTable } from "convex/server"
import { v } from "convex/values"

// Comments table — page/block-attached threaded comments.
// Workspace-isolated; soft-delete supported via `deletedAt`.
export const commentsTables = {
  comments: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    pageId: v.id("pages"),
    // Block-anchored comments use blockId; page-level comments leave it undefined.
    blockId: v.optional(v.string()),
    body: v.string(),
    // Resolved threads stay visible but greyed; null = active.
    resolvedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_page", ["pageId"])
    .index("by_block", ["blockId"])
    .index("by_user", ["userId"]),
}
