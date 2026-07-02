"use client"

import { useCallback, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import type { Id } from "@convex/_generated/dataModel"
import { toast } from "@/hooks/use-toast"
import type {
  MaintenanceSummary,
  MaintenanceTask,
  ScheduleTaskInput,
  CompleteTaskInput,
  SkipTaskInput,
  TaskStatus,
} from "../types"

/**
 * Maintenance Scheduling hook.
 *
 * Surfaces the recurring-task workflow (scheduled → in_progress → completed)
 * plus skip + overdue derivation, against the `maintenanceTasks` Convex domain.
 */
export function useMaintenance(
  workspaceId: Id<"workspaces"> | null | undefined,
  opts?: { status?: TaskStatus; withinDays?: number },
) {
  const listQuery = useQuery(
    api.features.maintenanceScheduling.queries.listTasks,
    workspaceId
      ? { workspaceId, ...(opts?.status ? { status: opts.status } : {}) }
      : "skip",
  )

  const summaryQuery = useQuery(
    api.features.maintenanceScheduling.queries.getSummary,
    workspaceId ? { workspaceId } : "skip",
  )

  const dueSoonQuery = useQuery(
    api.features.maintenanceScheduling.queries.getDueSoon,
    workspaceId ? { workspaceId, withinDays: opts?.withinDays ?? 14 } : "skip",
  )

  const scheduleMutation = useMutation(
    api.features.maintenanceScheduling.mutations.scheduleTask,
  )
  const completeMutation = useMutation(
    api.features.maintenanceScheduling.mutations.completeTask,
  )
  const skipMutation = useMutation(
    api.features.maintenanceScheduling.mutations.skipTask,
  )

  const items = useMemo<MaintenanceTask[]>(
    () => ((listQuery ?? []) as MaintenanceTask[]),
    [listQuery],
  )
  const dueSoon = useMemo<MaintenanceTask[]>(
    () => ((dueSoonQuery ?? []) as MaintenanceTask[]),
    [dueSoonQuery],
  )
  const summary = summaryQuery as MaintenanceSummary | undefined

  const isLoading = workspaceId ? listQuery === undefined : false

  const scheduleTask = useCallback(
    async (input: ScheduleTaskInput) => {
      if (!workspaceId) throw new Error("No workspace selected")
      try {
        const result = await scheduleMutation({
          workspaceId,
          title: input.title,
          description: input.description,
          type: input.type,
          frequency: input.frequency,
          nextDueAt: new Date(input.nextDueAt).getTime(),
          estimatedCost: input.estimatedCost,
          assignedTo: input.assignedTo
            ? (input.assignedTo as Id<"users">)
            : undefined,
          branchId: input.branchId,
          assetId: input.assetId
            ? (input.assetId as Id<"managedAssets">)
            : undefined,
          notes: input.notes,
        })
        toast({ title: "Task scheduled", description: input.title })
        return result
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to schedule task"
        toast({ title: "Schedule failed", description: msg, variant: "destructive" })
        throw e
      }
    },
    [workspaceId, scheduleMutation],
  )

  const completeTask = useCallback(
    async (taskId: Id<"maintenanceTasks">, input?: CompleteTaskInput) => {
      if (!workspaceId) return
      try {
        await completeMutation({
          workspaceId,
          taskId,
          actualCost: input?.actualCost,
          notes: input?.notes,
        })
        toast({ title: "Task completed" })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to complete"
        toast({ title: "Complete failed", description: msg, variant: "destructive" })
        throw e
      }
    },
    [workspaceId, completeMutation],
  )

  const skipTask = useCallback(
    async (taskId: Id<"maintenanceTasks">, input: SkipTaskInput) => {
      if (!workspaceId) return
      try {
        await skipMutation({ workspaceId, taskId, reason: input.reason })
        toast({ title: "Task skipped" })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to skip"
        toast({ title: "Skip failed", description: msg, variant: "destructive" })
        throw e
      }
    },
    [workspaceId, skipMutation],
  )

  return {
    items,
    dueSoon,
    summary,
    isLoading,
    scheduleTask,
    completeTask,
    skipTask,
  }
}

/**
 * Client-side overdue check: scheduled tasks whose nextDueAt has passed.
 */
export function isOverdue(task: Pick<MaintenanceTask, "status" | "nextDueAt">): boolean {
  return task.status === "scheduled" && task.nextDueAt < Date.now()
}

/**
 * Legal actions given a task status. Drives the detail-drawer button row.
 */
export function availableActions(
  status: TaskStatus,
): Array<{ id: "complete" | "skip"; label: string }> {
  switch (status) {
    case "scheduled":
    case "in_progress":
    case "overdue":
      return [
        { id: "complete", label: "Complete" },
        { id: "skip", label: "Skip" },
      ]
    case "completed":
    case "skipped":
    default:
      return []
  }
}

export type { MaintenanceTask, MaintenanceSummary, TaskStatus }
