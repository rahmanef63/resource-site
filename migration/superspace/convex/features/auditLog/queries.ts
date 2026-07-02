import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Queries for audit log feature
 */

export const getData = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    // Get audit logs
    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(100)

    // Calculate stats
    const criticalEvents = logs.filter(l => 
      l.action?.includes("delete") || 
      l.action?.includes("security")
    ).length

    const uniqueUsers = new Set(logs.map(l => l.userId)).size

    // Format recent events
    const recentEvents = logs.slice(0, 20).map(l => ({
      id: l._id,
      action: l.action || "Unknown action",
      actor: l.userEmail || "System",
      target: l.entityType || "Unknown",
      timestamp: new Date(l.timestamp || l._creationTime).toISOString(),
      status: "success" as "success" | "failure" | "warning",
      ipAddress: l.ipAddress || "N/A",
    }))

    return {
      stats: {
        totalEvents: logs.length,
        criticalEvents,
        activeUsers: uniqueUsers,
        systemHealth: criticalEvents === 0 ? "Healthy" : criticalEvents < 5 ? "Warning" : "Critical",
      },
      recentEvents,
    }
  },
})

export const getLogs = query({
  args: {
    workspaceId: v.id("workspaces"),
    action: v.optional(v.string()),
    entityType: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let logsQuery = ctx.db
      .query("auditLogs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")

    const logs = await logsQuery.take(args.limit || 100)

    // Apply filters
    let filtered = logs
    if (args.action) {
      filtered = filtered.filter((l) => l.action?.includes(args.action!))
    }
    if (args.entityType) {
      filtered = filtered.filter((l) => l.entityType === args.entityType)
    }
    if (args.userId) {
      filtered = filtered.filter((l) => l.userId === args.userId)
    }
    if (args.startDate) {
      filtered = filtered.filter((l) => (l.timestamp || l._creationTime) >= args.startDate!)
    }
    if (args.endDate) {
      filtered = filtered.filter((l) => (l.timestamp || l._creationTime) <= args.endDate!)
    }

    return filtered
  },
})

export const getStats = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    // Capped at 5000 to avoid full-table scans on large workspaces.
    // Stats are approximate for workspaces exceeding this threshold.
    const STATS_READ_LIMIT = 5000

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(STATS_READ_LIMIT)

    const now = Date.now()
    const todayStart = new Date().setHours(0, 0, 0, 0)
    const weekStart = now - 7 * 24 * 60 * 60 * 1000

    const today = logs.filter((l) => (l.timestamp || l._creationTime) >= todayStart)
    const thisWeek = logs.filter((l) => (l.timestamp || l._creationTime) >= weekStart)
    const uniqueUsers = new Set(logs.map((l) => l.userId)).size

    return {
      total: logs.length,
      today: today.length,
      thisWeek: thisWeek.length,
      uniqueUsers,
    }
  },
})
