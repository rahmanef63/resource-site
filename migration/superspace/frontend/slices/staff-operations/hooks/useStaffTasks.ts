"use client"

import { useMutation, useQuery } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import type { Id } from "@convex/_generated/dataModel"

export type TaskCategory =
  | "housekeeping"
  | "laundry"
  | "damage-report"
  | "maintenance"
  | "other"

export type TaskPriority = "low" | "medium" | "high" | "urgent"

export type TaskStatus =
  | "open"
  | "assigned"
  | "in-progress"
  | "completed"
  | "cancelled"

export interface StaffTask {
  _id: Id<"staffTasks">
  _creationTime: number
  workspaceId: Id<"workspaces">
  taskNumber: string
  title: string
  description?: string
  category: TaskCategory
  priority: TaskPriority
  status: TaskStatus
  assignedToUserId?: Id<"users">
  locationLabel?: string
  dueDate?: string
  notes?: string
  createdAt: number
  updatedAt: number
  completedAt?: number
  createdBy: Id<"users">
  updatedBy: Id<"users">
}

/**
 * Wrap useQuery for the staff-operations task list.
 * Honors workspaceId / status / category filters and returns an empty array
 * until the query resolves so consumer components can render deterministically.
 */
export function useStaffTasks(
  workspaceId: Id<"workspaces"> | null | undefined,
  filters?: {
    status?: TaskStatus
    category?: TaskCategory
    assigneeId?: Id<"users">
    limit?: number
  },
) {
  const rows = useQuery(
    api.features.staffOperations.queries.listTasks,
    workspaceId
      ? {
          workspaceId,
          status: filters?.status,
          category: filters?.category,
          assigneeId: filters?.assigneeId,
          limit: filters?.limit,
        }
      : "skip",
  ) as StaffTask[] | undefined

  return {
    tasks: rows ?? [],
    isLoading: workspaceId ? rows === undefined : false,
  }
}

export function useStaffTaskMutations() {
  const createTask = useMutation(api.features.staffOperations.mutations.createTask)
  const updateTask = useMutation(api.features.staffOperations.mutations.updateTask)
  const assignTask = useMutation(api.features.staffOperations.mutations.assignTask)
  const completeTask = useMutation(api.features.staffOperations.mutations.completeTask)

  return { createTask, updateTask, assignTask, completeTask }
}
