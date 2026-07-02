import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requirePermission, resolveCandidateUserIds } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"
import type { Id } from "../../_generated/dataModel"

/**
 * Mutations for search feature
 */

// @dod:skip-audit reason="search history telemetry — high-frequency per-keystroke, the searchHistory row IS itself the audit trail; auditing every search would double-write and spam the audit log"
export const search = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.SEARCH_VIEW)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    // Log this search
    await ctx.db.insert("searchHistory", {
      workspaceId: args.workspaceId,
      userId,
      query: args.query,
      resultsCount: 0,
      entities: [],
      timestamp: Date.now(),
    })

    return { success: true }
  },
})

export const saveSearch = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    query: v.string(),
    name: v.optional(v.string()),
    filters: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.SEARCH_VIEW)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    const id = await ctx.db.insert("savedSearches", {
      workspaceId: args.workspaceId,
      userId,
      query: args.query,
      name: args.name || args.query,
      description: undefined,
      filters: args.filters ? [args.filters] : undefined,
      sort: undefined,
      tags: [],
      entities: [],
      isPublic: false,
      usageCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "search.saved",
      resourceType: "savedSearch",
      resourceId: String(id),
      metadata: { query: args.query },
    })

    return { id, success: true }
  },
})

export const deleteSearch = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    searchId: v.id("savedSearches"),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.SEARCH_VIEW)

    const candidateIds = await resolveCandidateUserIds(ctx)
    const userId = candidateIds[0] as Id<"users"> | undefined

    const search = await ctx.db.get(args.searchId)
    if (!search || search.workspaceId !== args.workspaceId) {
      throw new Error("Search not found")
    }

    const deletedId = String(args.searchId)
    await ctx.db.delete(args.searchId)

    if (userId) {
      await logAuditEvent(ctx, {
        workspaceId: args.workspaceId,
        actorUserId: userId,
        action: "search.deleted",
        resourceType: "savedSearch",
        resourceId: deletedId,
      })
    }

    return { success: true }
  },
})
