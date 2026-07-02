import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Wiki Queries
 */

// List all items
export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    publishedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Require active membership
    await requireActiveMembership(ctx, args.workspaceId)

    const items = await ctx.db
      .query("wiki")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(500)

    const search = args.search?.trim().toLowerCase()
    const category = args.category?.trim().toLowerCase()
    const publishedOnly = args.publishedOnly ?? false

    const filtered = items.filter((item) => {
      if (publishedOnly && item.isPublished === false) return false
      if (category && (item.category ?? "").toLowerCase() !== category) return false
      if (search) {
        const matchesTitle = item.title.toLowerCase().includes(search)
        const matchesSummary = (item.summary ?? "").toLowerCase().includes(search)
        if (!matchesTitle && !matchesSummary) return false
      }
      return true
    })

    filtered.sort((a, b) => b.updatedAt - a.updatedAt)

    return filtered
  },
})

// Get single item
export const get = query({
  args: {
    id: v.id("wiki"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id)
    if (!item) return null

    // Verify access
    await requireActiveMembership(ctx, item.workspaceId)

    return item
  },
})
