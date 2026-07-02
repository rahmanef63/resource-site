import { v } from "convex/values"
import { mutation, type QueryCtx, type MutationCtx } from "../../_generated/server"
import { requirePermission, resolveCandidateUserIds } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"
import type { Id } from "../../_generated/dataModel"

/**
 * Comprehensive BI Mutations
 */

// Helper to get current user ID
async function getCurrentUserId(ctx: QueryCtx | MutationCtx): Promise<Id<"users">> {
  const candidateIds = await resolveCandidateUserIds(ctx)
  if (candidateIds.length === 0) throw new Error("Not authenticated")
  return candidateIds[0] as Id<"users">
}

// Generate unique token for public sharing (cryptographically secure)
function generatePublicToken(): string {
  return `pub_${crypto.randomUUID().replace(/-/g, "")}`
}

// ═══════════════════════════════════════════════════════════════════════════════
// Dashboard Mutations
// ═══════════════════════════════════════════════════════════════════════════════

export const createDashboard = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    // If setting as default, unset other defaults
    if (args.isDefault) {
      const existing = await ctx.db
        .query("biDashboards")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .take(1000)
      
      for (const dashboard of existing) {
        if (dashboard.isDefault) {
          await ctx.db.patch(dashboard._id, { isDefault: false })
        }
      }
    }

    const id = await ctx.db.insert("biDashboards", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      widgets: [],
      isDefault: args.isDefault ?? false,
      isPublic: false,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.dashboard.created",
      resourceType: "biDashboard",
      resourceId: String(id),
      metadata: { name: args.name },
    })

    return { id, success: true }
  },
})

export const updateDashboard = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    dashboardId: v.id("biDashboards"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    widgets: v.optional(v.array(v.object({
      id: v.string(),
      type: v.string(),
      title: v.string(),
      config: v.record(v.string(), v.any()),
    }))),
    layout: v.optional(v.array(v.object({
      widgetId: v.string(),
      x: v.number(),
      y: v.number(),
      w: v.number(),
      h: v.number(),
    }))),
    filters: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      type: v.string(),
      field: v.string(),
      defaultValue: v.optional(v.any()),
    }))),
    theme: v.optional(v.object({
      primaryColor: v.optional(v.string()),
      backgroundColor: v.optional(v.string()),
      textColor: v.optional(v.string()),
    })),
    refreshInterval: v.optional(v.number()),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const dashboard = await ctx.db.get(args.dashboardId)
    if (!dashboard || dashboard.workspaceId !== args.workspaceId) {
      throw new Error("Dashboard not found")
    }

    // If setting as default, unset other defaults
    if (args.isDefault) {
      const existing = await ctx.db
        .query("biDashboards")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .take(1000)

      for (const d of existing) {
        if (d.isDefault && d._id !== args.dashboardId) {
          await ctx.db.patch(d._id, { isDefault: false })
        }
      }
    }

    const updates: Record<string, any> = { updatedAt: Date.now() }
    const fields = [
      "name", "description", "widgets", "layout", "filters",
      "theme", "refreshInterval", "isDefault"
    ]

    for (const field of fields) {
      if ((args as any)[field] !== undefined) {
        updates[field] = (args as any)[field]
      }
    }

    await ctx.db.patch(args.dashboardId, updates)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.dashboard.updated",
      resourceType: "biDashboard",
      resourceId: String(args.dashboardId),
      metadata: { name: dashboard.name, changes: Object.keys(updates).filter((k) => k !== "updatedAt") },
    })

    return { success: true }
  },
})

export const deleteDashboard = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    dashboardId: v.id("biDashboards"),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const dashboard = await ctx.db.get(args.dashboardId)
    if (!dashboard || dashboard.workspaceId !== args.workspaceId) {
      throw new Error("Dashboard not found")
    }

    const deletedId = String(args.dashboardId)
    await ctx.db.delete(args.dashboardId)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.dashboard.deleted",
      resourceType: "biDashboard",
      resourceId: deletedId,
    })

    return { success: true }
  },
})

