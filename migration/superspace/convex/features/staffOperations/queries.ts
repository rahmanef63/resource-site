import { v } from 'convex/values'
import { query } from '../../_generated/server'
import { requirePermission } from '../../auth/helpers'
import { PERMS } from '../../workspace/permissions'

const MAX_LIMIT = 200

const statusLiteral = v.union(
  v.literal('open'),
  v.literal('assigned'),
  v.literal('in-progress'),
  v.literal('completed'),
  v.literal('cancelled'),
)

const categoryLiteral = v.union(
  v.literal('housekeeping'),
  v.literal('laundry'),
  v.literal('damage-report'),
  v.literal('maintenance'),
  v.literal('other'),
)

export const listTasks = query({
  args: {
    workspaceId: v.id('workspaces'),
    status: v.optional(statusLiteral),
    category: v.optional(categoryLiteral),
    assigneeId: v.optional(v.id('users')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.STAFF_OPERATIONS_VIEW)
    const take = Math.min(args.limit ?? 100, MAX_LIMIT)

    if (args.status) {
      const rows = await ctx.db
        .query('staffTasks')
        .withIndex('by_workspace_status', (q) =>
          q.eq('workspaceId', args.workspaceId).eq('status', args.status!),
        )
        .order('desc')
        .take(take)
      return rows.filter(
        (r) =>
          (!args.category || r.category === args.category) &&
          (!args.assigneeId || r.assignedToUserId === args.assigneeId),
      )
    }

    if (args.assigneeId) {
      const rows = await ctx.db
        .query('staffTasks')
        .withIndex('by_workspace_assignee', (q) =>
          q.eq('workspaceId', args.workspaceId).eq('assignedToUserId', args.assigneeId!),
        )
        .order('desc')
        .take(take)
      return rows.filter((r) => !args.category || r.category === args.category)
    }

    if (args.category) {
      return await ctx.db
        .query('staffTasks')
        .withIndex('by_workspace_category', (q) =>
          q.eq('workspaceId', args.workspaceId).eq('category', args.category!),
        )
        .order('desc')
        .take(take)
    }

    return await ctx.db
      .query('staffTasks')
      .withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
      .order('desc')
      .take(take)
  },
})

export const getTask = query({
  args: {
    workspaceId: v.id('workspaces'),
    taskId: v.id('staffTasks'),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.STAFF_OPERATIONS_VIEW)
    const row = await ctx.db.get(args.taskId)
    if (!row || row.workspaceId !== args.workspaceId) return null
    return row
  },
})
