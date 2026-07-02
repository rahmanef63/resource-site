import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { ensureUser, requireActiveMembership, requirePermission } from "../../auth/helpers"
import { logAuditEvent } from "../../shared/audit"

export const createReport = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    branchId: v.optional(v.string()),
    category: v.string(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    title: v.string(),
    description: v.string(),
    photos: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    relatedEntityType: v.optional(v.string()),
    relatedEntityId: v.optional(v.string()),
    costEstimate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "damages.report")
    const userId = await ensureUser(ctx)
    const now = Date.now()
    const id = await ctx.db.insert("damageReports", {
      workspaceId: args.workspaceId,
      branchId: args.branchId,
      category: args.category,
      severity: args.severity,
      title: args.title,
      description: args.description,
      photos: args.photos,
      location: args.location,
      relatedEntityType: args.relatedEntityType,
      relatedEntityId: args.relatedEntityId,
      reporterId: userId,
      status: "reported",
      costEstimate: args.costEstimate,
      createdAt: now,
      updatedAt: now,
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "damageReports.created",
      resourceType: "damageReports",
      resourceId: id,
      metadata: { severity: args.severity, category: args.category },
    })
    return { id, success: true }
  },
})

export const triageReport = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    reportId: v.id("damageReports"),
    assignedTo: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "damages.triage")
    const userId = await ensureUser(ctx)
    const row = await ctx.db.get(args.reportId)
    if (!row || row.workspaceId !== args.workspaceId) throw new Error("Report not found")

    await ctx.db.patch(args.reportId, {
      status: "triaged",
      assignedTo: args.assignedTo,
      updatedAt: Date.now(),
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "damageReports.triaged",
      resourceType: "damageReports",
      resourceId: args.reportId,
    })
    return { success: true }
  },
})

export const updateReport = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    reportId: v.id("damageReports"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    severity: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    ),
    photos: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    costEstimate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "damages.triage")
    const userId = await ensureUser(ctx)
    const row = await ctx.db.get(args.reportId)
    if (!row || row.workspaceId !== args.workspaceId) throw new Error("Report not found")
    if (row.status === "resolved" || row.status === "written-off") {
      throw new Error(`Cannot update report in terminal state: ${row.status}`)
    }
    const patch: Record<string, unknown> = { updatedAt: Date.now() }
    if (args.title !== undefined) patch.title = args.title
    if (args.description !== undefined) patch.description = args.description
    if (args.category !== undefined) patch.category = args.category
    if (args.severity !== undefined) patch.severity = args.severity
    if (args.photos !== undefined) patch.photos = args.photos
    if (args.location !== undefined) patch.location = args.location
    if (args.costEstimate !== undefined) patch.costEstimate = args.costEstimate
    if (args.notes !== undefined) patch.notes = args.notes
    await ctx.db.patch(args.reportId, patch as any)
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "damageReports.updated",
      resourceType: "damageReports",
      resourceId: args.reportId,
      changes: patch,
    })
    return { success: true }
  },
})

export const deleteReport = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    reportId: v.id("damageReports"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "damages.resolve")
    const userId = await ensureUser(ctx)
    const row = await ctx.db.get(args.reportId)
    if (!row || row.workspaceId !== args.workspaceId) throw new Error("Report not found")
    await ctx.db.delete(args.reportId)
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "damageReports.deleted",
      resourceType: "damageReports",
      resourceId: args.reportId,
      metadata: { title: row.title, severity: row.severity, category: row.category },
    })
    return { success: true }
  },
})

export const resolveReport = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    reportId: v.id("damageReports"),
    resolution: v.union(
      v.literal("repaired"),
      v.literal("replaced"),
      v.literal("written-off"),
      v.literal("ignored"),
    ),
    actualCost: v.optional(v.number()),
    insuranceClaimRef: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "damages.resolve")
    const userId = await ensureUser(ctx)
    const row = await ctx.db.get(args.reportId)
    if (!row || row.workspaceId !== args.workspaceId) throw new Error("Report not found")

    await ctx.db.patch(args.reportId, {
      status: args.resolution === "written-off" ? "written-off" : "resolved",
      resolution: args.resolution,
      actualCost: args.actualCost,
      insuranceClaimRef: args.insuranceClaimRef,
      notes: args.notes ?? row.notes,
      resolvedBy: userId,
      resolvedAt: Date.now(),
      updatedAt: Date.now(),
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "damageReports.resolved",
      resourceType: "damageReports",
      resourceId: args.reportId,
      metadata: { resolution: args.resolution, actualCost: args.actualCost },
    })
    return { success: true }
  },
})
