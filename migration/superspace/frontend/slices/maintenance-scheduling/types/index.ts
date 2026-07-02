import { z } from "zod"
import type { Id } from "@convex/_generated/dataModel"
import type { BaseEntity } from "../../../shared/types"

export const TASK_TYPES = ["preventive", "reactive", "inspection"] as const
export type TaskType = (typeof TASK_TYPES)[number]

export const FREQUENCIES = [
  "once",
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
] as const
export type Frequency = (typeof FREQUENCIES)[number]

export const TASK_STATUSES = [
  "scheduled",
  "in_progress",
  "completed",
  "overdue",
  "skipped",
] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export interface MaintenanceTask extends Omit<BaseEntity, "id"> {
  _id: Id<"maintenanceTasks">
  workspaceId: Id<"workspaces">
  branchId?: string
  assetId?: Id<"managedAssets">
  title: string
  description?: string
  type: TaskType
  frequency: Frequency
  lastDoneAt?: number
  nextDueAt: number
  assignedTo?: Id<"users">
  status: TaskStatus
  estimatedCost?: number
  actualCost?: number
  notes?: string
  completedBy?: Id<"users">
  completedAt?: number
}

export interface MaintenanceSummary {
  total: number
  scheduled: number
  inProgress: number
  overdue: number
  totalCost: number
}

export const scheduleTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(TASK_TYPES),
  frequency: z.enum(FREQUENCIES),
  nextDueAt: z.string().min(1, "Due date is required"),
  estimatedCost: z.coerce.number().nonnegative().optional(),
  assignedTo: z.string().optional(),
  branchId: z.string().optional(),
  assetId: z.string().optional(),
  notes: z.string().optional(),
})

export type ScheduleTaskInput = z.infer<typeof scheduleTaskSchema>

export const completeTaskSchema = z.object({
  actualCost: z.coerce.number().nonnegative().optional(),
  notes: z.string().optional(),
})

export type CompleteTaskInput = z.infer<typeof completeTaskSchema>

export const skipTaskSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
})

export type SkipTaskInput = z.infer<typeof skipTaskSchema>

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  preventive: "Preventive",
  reactive: "Reactive",
  inspection: "Inspection",
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  once: "One-time",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  overdue: "Overdue",
  skipped: "Skipped",
}
