import { v } from 'convex/values'
import { mutation } from '../../_generated/server'
import type { Id } from '../../_generated/dataModel'
import { ensureUser, requirePermission } from '../../auth/helpers'
import { PERMS } from '../../workspace/permissions'
import { logAuditEvent } from '../../shared/audit'
import { nextCounterValue, formatCounter } from '../../shared/counters'

const categoryLiteral = v.union(
  v.literal('housekeeping'),
  v.literal('laundry'),
  v.literal('damage-report'),
  v.literal('maintenance'),
  v.literal('other'),
)

const priorityLiteral = v.union(
  v.literal('low'),
  v.literal('medium'),
  v.literal('high'),
  v.literal('urgent'),
)

export const createTask = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    title: v.string(),
    description: v.optional(v.string()),
    category: categoryLiteral,
    priority: priorityLiteral,
    locationLabel: v.optional(v.string()),
    dueDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.STAFF_OPERATIONS_CREATE,
    )
    const actorId: Id<'users'> = (membership?.userId as Id<'users'> | undefined) ?? (await ensureUser(ctx))
    if (!args.title.trim()) throw new Error('title is required')

    const counterValue = await nextCounterValue(ctx, args.workspaceId, 'staffTasks')
    const taskNumber = formatCounter('TASK', counterValue, 5)

    const now = Date.now()
    const id = await ctx.db.insert('staffTasks', {
      workspaceId: args.workspaceId,
      taskNumber,
      title: args.title.trim(),
      description: args.description,
      category: args.category,
      priority: args.priority,
      status: 'open',
      locationLabel: args.locationLabel,
      dueDate: args.dueDate,
      createdAt: now,
      updatedAt: now,
      createdBy: actorId,
      updatedBy: actorId,
    })

    await logAuditEvent(ctx, {
      action: 'staffOperations.task.created',
      workspaceId: args.workspaceId,
      actorUserId: actorId,
      resourceType: 'staffTasks',
      resourceId: id,
      changes: { taskNumber, category: args.category, priority: args.priority },
    })

    return { id, taskNumber, success: true }
  },
})

export const updateTask = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    taskId: v.id('staffTasks'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(categoryLiteral),
    priority: v.optional(priorityLiteral),
    locationLabel: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.STAFF_OPERATIONS_UPDATE,
    )
    const actorId: Id<'users'> = (membership?.userId as Id<'users'> | undefined) ?? (await ensureUser(ctx))

    const task = await ctx.db.get(args.taskId)
    if (!task || task.workspaceId !== args.workspaceId) throw new Error('Task not found')
    if (task.status === 'completed' || task.status === 'cancelled') {
      throw new Error(`Cannot update task in terminal state: ${task.status}`)
    }

    const patch: Record<string, unknown> = { updatedAt: Date.now(), updatedBy: actorId }
    if (args.title !== undefined) patch.title = args.title
    if (args.description !== undefined) patch.description = args.description
    if (args.category !== undefined) patch.category = args.category
    if (args.priority !== undefined) patch.priority = args.priority
    if (args.locationLabel !== undefined) patch.locationLabel = args.locationLabel
    if (args.dueDate !== undefined) patch.dueDate = args.dueDate
    if (args.notes !== undefined) patch.notes = args.notes

    await ctx.db.patch(args.taskId, patch as any)

    await logAuditEvent(ctx, {
      action: 'staffOperations.task.updated',
      workspaceId: args.workspaceId,
      actorUserId: actorId,
      resourceType: 'staffTasks',
      resourceId: args.taskId,
      changes: patch,
    })

    return { success: true }
  },
})

export const assignTask = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    taskId: v.id('staffTasks'),
    assignedToUserId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.STAFF_OPERATIONS_ASSIGN,
    )
    const actorId: Id<'users'> = (membership?.userId as Id<'users'> | undefined) ?? (await ensureUser(ctx))

    const task = await ctx.db.get(args.taskId)
    if (!task || task.workspaceId !== args.workspaceId) throw new Error('Task not found')
    if (task.status === 'completed' || task.status === 'cancelled') {
      throw new Error(`Cannot assign task in terminal state: ${task.status}`)
    }

    const now = Date.now()
    await ctx.db.patch(args.taskId, {
      assignedToUserId: args.assignedToUserId,
      status: 'assigned',
      updatedAt: now,
      updatedBy: actorId,
    })

    await logAuditEvent(ctx, {
      action: 'staffOperations.task.assigned',
      workspaceId: args.workspaceId,
      actorUserId: actorId,
      resourceType: 'staffTasks',
      resourceId: args.taskId,
      changes: { assignedToUserId: args.assignedToUserId },
    })

    return { success: true }
  },
})

export const deleteTask = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    taskId: v.id('staffTasks'),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.STAFF_OPERATIONS_UPDATE,
    )
    const actorId: Id<'users'> = (membership?.userId as Id<'users'> | undefined) ?? (await ensureUser(ctx))

    const task = await ctx.db.get(args.taskId)
    if (!task || task.workspaceId !== args.workspaceId) throw new Error('Task not found')

    await ctx.db.delete(args.taskId)

    await logAuditEvent(ctx, {
      action: 'staffOperations.task.deleted',
      workspaceId: args.workspaceId,
      actorUserId: actorId,
      resourceType: 'staffTasks',
      resourceId: args.taskId,
      metadata: { taskNumber: task.taskNumber, title: task.title },
    })

    return { success: true }
  },
})

export const completeTask = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    taskId: v.id('staffTasks'),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.STAFF_OPERATIONS_UPDATE,
    )
    const actorId: Id<'users'> = (membership?.userId as Id<'users'> | undefined) ?? (await ensureUser(ctx))

    const task = await ctx.db.get(args.taskId)
    if (!task || task.workspaceId !== args.workspaceId) throw new Error('Task not found')
    if (task.status === 'completed') return { success: true, alreadyCompleted: true }
    if (task.status === 'cancelled') throw new Error('Cannot complete a cancelled task')

    const now = Date.now()
    await ctx.db.patch(args.taskId, {
      status: 'completed',
      completedAt: now,
      notes: args.notes ?? task.notes,
      updatedAt: now,
      updatedBy: actorId,
    })

    await logAuditEvent(ctx, {
      action: 'staffOperations.task.completed',
      workspaceId: args.workspaceId,
      actorUserId: actorId,
      resourceType: 'staffTasks',
      resourceId: args.taskId,
    })

    return { success: true }
  },
})
