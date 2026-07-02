import { v } from "convex/values"
import { query } from "../../../_generated/server"
import { requireActiveMembership } from "../../../auth/helpers"

/**
 * Agent-facing queries for blog.
 */

export const summarize = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(200)

    const counts = posts.reduce(
      (acc, p) => {
        acc[p.status] = (acc[p.status] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      featureSlug: "blog",
      total: posts.length,
      byStatus: counts,
    }
  },
})
