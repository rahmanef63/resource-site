import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Calendar Queries
 */

// List all items
export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
    rangeStart: v.optional(v.number()),
    rangeEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Require active membership
    await requireActiveMembership(ctx, args.workspaceId)

    const items = await ctx.db
      .query("calendar")
      .withIndex("by_workspace_start", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    const { rangeStart, rangeEnd } = args
    if (rangeStart === undefined && rangeEnd === undefined) {
      return items
    }

    return items.filter((event) => {
      const eventStarts = event.startsAt
      const eventEnds = event.endsAt ?? eventStarts
      if (rangeStart !== undefined && eventEnds < rangeStart) return false
      if (rangeEnd !== undefined && eventStarts > rangeEnd) return false
      return true
    })
  },
})

// Get single item
export const get = query({
  args: {
    id: v.id("calendar"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id)
    if (!item) return null

    // Verify access
    await requireActiveMembership(ctx, item.workspaceId)

    return item
  },
})
