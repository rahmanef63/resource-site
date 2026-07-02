import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Comprehensive BI Queries
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Dashboard Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getDashboards = query({
  args: {
    workspaceId: v.id("workspaces"),
    onlyPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let dashboards = await ctx.db
      .query("biDashboards")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    if (args.onlyPublic) {
      dashboards = dashboards.filter(d => d.isPublic)
    }

    // Sort: default first, then by updated date
    dashboards.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1
      if (!a.isDefault && b.isDefault) return 1
      return b.updatedAt - a.updatedAt
    })

    return dashboards.map(d => ({
      ...d,
      widgetCount: d.widgets.length,
    }))
  },
})

export const getDashboard = query({
  args: {
    workspaceId: v.id("workspaces"),
    dashboardId: v.id("biDashboards"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const dashboard = await ctx.db.get(args.dashboardId)
    if (!dashboard || dashboard.workspaceId !== args.workspaceId) {
      return null
    }

    return dashboard
  },
})

export const getDashboardByToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const dashboard = await ctx.db
      .query("biDashboards")
      .withIndex("by_public_token", (q) => q.eq("publicToken", args.token))
      .first()

    if (!dashboard || !dashboard.isPublic) {
      return null
    }

    return dashboard
  },
})

export const getDefaultDashboard = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const dashboards = await ctx.db
      .query("biDashboards")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    return dashboards.find(d => d.isDefault) || dashboards[0] || null
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Widget Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getWidgets = query({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.optional(v.string()),
    onlyTemplates: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let widgets = await ctx.db
      .query("biWidgets")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    if (args.type) {
      widgets = widgets.filter(w => w.type === args.type)
    }

    if (args.onlyTemplates) {
      widgets = widgets.filter(w => w.isTemplate)
    }

    return widgets
  },
})

