import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Reports Queries
 */

// List all items
export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    // Require active membership
    await requireActiveMembership(ctx, args.workspaceId)

    const items = await ctx.db
      .query("reports")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(500)

    return items
  },
})

// Get single item
export const get = query({
  args: {
    id: v.id("reports"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id)
    if (!item) return null

    // Verify access
    await requireActiveMembership(ctx, item.workspaceId)

    return item
  },
})
