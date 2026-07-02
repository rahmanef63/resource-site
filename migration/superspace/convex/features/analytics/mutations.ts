import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requirePermission, resolveCandidateUserIds } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import type { Id } from "../../_generated/dataModel"
import { logAuditEvent } from "../../shared/audit"

/**
 * Mutations for analytics feature
 */

// Track analytics event
// @dod:skip-audit reason="analytics event telemetry — analyticsEvents row IS the immutable audit trail; auditing every page-view/click would 10x the audit log"
export const trackEvent = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    eventType: v.string(),
    eventName: v.string(),
    properties: v.optional(v.record(v.string(), v.any())),
    metadata: v.optional(v.object({
      userAgent: v.optional(v.string()),
      referrer: v.optional(v.string()),
      path: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)

    const candidateIds = await resolveCandidateUserIds(ctx)
    const userId = candidateIds.length > 0 ? candidateIds[0] as Id<"users"> : undefined

    const id = await ctx.db.insert("analyticsEvents", {
      workspaceId: args.workspaceId,
      eventType: args.eventType,
      eventName: args.eventName,
      properties: args.properties,
      userId,
      timestamp: Date.now(),
      metadata: args.metadata,
    })

    return { id, success: true }
  },
})

// Create widget
export const createWidget = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    type: v.union(
      v.literal("metric"),
      v.literal("chart"),
      v.literal("table"),
      v.literal("trend")
    ),
    config: v.object({
      dataSource: v.string(),
      metric: v.string(),
      filters: v.optional(v.array(v.object({
        field: v.string(),
        operator: v.string(),
        value: v.any(),
      }))),
      groupBy: v.optional(v.string()),
      timeRange: v.optional(v.union(
        v.literal("today"),
        v.literal("7d"),
        v.literal("30d"),
        v.literal("90d"),
        v.literal("custom")
      )),
      chartType: v.optional(v.union(
        v.literal("line"),
        v.literal("bar"),
        v.literal("pie"),
        v.literal("area"),
        v.literal("donut")
      )),
    }),
    position: v.object({
      x: v.number(),
      y: v.number(),
      w: v.number(),
      h: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    const id = await ctx.db.insert("analyticsWidgets", {
      workspaceId: args.workspaceId,
      name: args.name,
      type: args.type,
      config: args.config,
      position: args.position,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "analytics.widget.created",
      resourceType: "analyticsWidget",
      resourceId: String(id),
      metadata: { name: args.name, type: args.type },
    })

    return { id, success: true }
  },
})

// Update widget
export const updateWidget = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    widgetId: v.id("analyticsWidgets"),
    name: v.optional(v.string()),
    config: v.optional(v.object({
      dataSource: v.string(),
      metric: v.string(),
      filters: v.optional(v.array(v.object({
        field: v.string(),
        operator: v.string(),
        value: v.any(),
      }))),
      groupBy: v.optional(v.string()),
      timeRange: v.optional(v.union(
        v.literal("today"),
        v.literal("7d"),
        v.literal("30d"),
        v.literal("90d"),
        v.literal("custom")
      )),
      chartType: v.optional(v.union(
        v.literal("line"),
        v.literal("bar"),
        v.literal("pie"),
        v.literal("area"),
        v.literal("donut")
      )),
    })),
    position: v.optional(v.object({
      x: v.number(),
      y: v.number(),
      w: v.number(),
      h: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)

    const widget = await ctx.db.get(args.widgetId)
    if (!widget || widget.workspaceId !== args.workspaceId) {
      throw new Error("Widget not found")
    }

    const updates: Record<string, any> = { updatedAt: Date.now() }
    if (args.name !== undefined) updates.name = args.name
    if (args.config !== undefined) updates.config = args.config
    if (args.position !== undefined) updates.position = args.position

    await ctx.db.patch(args.widgetId, updates)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "analytics.widget.updated",
      resourceType: "analyticsWidget",
      resourceId: String(args.widgetId),
      metadata: { fields: Object.keys(updates) },
    })

    return { success: true }
  },
})

// Delete widget
export const deleteWidget = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    widgetId: v.id("analyticsWidgets"),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)

    const widget = await ctx.db.get(args.widgetId)
    if (!widget || widget.workspaceId !== args.workspaceId) {
      throw new Error("Widget not found")
    }

    await ctx.db.delete(args.widgetId)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "analytics.widget.deleted",
      resourceType: "analyticsWidget",
      resourceId: String(args.widgetId),
      metadata: { name: widget.name },
    })

    return { success: true }
  },
})

// Create report
export const createReport = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("summary"),
      v.literal("detailed"),
      v.literal("comparison"),
      v.literal("trend")
    ),
    config: v.object({
      dataSources: v.array(v.string()),
      metrics: v.array(v.string()),
      dimensions: v.optional(v.array(v.string())),
      filters: v.optional(v.array(v.object({
        field: v.string(),
        operator: v.string(),
        value: v.any(),
      }))),
      timeRange: v.object({
        type: v.string(),
        start: v.optional(v.number()),
        end: v.optional(v.number()),
      }),
    }),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    const id = await ctx.db.insert("analyticsReports", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      type: args.type,
      config: args.config,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "analytics.report.created",
      resourceType: "analyticsReport",
      resourceId: String(id),
      metadata: { name: args.name, type: args.type },
    })

    return { id, success: true }
  },
})

// Delete report
export const deleteReport = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    reportId: v.id("analyticsReports"),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)

    const report = await ctx.db.get(args.reportId)
    if (!report || report.workspaceId !== args.workspaceId) {
      throw new Error("Report not found")
    }

    await ctx.db.delete(args.reportId)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "analytics.report.delete",
      resourceType: "analyticsReport",
      resourceId: args.reportId,
    })

    return { success: true }
  },
})

// Generate and save a report
export const generateReport = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    rangeStart: v.number(),
    rangeEnd: v.number(),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_MANAGE)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    // Get events in the time range
    const events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_workspace_timestamp", (q) =>
        q.eq("workspaceId", args.workspaceId)
         .gte("timestamp", args.rangeStart)
         .lte("timestamp", args.rangeEnd)
      )
      // Convex hard-caps a single query at 16384 docs read; 100000 would throw
      // on large workspaces. ponytail: bounded read — report aggregation over
      // bigger ranges should move to incremental rollups (tracked separately).
      .take(16384)

    // Calculate summary statistics
    const totalEvents = events.length
    const uniqueUsers = new Set(events.map((e: any) => e.userId).filter(Boolean)).size
    const eventTypes = events.reduce((acc: any, e: any) => {
      acc[e.eventType] = (acc[e.eventType] || 0) + 1
      return acc
    }, {})

    // Create report document
    const reportId = await ctx.db.insert("analyticsReports", {
      workspaceId: args.workspaceId,
      name: args.title,
      description: `Generated report for period ${new Date(args.rangeStart).toISOString()} to ${new Date(args.rangeEnd).toISOString()}`,
      type: "summary",
      config: {
        dataSources: ["analyticsEvents"],
        metrics: ["totalEvents", "uniqueUsers"],
        timeRange: {
          type: "custom",
          start: args.rangeStart,
          end: args.rangeEnd,
        },
      },
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "analytics.report.generate",
      resourceType: "analyticsReport",
      resourceId: reportId,
    })

    return {
      id: reportId,
      success: true,
      summary: {
        totalEvents,
        uniqueUsers,
        eventTypes,
        timeRange: {
          start: args.rangeStart,
          end: args.rangeEnd,
        },
      },
    }
  },
})