export const duplicateDashboard = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    dashboardId: v.id("biDashboards"),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const original = await ctx.db.get(args.dashboardId)
    if (!original || original.workspaceId !== args.workspaceId) {
      throw new Error("Dashboard not found")
    }

    const id = await ctx.db.insert("biDashboards", {
      workspaceId: args.workspaceId,
      name: args.name || `${original.name} (Copy)`,
      description: original.description,
      widgets: original.widgets.map(w => ({
        ...w,
        id: `${w.id}_${Date.now()}`,
      })),
      layout: original.layout,
      filters: original.filters,
      theme: original.theme,
      refreshInterval: original.refreshInterval,
      isDefault: false,
      isPublic: false,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.dashboard.duplicated",
      resourceType: "biDashboard",
      resourceId: String(id),
      metadata: { name: args.name || `${original.name} (Copy)`, sourceId: String(args.dashboardId) },
    })

    return { id, success: true }
  },
})

export const shareDashboard = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    dashboardId: v.id("biDashboards"),
    isPublic: v.boolean(),
    sharedWith: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const dashboard = await ctx.db.get(args.dashboardId)
    if (!dashboard || dashboard.workspaceId !== args.workspaceId) {
      throw new Error("Dashboard not found")
    }

    const updates: Record<string, any> = {
      isPublic: args.isPublic,
      updatedAt: Date.now(),
    }

    if (args.isPublic && !dashboard.publicToken) {
      updates.publicToken = generatePublicToken()
    }

    if (args.sharedWith !== undefined) {
      updates.sharedWith = args.sharedWith
    }

    await ctx.db.patch(args.dashboardId, updates)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.dashboard.shared",
      resourceType: "biDashboard",
      resourceId: String(args.dashboardId),
      metadata: { name: dashboard.name, isPublic: args.isPublic, sharedWithCount: args.sharedWith?.length ?? 0 },
    })

    return {
      success: true,
      publicToken: args.isPublic ? (dashboard.publicToken || updates.publicToken) : null
    }
  },
})

