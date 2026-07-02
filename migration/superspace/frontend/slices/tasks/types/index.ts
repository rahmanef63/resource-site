import type { Id } from "@convex/_generated/dataModel"
import type { BaseEntity, WorkspaceScoped } from "../../../shared/types"

export type TaskStatus = "todo" | "in_progress" | "completed"
export type TaskPriority = "low" | "medium" | "high"

export interface Task
  extends Omit<BaseEntity, "id">,
    Omit<WorkspaceScoped, "workspaceId"> {
  id: Id<"tasks">
  workspaceId: Id<"workspaces">
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: number | null
  assigneeId?: Id<"users"> | null
  completedAt?: number | null
}

export interface TaskStats {
  total: number
  completed: number
  inProgress: number
  todo: number
  overdue: number
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority?: TaskPriority
  status?: TaskStatus
  dueDate?: number | null
  assigneeId?: Id<"users"> | null
}

export interface UpdateTaskInput {
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: number | null
  assigneeId?: Id<"users"> | null
}
