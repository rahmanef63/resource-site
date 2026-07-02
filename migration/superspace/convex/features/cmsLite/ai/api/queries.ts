import { query } from "../../../../_generated/server"
import { v } from "convex/values"
import {
  ensureUser,
  requireActiveMembership,
} from "../../../../auth/helpers"

const DEFAULT_SETTINGS = {
  enabled: true,
  defaultLocale: "id" as const,
  rateLimitPerMinute: 10,
  rateLimitPerHour: 100,
  systemPromptId: "",
  systemPromptEn: "",
  systemPromptAr: "",
  personality: "professional" as const,
  customPersonality: "",
}

export const getSettings = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await ensureUser(ctx)
    await requireActiveMembership(ctx, args.workspaceId)
    const row = await ctx.db
      .query("cmsLiteAiSettings")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first()
    if (!row) {
      return {
        _id: null,
        workspaceId: args.workspaceId,
        ...DEFAULT_SETTINGS,
        updatedAt: 0,
      }
    }
    return row
  },
})

export const listKBDocuments = query({
  args: {
    workspaceId: v.id("workspaces"),
    category: v.optional(v.string()),
    activeOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ensureUser(ctx)
    await requireActiveMembership(ctx, args.workspaceId)
    const limit = Math.min(Math.max(args.limit ?? 200, 1), 1000)
    let rows
    if (args.category) {
      rows = await ctx.db
        .query("cmsLiteAiKnowledgeBase")
        .withIndex("by_workspace_category", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("category", args.category!),
        )
        .order("desc")
        .take(limit)
    } else if (args.activeOnly) {
      rows = await ctx.db
        .query("cmsLiteAiKnowledgeBase")
        .withIndex("by_workspace_active", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("active", true),
        )
        .order("desc")
        .take(limit)
    } else {
      rows = await ctx.db
        .query("cmsLiteAiKnowledgeBase")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .order("desc")
        .take(limit)
    }
    return { documents: rows }
  },
})

const STATS_WINDOW_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const STATS_SCAN_CAP = 10000

export const getStats = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await ensureUser(ctx)
    await requireActiveMembership(ctx, args.workspaceId)

    const since = Date.now() - STATS_WINDOW_MS
    const rows = await ctx.db
      .query("cmsLiteAiActivity")
      .withIndex("by_workspace_createdAt", (q) =>
        q.eq("workspaceId", args.workspaceId).gte("createdAt", since),
      )
      .order("desc")
      .take(STATS_SCAN_CAP)

    const totalRequests = rows.length
    let rateLimitedRequests = 0
    let totalMessageLength = 0
    let totalResponseLength = 0
    const requestsByLocale: Record<string, number> = {}

    for (const r of rows) {
      if (r.rateLimited) rateLimitedRequests++
      totalMessageLength += r.messageLength
      totalResponseLength += r.responseLength
      requestsByLocale[r.locale] = (requestsByLocale[r.locale] ?? 0) + 1
    }

    const averageMessageLength =
      totalRequests > 0 ? Math.round(totalMessageLength / totalRequests) : 0
    const averageResponseLength =
      totalRequests > 0 ? Math.round(totalResponseLength / totalRequests) : 0

    // Recent 50 for the activity tab. Slice from the already-sorted rows.
    const recentActivity = rows.slice(0, 50).map((r) => ({
      id: r._id,
      userId: r.userId ? String(r.userId) : (r.externalUserId ?? "anonymous"),
      messageLength: r.messageLength,
      responseLength: r.responseLength,
      referencesCount: r.referencesCount,
      locale: r.locale,
      rateLimited: r.rateLimited,
      createdAt: r.createdAt,
    }))

    return {
      totalRequests,
      rateLimitedRequests,
      averageMessageLength,
      averageResponseLength,
      requestsByLocale,
      recentActivity,
    }
  },
})

export const getErrors = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ensureUser(ctx)
    await requireActiveMembership(ctx, args.workspaceId)
    const limit = Math.min(Math.max(args.limit ?? 50, 1), 500)
    const rows = await ctx.db
      .query("cmsLiteAiErrors")
      .withIndex("by_workspace_createdAt", (q) =>
        q.eq("workspaceId", args.workspaceId),
      )
      .order("desc")
      .take(limit)
    return {
      errors: rows.map((r) => ({
        id: r._id,
        errorType: r.errorType,
        errorMessage: r.errorMessage,
        userMessage: r.userMessage,
        locale: r.locale,
        context: r.context,
        createdAt: r.createdAt,
      })),
    }
  },
})
