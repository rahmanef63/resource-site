import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { ensureUser, requireActiveMembership, requirePermission } from "../../auth/helpers"
import { logAuditEvent } from "../../shared/audit"

export const createTemplate = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    branchId: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    scope: v.union(
      v.literal("opening"),
      v.literal("closing"),
      v.literal("shift-change"),
      v.literal("audit"),
      v.literal("custom"),
    ),
    items: v.array(
      v.object({
        id: v.string(),
        label: v.string(),
        order: v.number(),
        required: v.boolean(),
        photoRequired: v.optional(v.boolean()),
        notesRequired: v.optional(v.boolean()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "checklist.create_template")
    const userId = await ensureUser(ctx)
    const now = Date.now()
    const id = await ctx.db.insert("checklistTemplates", {
      workspaceId: args.workspaceId,
      branchId: args.branchId,
      name: args.name,
      description: args.description,
      scope: args.scope,
      items: args.items,
      isActive: true,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "checklist.template.created",
      resourceType: "checklistTemplates",
      resourceId: id,
    })
    return { id, success: true }
  },
})

export const startRun = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    templateId: v.id("checklistTemplates"),
    runDate: v.string(),
    branchId: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "checklist.start_run")
    const userId = await ensureUser(ctx)
    const template = await ctx.db.get(args.templateId)
    if (!template || template.workspaceId !== args.workspaceId)
      throw new Error("Template not found")

    const now = Date.now()
    const id = await ctx.db.insert("checklistRuns", {
      workspaceId: args.workspaceId,
      templateId: args.templateId,
      branchId: args.branchId,
      runDate: args.runDate,
      assignedTo: args.assignedTo ?? userId,
      completedItems: [],
      overallStatus: "pending",
      createdAt: now,
      updatedAt: now,
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "checklist.run.started",
      resourceType: "checklistRuns",
      resourceId: id,
    })
    return { id, success: true }
  },
})

export const checkItem = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    runId: v.id("checklistRuns"),
    itemId: v.string(),
    completed: v.boolean(),
    photoUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "checklist.check_item")
    const userId = await ensureUser(ctx)
    const run = await ctx.db.get(args.runId)
    if (!run || run.workspaceId !== args.workspaceId) throw new Error("Run not found")

    const items = run.completedItems.filter((i) => i.itemId !== args.itemId)
    items.push({
      itemId: args.itemId,
      completed: args.completed,
      completedAt: args.completed ? Date.now() : undefined,
      photoUrl: args.photoUrl,
      notes: args.notes,
    })
    await ctx.db.patch(args.runId, {
      completedItems: items,
      overallStatus: "in_progress",
      updatedAt: Date.now(),
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "checklist.run.item_checked",
      resourceType: "checklistRuns",
      resourceId: args.runId,
      metadata: { itemId: args.itemId, completed: args.completed },
    })
    return { success: true }
  },
})

export const completeRun = mutation({
  args: { workspaceId: v.id("workspaces"), runId: v.id("checklistRuns") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "checklist.complete_run")
    const userId = await ensureUser(ctx)
    const run = await ctx.db.get(args.runId)
    if (!run || run.workspaceId !== args.workspaceId) throw new Error("Run not found")

    await ctx.db.patch(args.runId, { overallStatus: "review", updatedAt: Date.now() })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "checklist.run.completed",
      resourceType: "checklistRuns",
      resourceId: args.runId,
    })
    return { success: true }
  },
})

export const reviewRun = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    runId: v.id("checklistRuns"),
    approved: v.boolean(),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "checklist.review_run")
    const userId = await ensureUser(ctx)
    const run = await ctx.db.get(args.runId)
    if (!run || run.workspaceId !== args.workspaceId) throw new Error("Run not found")

    await ctx.db.patch(args.runId, {
      overallStatus: args.approved ? "approved" : "failed",
      reviewedBy: userId,
      reviewedAt: Date.now(),
      reviewNotes: args.reviewNotes,
      updatedAt: Date.now(),
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "checklist.run.reviewed",
      resourceType: "checklistRuns",
      resourceId: args.runId,
      metadata: { approved: args.approved },
    })
    return { success: true }
  },
})
