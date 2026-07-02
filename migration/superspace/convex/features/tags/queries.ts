import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Queries for tags feature
 */

export const getTags = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const tags = await ctx.db
      .query("tags")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(500)

    return tags
  },
})

export const getTagById = query({
  args: {
    workspaceId: v.id("workspaces"),
    tagId: v.id("tags"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const tag = await ctx.db.get(args.tagId)
    if (!tag || tag.workspaceId !== args.workspaceId) {
      return null
    }

    return tag
  },
})