export const addWidgetToDashboard = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    dashboardId: v.id("biDashboards"),
    widget: v.object({
      type: v.string(),
      title: v.string(),
      config: v.record(v.string(), v.any()),
    }),
    position: v.optional(v.object({
      x: v.number(),
      y: v.number(),
      w: v.number(),
      h: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const dashboard = await ctx.db.get(args.dashboardId)
    if (!dashboard || dashboard.workspaceId !== args.workspaceId) {
      throw new Error("Dashboard not found")
    }

    const widgetId = `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newWidget = {
      id: widgetId,
      ...args.widget,
    }

    const widgets = [...dashboard.widgets, newWidget]

    const layout = dashboard.layout || []
    if (args.position) {
      layout.push({
        widgetId,
        ...args.position,
      })
    } else {
      // Auto-position at the bottom
      const maxY = layout.reduce((max, l) => Math.max(max, l.y + l.h), 0)
      layout.push({
        widgetId,
        x: 0,
        y: maxY,
        w: 6,
        h: 4,
      })
    }

    await ctx.db.patch(args.dashboardId, {
      widgets,
      layout,
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.dashboard.widget.added",
      resourceType: "biDashboard",
      resourceId: String(args.dashboardId),
      metadata: { dashboardName: dashboard.name, widgetId, widgetType: args.widget.type, widgetTitle: args.widget.title },
    })

    return { widgetId, success: true }
  },
})

export const removeWidgetFromDashboard = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    dashboardId: v.id("biDashboards"),
    widgetId: v.string(),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const dashboard = await ctx.db.get(args.dashboardId)
    if (!dashboard || dashboard.workspaceId !== args.workspaceId) {
      throw new Error("Dashboard not found")
    }

    const widgets = dashboard.widgets.filter(w => w.id !== args.widgetId)
    const layout = (dashboard.layout || []).filter(l => l.widgetId !== args.widgetId)

    await ctx.db.patch(args.dashboardId, {
      widgets,
      layout,
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.dashboard.widget.removed",
      resourceType: "biDashboard",
      resourceId: String(args.dashboardId),
      metadata: { dashboardName: dashboard.name, widgetId: args.widgetId },
    })

    return { success: true }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Widget Template Mutations
// ═══════════════════════════════════════════════════════════════════════════════

export const createWidget = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    dataSource: v.object({
      type: v.string(),
      table: v.optional(v.string()),
      query: v.optional(v.string()),
    }),
    queryConfig: v.optional(v.object({
      dimensions: v.optional(v.array(v.string())),
      measures: v.optional(v.array(v.object({
        field: v.string(),
        aggregation: v.string(),
        alias: v.optional(v.string()),
      }))),
      filters: v.optional(v.array(v.object({
        field: v.string(),
        operator: v.string(),
        value: v.any(),
      }))),
      limit: v.optional(v.number()),
    })),
    displayConfig: v.object({
      title: v.optional(v.string()),
      colors: v.optional(v.array(v.string())),
      format: v.optional(v.string()),
      showLegend: v.optional(v.boolean()),
    }),
    isTemplate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const id = await ctx.db.insert("biWidgets", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      type: args.type as any,
      dataSource: args.dataSource,
      queryConfig: args.queryConfig,
      displayConfig: args.displayConfig,
      isTemplate: args.isTemplate ?? false,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.widget.created",
      resourceType: "biWidget",
      resourceId: String(id),
      metadata: { name: args.name, type: args.type, isTemplate: args.isTemplate ?? false },
    })

    return { id, success: true }
  },
})

export const updateWidget = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    widgetId: v.id("biWidgets"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    queryConfig: v.optional(v.object({
      dimensions: v.optional(v.array(v.string())),
      measures: v.optional(v.array(v.object({
        field: v.string(),
        aggregation: v.string(),
        alias: v.optional(v.string()),
      }))),
      filters: v.optional(v.array(v.object({
        field: v.string(),
        operator: v.string(),
        value: v.any(),
      }))),
      limit: v.optional(v.number()),
    })),
    displayConfig: v.optional(v.object({
      title: v.optional(v.string()),
      colors: v.optional(v.array(v.string())),
      format: v.optional(v.string()),
      showLegend: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const widget = await ctx.db.get(args.widgetId)
    if (!widget || widget.workspaceId !== args.workspaceId) {
      throw new Error("Widget not found")
    }

    const updates: Record<string, any> = { updatedAt: Date.now() }
    const fields = ["name", "description", "queryConfig", "displayConfig"]

    for (const field of fields) {
      if ((args as any)[field] !== undefined) {
        updates[field] = (args as any)[field]
      }
    }

    await ctx.db.patch(args.widgetId, updates)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.widget.updated",
      resourceType: "biWidget",
      resourceId: String(args.widgetId),
      metadata: { name: widget.name, changes: Object.keys(updates).filter((k) => k !== "updatedAt") },
    })

    return { success: true }
  },
})

export const deleteWidget = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    widgetId: v.id("biWidgets"),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const widget = await ctx.db.get(args.widgetId)
    if (!widget || widget.workspaceId !== args.workspaceId) {
      throw new Error("Widget not found")
    }

    await ctx.db.delete(args.widgetId)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.widget.deleted",
      resourceType: "biWidget",
      resourceId: String(args.widgetId),
      metadata: { name: widget.name, type: widget.type },
    })

    return { success: true }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Metric Mutations
// ═══════════════════════════════════════════════════════════════════════════════

export const createMetric = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("count"),
      v.literal("sum"),
      v.literal("average"),
      v.literal("percentage"),
      v.literal("ratio"),
      v.literal("growth"),
      v.literal("custom")
    ),
    dataSource: v.string(),
    field: v.optional(v.string()),
    filters: v.optional(v.array(v.object({
      field: v.string(),
      operator: v.string(),
      value: v.any(),
    }))),
    format: v.optional(v.string()),
    unit: v.optional(v.string()),
    decimals: v.optional(v.number()),
    goal: v.optional(v.number()),
    thresholds: v.optional(v.object({
      warning: v.optional(v.number()),
      critical: v.optional(v.number()),
      direction: v.optional(v.string()),
    })),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const id = await ctx.db.insert("biMetrics", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      type: args.type,
      dataSource: args.dataSource,
      field: args.field,
      filters: args.filters,
      format: args.format,
      unit: args.unit,
      decimals: args.decimals,
      goal: args.goal,
      thresholds: args.thresholds,
      category: args.category,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.metric.created",
      resourceType: "biMetric",
      resourceId: String(id),
      metadata: { name: args.name, type: args.type, dataSource: args.dataSource },
    })

    return { id, success: true }
  },
})

export const updateMetric = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    metricId: v.id("biMetrics"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    filters: v.optional(v.array(v.object({
      field: v.string(),
      operator: v.string(),
      value: v.any(),
    }))),
    format: v.optional(v.string()),
    unit: v.optional(v.string()),
    goal: v.optional(v.number()),
    thresholds: v.optional(v.object({
      warning: v.optional(v.number()),
      critical: v.optional(v.number()),
      direction: v.optional(v.string()),
    })),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const metric = await ctx.db.get(args.metricId)
    if (!metric || metric.workspaceId !== args.workspaceId) {
      throw new Error("Metric not found")
    }

    const updates: Record<string, any> = { updatedAt: Date.now() }
    const fields = [
      "name", "description", "filters", "format",
      "unit", "goal", "thresholds", "category"
    ]

    for (const field of fields) {
      if ((args as any)[field] !== undefined) {
        updates[field] = (args as any)[field]
      }
    }

    await ctx.db.patch(args.metricId, updates)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.metric.updated",
      resourceType: "biMetric",
      resourceId: String(args.metricId),
      metadata: { name: metric.name, changes: Object.keys(updates).filter((k) => k !== "updatedAt") },
    })

    return { success: true }
  },
})

export const deleteMetric = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    metricId: v.id("biMetrics"),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const metric = await ctx.db.get(args.metricId)
    if (!metric || metric.workspaceId !== args.workspaceId) {
      throw new Error("Metric not found")
    }

    // Delete history
    const history = await ctx.db
      .query("biMetricHistory")
      .withIndex("by_metric", (q) => q.eq("metricId", args.metricId))
      .take(1000)

    for (const h of history) {
      await ctx.db.delete(h._id)
    }

    await ctx.db.delete(args.metricId)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.metric.deleted",
      resourceType: "biMetric",
      resourceId: String(args.metricId),
      metadata: { name: metric.name, type: metric.type, historyDeleted: history.length },
    })

    return { success: true }
  },
})

export const recordMetricValue = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    metricId: v.id("biMetrics"),
    value: v.number(),
    period: v.optional(v.string()),
    dimensions: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const metric = await ctx.db.get(args.metricId)
    if (!metric || metric.workspaceId !== args.workspaceId) {
      throw new Error("Metric not found")
    }

    // Record in history
    const historyId = await ctx.db.insert("biMetricHistory", {
      workspaceId: args.workspaceId,
      metricId: args.metricId,
      value: args.value,
      period: args.period || "daily",
      timestamp: Date.now(),
      dimensions: args.dimensions,
    })

    // Update current value
    const previousValue = metric.currentValue
    const changePercent = previousValue && previousValue !== 0
      ? ((args.value - previousValue) / previousValue) * 100
      : 0

    await ctx.db.patch(args.metricId, {
      currentValue: args.value,
      previousValue,
      changePercent,
      lastCalculated: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.metric.value.recorded",
      resourceType: "biMetric",
      resourceId: String(args.metricId),
      metadata: { name: metric.name, value: args.value, previousValue, changePercent, period: args.period || "daily" },
    })

    return { historyId, success: true }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Report Mutations
// ═══════════════════════════════════════════════════════════════════════════════

export const createReport = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("dashboard_snapshot"),
      v.literal("data_export"),
      v.literal("custom_query"),
      v.literal("template")
    ),
    dashboardId: v.optional(v.id("biDashboards")),
    format: v.union(
      v.literal("pdf"),
      v.literal("excel"),
      v.literal("csv"),
      v.literal("html")
    ),
    schedule: v.optional(v.object({
      enabled: v.boolean(),
      frequency: v.string(),
      dayOfWeek: v.optional(v.number()),
      dayOfMonth: v.optional(v.number()),
      time: v.string(),
      timezone: v.string(),
    })),
    recipients: v.optional(v.array(v.object({
      type: v.string(),
      value: v.string(),
    }))),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const id = await ctx.db.insert("biReports", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      type: args.type,
      dashboardId: args.dashboardId,
      format: args.format,
      schedule: args.schedule,
      recipients: args.recipients,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.report.created",
      resourceType: "biReport",
      resourceId: String(id),
      metadata: { name: args.name, type: args.type, format: args.format },
    })

    return { id, success: true }
  },
})

export const updateReport = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    reportId: v.id("biReports"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    schedule: v.optional(v.object({
      enabled: v.boolean(),
      frequency: v.string(),
      dayOfWeek: v.optional(v.number()),
      dayOfMonth: v.optional(v.number()),
      time: v.string(),
      timezone: v.string(),
    })),
    recipients: v.optional(v.array(v.object({
      type: v.string(),
      value: v.string(),
    }))),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const report = await ctx.db.get(args.reportId)
    if (!report || report.workspaceId !== args.workspaceId) {
      throw new Error("Report not found")
    }

    const updates: Record<string, any> = { updatedAt: Date.now() }
    const fields = ["name", "description", "schedule", "recipients"]

    for (const field of fields) {
      if ((args as any)[field] !== undefined) {
        updates[field] = (args as any)[field]
      }
    }

    await ctx.db.patch(args.reportId, updates)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.report.updated",
      resourceType: "biReport",
      resourceId: String(args.reportId),
      metadata: { name: report.name, changes: Object.keys(updates).filter((k) => k !== "updatedAt") },
    })

    return { success: true }
  },
})

export const deleteReport = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    reportId: v.id("biReports"),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const report = await ctx.db.get(args.reportId)
    if (!report || report.workspaceId !== args.workspaceId) {
      throw new Error("Report not found")
    }

    await ctx.db.delete(args.reportId)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.report.deleted",
      resourceType: "biReport",
      resourceId: String(args.reportId),
      metadata: { name: report.name, type: report.type },
    })

    return { success: true }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Data Source Mutations
// ═══════════════════════════════════════════════════════════════════════════════

export const createDataSource = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("convex"),
      v.literal("rest_api"),
      v.literal("google_sheets"),
      v.literal("postgres"),
      v.literal("mysql"),
      v.literal("csv_upload"),
      v.literal("webhook")
    ),
    connectionConfig: v.optional(v.object({
      url: v.optional(v.string()),
      apiKey: v.optional(v.string()),
      username: v.optional(v.string()),
      password: v.optional(v.string()),
      database: v.optional(v.string()),
      spreadsheetId: v.optional(v.string()),
    })),
    syncEnabled: v.optional(v.boolean()),
    syncFrequency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const id = await ctx.db.insert("biDataSources", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      type: args.type,
      connectionConfig: args.connectionConfig,
      syncEnabled: args.syncEnabled,
      syncFrequency: args.syncFrequency,
      isActive: true,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.dataSource.created",
      resourceType: "biDataSource",
      resourceId: String(id),
      metadata: { name: args.name, type: args.type, syncEnabled: args.syncEnabled ?? false },
    })

    return { id, success: true }
  },
})

export const updateDataSource = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    dataSourceId: v.id("biDataSources"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    connectionConfig: v.optional(v.object({
      url: v.optional(v.string()),
      apiKey: v.optional(v.string()),
      username: v.optional(v.string()),
      password: v.optional(v.string()),
      database: v.optional(v.string()),
      spreadsheetId: v.optional(v.string()),
    })),
    syncEnabled: v.optional(v.boolean()),
    syncFrequency: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const dataSource = await ctx.db.get(args.dataSourceId)
    if (!dataSource || dataSource.workspaceId !== args.workspaceId) {
      throw new Error("Data source not found")
    }

    const updates: Record<string, any> = { updatedAt: Date.now() }
    const fields = [
      "name", "description", "connectionConfig",
      "syncEnabled", "syncFrequency", "isActive"
    ]

    for (const field of fields) {
      if ((args as any)[field] !== undefined) {
        updates[field] = (args as any)[field]
      }
    }

    await ctx.db.patch(args.dataSourceId, updates)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.dataSource.updated",
      resourceType: "biDataSource",
      resourceId: String(args.dataSourceId),
      metadata: { name: dataSource.name, changes: Object.keys(updates).filter((k) => k !== "updatedAt") },
    })

    return { success: true }
  },
})

export const deleteDataSource = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    dataSourceId: v.id("biDataSources"),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const dataSource = await ctx.db.get(args.dataSourceId)
    if (!dataSource || dataSource.workspaceId !== args.workspaceId) {
      throw new Error("Data source not found")
    }

    await ctx.db.delete(args.dataSourceId)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.dataSource.deleted",
      resourceType: "biDataSource",
      resourceId: String(args.dataSourceId),
      metadata: { name: dataSource.name, type: dataSource.type },
    })

    return { success: true }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Alert Mutations
// ═══════════════════════════════════════════════════════════════════════════════

export const createAlert = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    metricId: v.optional(v.id("biMetrics")),
    condition: v.object({
      type: v.string(),
      operator: v.string(),
      value: v.number(),
      timeWindow: v.optional(v.number()),
    }),
    channels: v.array(v.object({
      type: v.string(),
      config: v.record(v.string(), v.any()),
    })),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const id = await ctx.db.insert("biAlerts", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      metricId: args.metricId,
      condition: args.condition,
      channels: args.channels,
      isActive: true,
      triggerCount: 0,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.alert.created",
      resourceType: "biAlert",
      resourceId: String(id),
      metadata: { name: args.name, metricId: args.metricId ? String(args.metricId) : null, channelCount: args.channels.length },
    })

    return { id, success: true }
  },
})

export const updateAlert = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    alertId: v.id("biAlerts"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    condition: v.optional(v.object({
      type: v.string(),
      operator: v.string(),
      value: v.number(),
      timeWindow: v.optional(v.number()),
    })),
    channels: v.optional(v.array(v.object({
      type: v.string(),
      config: v.record(v.string(), v.any()),
    }))),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const alert = await ctx.db.get(args.alertId)
    if (!alert || alert.workspaceId !== args.workspaceId) {
      throw new Error("Alert not found")
    }

    const updates: Record<string, any> = { updatedAt: Date.now() }
    const fields = ["name", "description", "condition", "channels", "isActive"]

    for (const field of fields) {
      if ((args as any)[field] !== undefined) {
        updates[field] = (args as any)[field]
      }
    }

    await ctx.db.patch(args.alertId, updates)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.alert.updated",
      resourceType: "biAlert",
      resourceId: String(args.alertId),
      metadata: { name: alert.name, changes: Object.keys(updates).filter((k) => k !== "updatedAt") },
    })

    return { success: true }
  },
})

export const snoozeAlert = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    alertId: v.id("biAlerts"),
    duration: v.number(), // hours
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const alert = await ctx.db.get(args.alertId)
    if (!alert || alert.workspaceId !== args.workspaceId) {
      throw new Error("Alert not found")
    }

    const snoozedUntil = Date.now() + (args.duration * 60 * 60 * 1000)

    await ctx.db.patch(args.alertId, {
      snoozedUntil,
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.alert.snoozed",
      resourceType: "biAlert",
      resourceId: String(args.alertId),
      metadata: { name: alert.name, durationHours: args.duration, snoozedUntil },
    })

    return { success: true, snoozedUntil }
  },
})

export const deleteAlert = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    alertId: v.id("biAlerts"),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const alert = await ctx.db.get(args.alertId)
    if (!alert || alert.workspaceId !== args.workspaceId) {
      throw new Error("Alert not found")
    }

    await ctx.db.delete(args.alertId)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.alert.deleted",
      resourceType: "biAlert",
      resourceId: String(args.alertId),
      metadata: { name: alert.name },
    })

    return { success: true }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Saved Query Mutations
// ═══════════════════════════════════════════════════════════════════════════════

export const createSavedQuery = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    query: v.object({
      tables: v.array(v.string()),
      fields: v.array(v.object({
        name: v.string(),
        alias: v.optional(v.string()),
        aggregation: v.optional(v.string()),
      })),
      filters: v.optional(v.array(v.object({
        field: v.string(),
        operator: v.string(),
        value: v.any(),
        parameterized: v.optional(v.boolean()),
      }))),
      groupBy: v.optional(v.array(v.string())),
      orderBy: v.optional(v.array(v.object({
        field: v.string(),
        direction: v.string(),
      }))),
      limit: v.optional(v.number()),
    }),
    parameters: v.optional(v.array(v.object({
      name: v.string(),
      type: v.string(),
      defaultValue: v.optional(v.any()),
      required: v.boolean(),
    }))),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const id = await ctx.db.insert("biSavedQueries", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      query: args.query,
      parameters: args.parameters,
      tags: args.tags,
      isPublic: args.isPublic ?? false,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.savedQuery.created",
      resourceType: "biSavedQuery",
      resourceId: String(id),
      metadata: { name: args.name, isPublic: args.isPublic ?? false, tableCount: args.query.tables.length },
    })

    return { id, success: true }
  },
})

export const deleteSavedQuery = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    queryId: v.id("biSavedQueries"),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const savedQuery = await ctx.db.get(args.queryId)
    if (!savedQuery || savedQuery.workspaceId !== args.workspaceId) {
      throw new Error("Saved query not found")
    }

    await ctx.db.delete(args.queryId)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "bi.savedQuery.deleted",
      resourceType: "biSavedQuery",
      resourceId: String(args.queryId),
      metadata: { name: savedQuery.name },
    })

    return { success: true }
  },
})
