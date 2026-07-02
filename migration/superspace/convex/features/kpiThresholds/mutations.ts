import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { ensureUser, requireActiveMembership, requirePermission } from "../../auth/helpers"
import { logAuditEvent } from "../../shared/audit"

export const defineThreshold = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    branchId: v.optional(v.string()),
    kpiKey: v.string(),
    metric: v.string(),
    direction: v.union(
      v.literal("above"),
      v.literal("below"),
      v.literal("outside-range"),
      v.literal("inside-range"),
    ),
    value1: v.number(),
    value2: v.optional(v.number()),
    severity: v.union(v.literal("info"), v.literal("warning"), v.literal("critical")),
    actionPolicy: v.array(
      v.union(v.literal("notify"), v.literal("email"), v.literal("trigger-workflow")),
    ),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "kpi.define_threshold")
    const userId = await ensureUser(ctx)
    const now = Date.now()
    const id = await ctx.db.insert("kpiThresholds", {
      workspaceId: args.workspaceId,
      branchId: args.branchId,
      kpiKey: args.kpiKey,
      metric: args.metric,
      direction: args.direction,
      value1: args.value1,
      value2: args.value2,
      severity: args.severity,
      actionPolicy: args.actionPolicy,
      isActive: true,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "kpiThresholds.defined",
      resourceType: "kpiThresholds",
      resourceId: id,
    })
    return { id, success: true }
  },
})

export const triggerAlert = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    thresholdId: v.id("kpiThresholds"),
    branchId: v.optional(v.string()),
    actualValue: v.number(),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "kpi.trigger_alert")
    const threshold = await ctx.db.get(args.thresholdId)
    if (!threshold || threshold.workspaceId !== args.workspaceId)
      throw new Error("Threshold not found")

    const id = await ctx.db.insert("kpiAlerts", {
      workspaceId: args.workspaceId,
      thresholdId: args.thresholdId,
      branchId: args.branchId,
      triggeredAt: Date.now(),
      actualValue: args.actualValue,
      severity: threshold.severity,
      resolved: false,
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      action: "kpiThresholds.alert_triggered",
      resourceType: "kpiAlerts",
      resourceId: id,
      metadata: { kpi: threshold.kpiKey, value: args.actualValue },
    })
    return { id, success: true }
  },
})

export const acknowledgeAlert = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    alertId: v.id("kpiAlerts"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "kpi.acknowledge_alert")
    const userId = await ensureUser(ctx)
    const alert = await ctx.db.get(args.alertId)
    if (!alert || alert.workspaceId !== args.workspaceId) throw new Error("Alert not found")

    await ctx.db.patch(args.alertId, {
      resolved: true,
      resolvedBy: userId,
      resolvedAt: Date.now(),
      resolutionNote: args.note,
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "kpiThresholds.alert_resolved",
      resourceType: "kpiAlerts",
      resourceId: args.alertId,
    })
    return { success: true }
  },
})

export const updateThreshold = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    thresholdId: v.id("kpiThresholds"),
    newValue: v.optional(v.number()),
    newValue2: v.optional(v.number()),
    newSeverity: v.optional(
      v.union(v.literal("info"), v.literal("warning"), v.literal("critical")),
    ),
    direction: v.optional(
      v.union(
        v.literal("above"),
        v.literal("below"),
        v.literal("outside-range"),
        v.literal("inside-range"),
      ),
    ),
    actionPolicy: v.optional(
      v.array(
        v.union(v.literal("notify"), v.literal("email"), v.literal("trigger-workflow")),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "kpi.define_threshold")
    const userId = await ensureUser(ctx)
    const t = await ctx.db.get(args.thresholdId)
    if (!t || t.workspaceId !== args.workspaceId) throw new Error("Threshold not found")
    const patch: Record<string, unknown> = { updatedAt: Date.now() }
    if (args.newValue !== undefined) patch.value1 = args.newValue
    if (args.newValue2 !== undefined) patch.value2 = args.newValue2
    if (args.newSeverity !== undefined) patch.severity = args.newSeverity
    if (args.direction !== undefined) patch.direction = args.direction
    if (args.actionPolicy !== undefined) patch.actionPolicy = args.actionPolicy
    await ctx.db.patch(args.thresholdId, patch as any)
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "kpiThresholds.updated",
      resourceType: "kpiThresholds",
      resourceId: args.thresholdId,
      changes: patch,
    })
    return { success: true }
  },
})

export const deleteThreshold = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    thresholdId: v.id("kpiThresholds"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "kpi.define_threshold")
    const userId = await ensureUser(ctx)
    const t = await ctx.db.get(args.thresholdId)
    if (!t || t.workspaceId !== args.workspaceId) throw new Error("Threshold not found")

    const openAlerts = await ctx.db
      .query("kpiAlerts")
      .withIndex("by_threshold", (q) => q.eq("thresholdId", args.thresholdId))
      .filter((q) => q.eq(q.field("resolved"), false))
      .take(1)
    if (openAlerts.length > 0) {
      throw new Error("Cannot delete threshold: open alerts still reference it.")
    }

    await ctx.db.delete(args.thresholdId)
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "kpiThresholds.deleted",
      resourceType: "kpiThresholds",
      resourceId: args.thresholdId,
      metadata: { kpiKey: t.kpiKey, metric: t.metric },
    })
    return { success: true }
  },
})

export const deleteAlert = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    alertId: v.id("kpiAlerts"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "kpi.acknowledge_alert")
    const userId = await ensureUser(ctx)
    const alert = await ctx.db.get(args.alertId)
    if (!alert || alert.workspaceId !== args.workspaceId) throw new Error("Alert not found")
    await ctx.db.delete(args.alertId)
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "kpiThresholds.alert_deleted",
      resourceType: "kpiAlerts",
      resourceId: args.alertId,
      metadata: { thresholdId: alert.thresholdId, severity: alert.severity },
    })
    return { success: true }
  },
})

export const toggleThreshold = mutation({
  args: { workspaceId: v.id("workspaces"), thresholdId: v.id("kpiThresholds"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "kpi.toggle_threshold")
    const userId = await ensureUser(ctx)
    const t = await ctx.db.get(args.thresholdId)
    if (!t || t.workspaceId !== args.workspaceId) throw new Error("Threshold not found")
    await ctx.db.patch(args.thresholdId, { isActive: args.isActive, updatedAt: Date.now() })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: args.isActive ? "kpiThresholds.activated" : "kpiThresholds.deactivated",
      resourceType: "kpiThresholds",
      resourceId: args.thresholdId,
    })
    return { success: true }
  },
})
