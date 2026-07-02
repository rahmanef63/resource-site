import { defineTable } from 'convex/server'
import { v } from 'convex/values'

/**
 * Staff Operations — minimum-viable schema.
 *
 * Single canonical table `staffTasks` covering housekeeping, laundry,
 * damage-report, maintenance, and ad-hoc operational tasks. Monotonic
 * `taskNumber` minted via `nextCounterValue(workspaceId, "staffTasks")`.
 */

const taskCategory = v.union(
  v.literal('housekeeping'),
  v.literal('laundry'),
  v.literal('damage-report'),
  v.literal('maintenance'),
  v.literal('other'),
)

const taskPriority = v.union(
  v.literal('low'),
  v.literal('medium'),
  v.literal('high'),
  v.literal('urgent'),
)

const taskStatus = v.union(
  v.literal('open'),
  v.literal('assigned'),
  v.literal('in-progress'),
  v.literal('completed'),
  v.literal('cancelled'),
)

export const staffOperationsTables = {
  staffTasks: defineTable({
    workspaceId: v.id('workspaces'),
    taskNumber: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    category: taskCategory,
    priority: taskPriority,
    status: taskStatus,
    assignedToUserId: v.optional(v.id('users')),
    locationLabel: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
    createdBy: v.id('users'),
    updatedBy: v.id('users'),
  })
    .index('by_workspace', ['workspaceId'])
    .index('by_workspace_status', ['workspaceId', 'status'])
    .index('by_workspace_assignee', ['workspaceId', 'assignedToUserId'])
    .index('by_workspace_category', ['workspaceId', 'category']),
}

export default staffOperationsTables
