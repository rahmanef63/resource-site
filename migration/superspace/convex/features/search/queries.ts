import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership, resolveCandidateUserIds } from "../../auth/helpers"

/**
 * Queries for search feature
 */

export const getRecentSearches = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) return []

    // Get recent searches for this user in this workspace
    const searches = await ctx.db
      .query("searchHistory")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(50)

    // Filter by current user
    const filtered = searches.filter(s => candidateIds.includes(String(s.userId)))

    return filtered.slice(0, 10)
  },
})

export const getSavedSearches = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) return []

    const searches = await ctx.db
      .query("savedSearches")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    // Filter by current user
    return searches.filter(s => candidateIds.includes(String(s.userId)))
  },
})

export const globalSearch = query({
  args: {
    workspaceId: v.id("workspaces"),
    query: v.string(),
    filters: v.optional(v.object({
      types: v.optional(v.array(v.string())),
      dateRange: v.optional(v.object({
        from: v.optional(v.number()),
        to: v.optional(v.number()),
      })),
    })),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const searchQuery = args.query.toLowerCase()
    const results: any[] = []

    // Search in documents
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    for (const doc of documents) {
      if (
        doc.title?.toLowerCase().includes(searchQuery) ||
        doc.content?.toLowerCase().includes(searchQuery)
      ) {
        results.push({
          id: doc._id,
          type: "document",
          title: doc.title || "Untitled",
          snippet: doc.content?.substring(0, 200) || "",
          createdAt: doc._creationTime,
        })
      }
    }

    // Search in tasks
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    for (const task of tasks) {
      if (
        task.title?.toLowerCase().includes(searchQuery) ||
        task.description?.toLowerCase().includes(searchQuery)
      ) {
        results.push({
          id: task._id,
          type: "task",
          title: task.title || "Untitled Task",
          snippet: task.description?.substring(0, 200) || "",
          createdAt: task._creationTime,
        })
      }
    }

    // Sort by relevance (simple: exact match first, then by date)
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase() === searchQuery
      const bExact = b.title.toLowerCase() === searchQuery
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      return b.createdAt - a.createdAt
    })

    return results.slice(0, 50)
  },
})
