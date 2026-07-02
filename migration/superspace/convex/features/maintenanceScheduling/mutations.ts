import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { ensureUser, requireActiveMembership, requirePermission } from "../../auth/helpers"
import { logAuditEvent } from "../../shared/audit"

const FREQ_MS: Record<string, number> = {
  daily: 86_400_000,
  weekly: 7 * 86_400_000,
  monthly: 30 * 86_400_000,
  quarterly: 90 * 86_400_000,
  yearly: 365 * 86_400_000,
}

export const scheduleTask = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    branchId: v.optional(v.string()),
    assetId: v.optional(v.id("managedAssets")),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("preventive"), v.literal("reactive"), v.literal("inspection")),
    frequency: v.union(
      v.literal("once"),
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("quarterly"),
      v.literal("yearly"),
    ),
    nextDueAt: v.number(),
    assignedTo: v.optional(v.id("users")),
    estimatedCost: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "maintenance.schedule")
    const userId = await ensureUser(ctx)
    const now = Date.now()
    const id = await ctx.db.insert("maintenanceTasks", {
      workspaceId: args.workspaceId,
      branchId: args.branchId,
      assetId: args.assetId,
      title: args.title,
      description: args.description,
      type: args.type,
      frequency: args.frequency,
      nextDueAt: args.nextDueAt,
      assignedTo: args.assignedTo,
      status: "scheduled",
      estimatedCost: args.estimatedCost,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "maintenance.scheduled",
      resourceType: "maintenanceTasks",
      resourceId: id,
    })
    return { id, success: true }
  },
})

export const completeTask = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    taskId: v.id("maintenanceTasks"),
    actualCost: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "maintenance.complete")
    const userId = await ensureUser(ctx)
    const task = await ctx.db.get(args.taskId)
    if (!task || task.workspaceId !== args.workspaceId) throw new Error("Task not found")

    const now = Date.now()
    const isRecurring = task.frequency !== "once"

    if (isRecurring) {
      const nextDueAt = now + (FREQ_MS[task.frequency] ?? 0)
      await ctx.db.patch(args.taskId, {
        lastDoneAt: now,
        nextDueAt,
        status: "scheduled",
        actualCost: args.actualCost,
        notes: args.notes ?? task.notes,
        completedBy: userId,
        completedAt: now,
        updatedAt: now,
      })
    } else {
      await ctx.db.patch(args.taskId, {
        lastDoneAt: now,
        status: "completed",
        actualCost: args.actualCost,
        notes: args.notes ?? task.notes,
        completedBy: userId,
        completedAt: now,
        updatedAt: now,
      })
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "maintenance.completed",
      resourceType: "maintenanceTasks",
      resourceId: args.taskId,
      metadata: { actualCost: args.actualCost, recurring: isRecurring },
    })
    return { success: true }
  },
})

export const updateTask = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    taskId: v.id("maintenanceTasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(
      v.union(v.literal("preventive"), v.literal("reactive"), v.literal("inspection")),
    ),
    frequency: v.optional(
      v.union(
        v.literal("once"),
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly"),
        v.literal("quarterly"),
        v.literal("yearly"),
      ),
    ),
    assignedTo: v.optional(v.id("users")),
    estimatedCost: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "maintenance.schedule")
    const userId = await ensureUser(ctx)
    const task = await ctx.db.get(args.taskId)
    if (!task || task.workspaceId !== args.workspaceId) throw new Error("Task not found")
    if (task.status === "completed") {
      throw new Error("Cannot update a completed task")
    }
    const patch: Record<string, unknown> = { updatedAt: Date.now() }
    if (args.title !== undefined) patch.title = args.title
    if (args.description !== undefined) patch.description = args.description
    if (args.type !== undefined) patch.type = args.type
    if (args.frequency !== undefined) patch.frequency = args.frequency
    if (args.assignedTo !== undefined) patch.assignedTo = args.assignedTo
    if (args.estimatedCost !== undefined) patch.estimatedCost = args.estimatedCost
    if (args.notes !== undefined) patch.notes = args.notes
    await ctx.db.patch(args.taskId, patch as any)
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "maintenance.updated",
      resourceType: "maintenanceTasks",
      resourceId: args.taskId,
      changes: patch,
    })
    return { success: true }
  },
})

export const rescheduleTask = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    taskId: v.id("maintenanceTasks"),
    newDueDate: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "maintenance.schedule")
    const userId = await ensureUser(ctx)
    const task = await ctx.db.get(args.taskId)
    if (!task || task.workspaceId !== args.workspaceId) throw new Error("Task not found")
    if (task.status === "completed") throw new Error("Cannot reschedule a completed task")
    await ctx.db.patch(args.taskId, {
      nextDueAt: args.newDueDate,
      status: "scheduled",
      updatedAt: Date.now(),
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "maintenance.rescheduled",
      resourceType: "maintenanceTasks",
      resourceId: args.taskId,
      metadata: { newDueDate: args.newDueDate, reason: args.reason, previousStatus: task.status },
    })
    return { success: true }
  },
})

export const deleteTask = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    taskId: v.id("maintenanceTasks"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "maintenance.schedule")
    const userId = await ensureUser(ctx)
    const task = await ctx.db.get(args.taskId)
    if (!task || task.workspaceId !== args.workspaceId) throw new Error("Task not found")
    await ctx.db.delete(args.taskId)
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "maintenance.deleted",
      resourceType: "maintenanceTasks",
      resourceId: args.taskId,
      metadata: { title: task.title, type: task.type, frequency: task.frequency },
    })
    return { success: true }
  },
})

export const skipTask = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    taskId: v.id("maintenanceTasks"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "maintenance.skip")
    const userId = await ensureUser(ctx)
    const task = await ctx.db.get(args.taskId)
    if (!task || task.workspaceId !== args.workspaceId) throw new Error("Task not found")

    await ctx.db.patch(args.taskId, { status: "skipped", notes: args.reason, updatedAt: Date.now() })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "maintenance.skipped",
      resourceType: "maintenanceTasks",
      resourceId: args.taskId,
      metadata: { reason: args.reason },
    })
    return { success: true }
  },
})