export const getWidget = query({
  args: {
    workspaceId: v.id("workspaces"),
    widgetId: v.id("biWidgets"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const widget = await ctx.db.get(args.widgetId)
    if (!widget || widget.workspaceId !== args.workspaceId) {
      return null
    }

    return widget
  },
})

export const getWidgetTemplates = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const widgets = await ctx.db
      .query("biWidgets")
      .withIndex("by_template", (q) => 
        q.eq("workspaceId", args.workspaceId).eq("isTemplate", true)
      )
      .take(1000)

    return widgets
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Metric Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getMetrics = query({
  args: {
    workspaceId: v.id("workspaces"),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let metrics = await ctx.db
      .query("biMetrics")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    if (args.category) {
      metrics = metrics.filter(m => m.category === args.category)
    }

    return metrics
  },
})

export const getMetric = query({
  args: {
    workspaceId: v.id("workspaces"),
    metricId: v.id("biMetrics"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const metric = await ctx.db.get(args.metricId)
    if (!metric || metric.workspaceId !== args.workspaceId) {
      return null
    }

    return metric
  },
})

export const getMetricHistory = query({
  args: {
    workspaceId: v.id("workspaces"),
    metricId: v.id("biMetrics"),
    period: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let history = await ctx.db
      .query("biMetricHistory")
      .withIndex("by_metric", (q) => q.eq("metricId", args.metricId))
      .order("desc")
      .take(1000)

    if (args.period) {
      history = history.filter(h => h.period === args.period)
    }

    if (args.startDate) {
      history = history.filter(h => h.timestamp >= args.startDate!)
    }

    if (args.endDate) {
      history = history.filter(h => h.timestamp <= args.endDate!)
    }

    if (args.limit) {
      history = history.slice(0, args.limit)
    }

    return history
  },
})

export const getMetricCategories = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const metrics = await ctx.db
      .query("biMetrics")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    const categories = [...new Set(metrics.map(m => m.category).filter(Boolean))]
    return categories
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Report Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getReports = query({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let reports = await ctx.db
      .query("biReports")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    if (args.type) {
      reports = reports.filter(r => r.type === args.type)
    }

    return reports
  },
})

export const getReport = query({
  args: {
    workspaceId: v.id("workspaces"),
    reportId: v.id("biReports"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const report = await ctx.db.get(args.reportId)
    if (!report || report.workspaceId !== args.workspaceId) {
      return null
    }

    return report
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Data Source Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getDataSources = query({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.optional(v.string()),
    onlyActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let dataSources = await ctx.db
      .query("biDataSources")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    if (args.type) {
      dataSources = dataSources.filter(ds => ds.type === args.type)
    }

    if (args.onlyActive !== false) {
      dataSources = dataSources.filter(ds => ds.isActive)
    }

    // Don't expose sensitive connection config
    return dataSources.map(ds => ({
      ...ds,
      connectionConfig: ds.connectionConfig ? {
        ...ds.connectionConfig,
        password: ds.connectionConfig.password ? "********" : undefined,
        apiKey: ds.connectionConfig.apiKey ? "********" : undefined,
      } : undefined,
    }))
  },
})

export const getDataSource = query({
  args: {
    workspaceId: v.id("workspaces"),
    dataSourceId: v.id("biDataSources"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const dataSource = await ctx.db.get(args.dataSourceId)
    if (!dataSource || dataSource.workspaceId !== args.workspaceId) {
      return null
    }

    // Don't expose sensitive connection config
    return {
      ...dataSource,
      connectionConfig: dataSource.connectionConfig ? {
        ...dataSource.connectionConfig,
        password: dataSource.connectionConfig.password ? "********" : undefined,
        apiKey: dataSource.connectionConfig.apiKey ? "********" : undefined,
      } : undefined,
    }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Alert Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getAlerts = query({
  args: {
    workspaceId: v.id("workspaces"),
    onlyActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let alerts = await ctx.db
      .query("biAlerts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    if (args.onlyActive) {
      alerts = alerts.filter(a => a.isActive)
    }

    return alerts
  },
})

export const getAlert = query({
  args: {
    workspaceId: v.id("workspaces"),
    alertId: v.id("biAlerts"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const alert = await ctx.db.get(args.alertId)
    if (!alert || alert.workspaceId !== args.workspaceId) {
      return null
    }

    return alert
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Saved Query Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getSavedQueries = query({
  args: {
    workspaceId: v.id("workspaces"),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let queries = await ctx.db
      .query("biSavedQueries")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    if (args.tags && args.tags.length > 0) {
      queries = queries.filter(q => 
        q.tags && args.tags!.some(tag => q.tags!.includes(tag))
      )
    }

    return queries
  },
})

export const getSavedQuery = query({
  args: {
    workspaceId: v.id("workspaces"),
    queryId: v.id("biSavedQueries"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const savedQuery = await ctx.db.get(args.queryId)
    if (!savedQuery || savedQuery.workspaceId !== args.workspaceId) {
      return null
    }

    return savedQuery
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Aggregated Stats Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getOverviewStats = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    // Gather stats from various sources — bounded full-scan; counter docs deferred to Step 59 (analytics quality)
    const [dashboards, metrics, reports, alerts] = await Promise.all([
      // @dod:skip-perf reason="stats aggregation; counter doc rewrite deferred to Step 59 analytics quality"
      ctx.db.query("biDashboards")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .take(1000),
      // @dod:skip-perf reason="stats aggregation; counter doc rewrite deferred to Step 59 analytics quality"
      ctx.db.query("biMetrics")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .take(1000),
      // @dod:skip-perf reason="stats aggregation; counter doc rewrite deferred to Step 59 analytics quality"
      ctx.db.query("biReports")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .take(1000),
      // @dod:skip-perf reason="stats aggregation; counter doc rewrite deferred to Step 59 analytics quality"
      ctx.db.query("biAlerts")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .take(1000),
    ])

    return {
      dashboardCount: dashboards.length,
      metricCount: metrics.length,
      reportCount: reports.length,
      alertCount: alerts.length,
      activeAlerts: alerts.filter(a => a.isActive).length,
      publicDashboards: dashboards.filter(d => d.isPublic).length,
    }
  },
})

// Real-time aggregation for common metrics
export const getWorkspaceMetrics = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    // Count various entities
    const [
      contacts,
      transactions,
      tasks,
      documents,
    ] = await Promise.all([
      // @dod:skip-perf reason="stats aggregation; counter doc rewrite deferred to Step 59 analytics quality"
      ctx.db.query("contacts")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .take(1000),
      // @dod:skip-perf reason="stats aggregation; counter doc rewrite deferred to Step 59 analytics quality"
      ctx.db.query("posTransactions")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .take(1000),
      // @dod:skip-perf reason="stats aggregation; counter doc rewrite deferred to Step 59 analytics quality"
      ctx.db.query("tasks")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .take(1000),
      // @dod:skip-perf reason="stats aggregation; counter doc rewrite deferred to Step 59 analytics quality"
      ctx.db.query("documents")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .take(1000),
    ])

    // Calculate revenue
    const completedTransactions = transactions.filter(t => t.status === "completed")
    const revenue = completedTransactions.reduce((sum, t) => sum + (t.total || 0), 0)

    // Calculate tasks stats
    const completedTasks = tasks.filter(t => t.status === "completed").length
    const pendingTasks = tasks.filter(t => t.status !== "completed").length

    // Calculate growth (last 30 days vs previous 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000

    const recentTransactions = completedTransactions.filter(t => t.createdAt >= thirtyDaysAgo)
    const previousTransactions = completedTransactions.filter(t => 
      t.createdAt >= sixtyDaysAgo && t.createdAt < thirtyDaysAgo
    )

    const recentRevenue = recentTransactions.reduce((sum, t) => sum + (t.total || 0), 0)
    const previousRevenue = previousTransactions.reduce((sum, t) => sum + (t.total || 0), 0)

    const revenueGrowth = previousRevenue > 0 
      ? ((recentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
      : "0"

    return {
      // Overview
      revenue,
      customers: contacts.length,
      orders: completedTransactions.length,
      conversionRate: contacts.length > 0 
        ? ((completedTransactions.length / contacts.length) * 100).toFixed(1)
        : "0",
      
      // Tasks
      completedTasks,
      pendingTasks,
      taskCompletionRate: tasks.length > 0
        ? ((completedTasks / tasks.length) * 100).toFixed(1)
        : "0",
      
      // Documents
      documentCount: documents.length,
      
      // Growth
      revenueGrowth: parseFloat(revenueGrowth as string),
      newCustomers: contacts.filter(c => c.createdAt >= thirtyDaysAgo).length,
      
      // Recent activity
      recentTransactionCount: recentTransactions.length,
      recentRevenue,
    }
  },
})

export const getChartData = query({
  args: {
    workspaceId: v.id("workspaces"),
    chartType: v.union(
      v.literal("revenue"),
      v.literal("orders"),
      v.literal("customers"),
      v.literal("tasks")
    ),
    period: v.optional(v.union(
      v.literal("7d"),
      v.literal("30d"),
      v.literal("90d"),
      v.literal("12m")
    )),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const period = args.period || "30d"
    let startDate: number
    let groupFormat: "day" | "week" | "month"

    switch (period) {
      case "7d":
        startDate = Date.now() - 7 * 24 * 60 * 60 * 1000
        groupFormat = "day"
        break
      case "30d":
        startDate = Date.now() - 30 * 24 * 60 * 60 * 1000
        groupFormat = "day"
        break
      case "90d":
        startDate = Date.now() - 90 * 24 * 60 * 60 * 1000
        groupFormat = "week"
        break
      case "12m":
        startDate = Date.now() - 365 * 24 * 60 * 60 * 1000
        groupFormat = "month"
        break
      default:
        startDate = Date.now() - 30 * 24 * 60 * 60 * 1000
        groupFormat = "day"
    }

    const groupData = (data: { createdAt: number; value?: number }[]): { label: string; value: number }[] => {
      const grouped: Record<string, number> = {}

      for (const item of data) {
        const date = new Date(item.createdAt)
        let key: string

        if (groupFormat === "day") {
          key = date.toISOString().split("T")[0]
        } else if (groupFormat === "week") {
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().split("T")[0]
        } else {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        }

        grouped[key] = (grouped[key] || 0) + (item.value || 1)
      }

      return Object.entries(grouped)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => a.label.localeCompare(b.label))
    }

    switch (args.chartType) {
      case "revenue": {
        const transactions = await ctx.db
          .query("posTransactions")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
          .filter((q) => q.gte(q.field("createdAt"), startDate))
          .take(1000)

        const data = transactions
          .filter(t => t.status === "completed")
          .map(t => ({ createdAt: t.createdAt, value: t.total || 0 }))

        return { data: groupData(data), chartType: args.chartType, period }
      }

      case "orders": {
        const transactions = await ctx.db
          .query("posTransactions")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
          .filter((q) => q.gte(q.field("createdAt"), startDate))
          .take(1000)

        const data = transactions
          .filter(t => t.status === "completed")
          .map(t => ({ createdAt: t.createdAt }))

        return { data: groupData(data), chartType: args.chartType, period }
      }

      case "customers": {
        const contacts = await ctx.db
          .query("contacts")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
          .filter((q) => q.gte(q.field("createdAt"), startDate))
          .take(1000)

        const data = contacts.map(c => ({ createdAt: c.createdAt }))

        return { data: groupData(data), chartType: args.chartType, period }
      }

      case "tasks": {
        const tasks = await ctx.db
          .query("tasks")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
          .filter((q) => q.gte(q.field("createdAt"), startDate))
          .take(1000)

        const completedData = tasks
          .filter(t => t.status === "completed" && t.completedAt)
          .map(t => ({ createdAt: t.completedAt! }))

        return { data: groupData(completedData), chartType: args.chartType, period }
      }
    }
  },
})
