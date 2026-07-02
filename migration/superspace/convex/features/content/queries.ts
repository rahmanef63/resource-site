import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"
import { assertDocWorkspace } from "../lib/rbac"

const CONTENT_LIST_LIMIT = 200

/**
 * Queries for content feature
 */

export const getData = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    // Get documents/pages as content items
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    // Since documents table doesn't have status/views, return basic counts
    const totalItems = documents.length

    // Format recent content
    const recentContent = documents.slice(0, 10).map(doc => ({
      id: doc._id,
      title: doc.title || "Untitled",
      type: "article" as "article" | "page" | "video" | "image",
      author: "User",
      status: "draft" as "published" | "draft" | "scheduled" | "archived",
      views: 0,
    }))

    return {
      stats: {
        totalItems,
        published: 0,
        drafts: totalItems,
        scheduled: 0,
        views: 0,
      },
      recentContent,
    }
  },
})

export const listContent = query({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("published"),
        v.literal("scheduled"),
        v.literal("archived"),
      ),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const limit = Math.min(args.limit ?? CONTENT_LIST_LIMIT, CONTENT_LIST_LIMIT)
    const rows = await ctx.db
      .query("content")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(limit)
    return rows.filter((r) => {
      if (args.type !== undefined && r.type !== args.type) return false
      if (args.status !== undefined && r.status !== args.status) return false
      return true
    })
  },
})

export const getContent = query({
  args: { workspaceId: v.id("workspaces"), contentId: v.id("content") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const row = await ctx.db.get(args.contentId)
    assertDocWorkspace(row, args.workspaceId, "content")
    return row
  },
})
