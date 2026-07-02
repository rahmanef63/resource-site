import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Queries for analytics feature
 * Provides workspace analytics and insights
 */

// Get workspace overview stats
export const getOverview = query({
  args: {
    workspaceId: v.id("workspaces"),
    timeRange: v.optional(v.union(
      v.literal("today"),
      v.literal("7d"),
      v.literal("30d"),
      v.literal("90d")
    )),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const now = Date.now()
    const timeRange = args.timeRange || "30d"
    
    // Calculate time range
    const rangeMs = {
      today: 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      "90d": 90 * 24 * 60 * 60 * 1000,
    }[timeRange]
    
    const startTime = now - rangeMs

    // Get members count
    const members = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .take(1000)

    // Get tasks stats (if tasks table exists)
    let tasksStats = { total: 0, completed: 0, pending: 0 }
    try {
      const tasks = await ctx.db
        .query("tasks")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .take(1000)
      
      tasksStats = {
        total: tasks.length,
        completed: tasks.filter((t: any) => t.status === "completed" || t.status === "done").length,
        pending: tasks.filter((t: any) => t.status === "pending" || t.status === "in_progress" || t.status === "todo").length,
      }
    } catch {
      // Tasks table may not exist
    }

    // Get projects stats (if projects table exists)
    let projectsStats = { total: 0, active: 0 }
    try {
      const projects = await ctx.db
        .query("projects")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .take(1000)
      
      projectsStats = {
        total: projects.length,
        active: projects.filter((p: any) => p.status === "active" || p.status === "in_progress").length,
      }
    } catch {
      // Projects table may not exist
    }

    // Get documents count (if documents table exists)
    let documentsCount = 0
    try {
      const docs = await ctx.db
        .query("documents")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .take(1000)
      documentsCount = docs.length
    } catch {
      // Documents table may not exist
    }

    // Get recent activity from audit logs
    let recentActivity: any[] = []
    try {
      const auditLogs = await ctx.db
        .query("auditLogs")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .filter((q) => q.gte(q.field("timestamp"), startTime))
        .order("desc")
        .take(10)
      recentActivity = auditLogs
    } catch {
      // Audit logs table may not exist
    }

    return {
      members: {
        total: members.length,
        roles: members.reduce((acc: any, m: any) => {
          const role = m.role || "member"
          acc[role] = (acc[role] || 0) + 1
          return acc
        }, {}),
      },
      tasks: tasksStats,
      projects: projectsStats,
      documents: documentsCount,
      recentActivity,
      timeRange,
      generatedAt: now,
    }
  },
})

// Get activity timeline
export const getActivityTimeline = query({
  args: {
    workspaceId: v.id("workspaces"),
    timeRange: v.optional(v.union(
      v.literal("7d"),
      v.literal("30d"),
      v.literal("90d")
    )),
    groupBy: v.optional(v.union(
      v.literal("day"),
      v.literal("week"),
      v.literal("month")
    )),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const now = Date.now()
    const timeRange = args.timeRange || "30d"
    const groupBy = args.groupBy || "day"
    
    const rangeMs = {
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      "90d": 90 * 24 * 60 * 60 * 1000,
    }[timeRange]
    
    const startTime = now - rangeMs

    // Try to get audit logs for activity timeline
    let timeline: { date: string; count: number }[] = []
    try {
      const auditLogs = await ctx.db
        .query("auditLogs")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .filter((q) => q.gte(q.field("timestamp"), startTime))
        .take(1000)

      // Group by date
      const grouped = auditLogs.reduce((acc: any, log: any) => {
        const date = new Date(log.timestamp)
        let key: string
        
        if (groupBy === "day") {
          key = date.toISOString().split("T")[0]
        } else if (groupBy === "week") {
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().split("T")[0]
        } else {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        }
        
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})

      timeline = Object.entries(grouped)
        .map(([date, count]) => ({ date, count: count as number }))
        .sort((a, b) => a.date.localeCompare(b.date))
    } catch {
      // Audit logs may not exist
    }

    return {
      timeline,
      timeRange,
      groupBy,
    }
  },
})

// Get member activity stats
export const getMemberStats = query({
  args: {
    workspaceId: v.id("workspaces"),
    timeRange: v.optional(v.union(
      v.literal("7d"),
      v.literal("30d"),
      v.literal("90d")
    )),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const now = Date.now()
    const timeRange = args.timeRange || "30d"
    
    const rangeMs = {
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      "90d": 90 * 24 * 60 * 60 * 1000,
    }[timeRange]
    
    const startTime = now - rangeMs

    // Get members
    const members = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .take(1000)

    // Get activity per member from audit logs
    let memberActivity: { userId: string; activityCount: number }[] = []
    try {
      const auditLogs = await ctx.db
        .query("auditLogs")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .filter((q) => q.gte(q.field("timestamp"), startTime))
        .take(1000)

      const activityByUser = auditLogs.reduce((acc: any, log: any) => {
        const userId = log.userId || log.performedBy
        if (userId) {
          acc[userId] = (acc[userId] || 0) + 1
        }
        return acc
      }, {})

      memberActivity = Object.entries(activityByUser)
        .map(([userId, count]) => ({ userId, activityCount: count as number }))
        .sort((a, b) => b.activityCount - a.activityCount)
    } catch {
      // Audit logs may not exist
    }

    return {
      totalMembers: members.length,
      memberActivity,
      timeRange,
    }
  },
})

// Get recent tracked analytics events
export const getRecentEvents = query({
  args: {
    workspaceId: v.id("workspaces"),
    timeRange: v.optional(v.union(
      v.literal("today"),
      v.literal("7d"),
      v.literal("30d"),
      v.literal("90d")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const now = Date.now()
    const timeRange = args.timeRange || "30d"

    const rangeMs = {
      today: 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      "90d": 90 * 24 * 60 * 60 * 1000,
    }[timeRange]

    const startTime = now - rangeMs
    const limit = Math.min(Math.max(args.limit ?? 50, 1), 200)

    const events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_workspace_timestamp", (q) =>
        q.eq("workspaceId", args.workspaceId).gte("timestamp", startTime)
      )
      .order("desc")
      .take(limit)

    return events
  },
})

// Get saved widgets
export const getWidgets = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const widgets = await ctx.db
      .query("analyticsWidgets")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    return widgets
  },
})

// Get saved reports
export const getReports = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const reports = await ctx.db
      .query("analyticsReports")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    return reports
  },
})

// Analyze data from a specific source
export const analyze = query({
  args: {
    workspaceId: v.id("workspaces"),
    source: v.string(),
    metric: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    // Get overview stats as base analysis
    const overview = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_workspace_timestamp", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .take(1000)

    // Filter by source if specified
    const sourceEvents = args.source
      ? overview.filter((e: any) => e.eventType === args.source || e.eventName === args.source)
      : overview

    // Calculate basic metrics
    const totalEvents = sourceEvents.length
    const uniqueUsers = new Set(sourceEvents.map((e: any) => e.userId).filter(Boolean)).size

    // Group by metric if specified
    let metricData: Record<string, any> = {}
    if (args.metric) {
      metricData = sourceEvents.reduce((acc: any, event: any) => {
        const value = event.properties?.[args.metric!] || 0
        acc[args.metric!] = (acc[args.metric!] || 0) + (typeof value === 'number' ? value : 0)
        return acc
      }, {})
    }

    return {
      source: args.source,
      metric: args.metric,
      totalEvents,
      uniqueUsers,
      metricData,
      timeRange: "all",
      generatedAt: Date.now(),
    }
  },
})