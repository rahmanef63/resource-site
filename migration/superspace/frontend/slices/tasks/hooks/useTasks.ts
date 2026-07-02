import { useCallback, useMemo, useState } from "react"
import { useQuery, useMutation } from "convex/react"
// TS2589 escape — the generated `api` type exceeds tsc's instantiation budget
// once the schema grows. `any-api` preserves runtime correctness while keeping
// this hook's typecheck O(1). See the escape-hatch doc in the helper file.
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import type { Id } from "@convex/_generated/dataModel"
import type {
  CreateTaskInput,
  Task,
  TaskPriority,
  TaskStats,
  TaskStatus,
  UpdateTaskInput,
} from "../types"

/**
 * Tasks Hook
 *
 * Provides data and actions for the tasks feature.
 */
export function useTasks(workspaceId?: Id<"workspaces"> | null) {
  const [error, setError] = useState<Error | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const tasksQuery = useQuery(
    api.features.tasks.queries.list,
    workspaceId ? { workspaceId } : "skip",
  )

  const createTaskMutation = useMutation(api.features.tasks.mutations.create as any)
  const updateTaskMutation = useMutation(api.features.tasks.mutations.update as any)
  const removeTaskMutation = useMutation(api.features.tasks.mutations.remove as any)

  const isLoading = workspaceId ? tasksQuery === undefined : false

  const tasks = useMemo<Task[]>(() => {
    if (!tasksQuery) return []
    // tasksQuery is `any` because of the TS2589 escape-hatch import above.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (tasksQuery as any[]).map((task: any) => ({
      id: task._id,
      workspaceId: task.workspaceId,
      title: task.title,
      description: task.description ?? null,
      status: task.status as TaskStatus,
      priority: task.priority as TaskPriority,
      dueDate: task.dueDate ?? null,
      assigneeId: (task as any).assigneeId ?? (task as any).assignedTo ?? null,
      createdAt: (task as any).createdAt ?? task._creationTime,
      updatedAt: (task as any).updatedAt ?? task._creationTime,
      completedAt: (task as any).completedAt ?? (task as any).completedDate ?? null,
    }))
  }, [tasksQuery])

  const stats = useMemo<TaskStats>(() => {
    const now = Date.now()
    const total = tasks.length
    const completed = tasks.filter((task) => task.status === "completed").length
    const inProgress = tasks.filter((task) => task.status === "in_progress").length
    const todo = tasks.filter((task) => task.status === "todo").length
    const overdue = tasks.filter((task) => task.dueDate != null && task.dueDate < now && task.status !== "completed")
      .length

    return { total, completed, inProgress, todo, overdue }
  }, [tasks])

  const createTask = useCallback(
    async (input: CreateTaskInput) => {
      if (!workspaceId) throw new Error("Workspace is required to create a task")

      setIsCreating(true)
      setError(null)

      try {
        const payload: any = {
          workspaceId,
          title: input.title,
        }
        if (input.description !== undefined) payload.description = input.description
        if (input.priority !== undefined) payload.priority = input.priority
        if (input.status !== undefined) payload.status = input.status
        if (input.dueDate !== undefined && input.dueDate !== null) payload.dueDate = input.dueDate
        if (input.assigneeId !== undefined && input.assigneeId !== null) {
          payload.assigneeId = input.assigneeId
        }

        await createTaskMutation(payload)
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setIsCreating(false)
      }
    },
    [workspaceId, createTaskMutation],
  )

  const updateTask = useCallback(
    async (taskId: Id<"tasks">, patch: UpdateTaskInput) => {
      setIsUpdating(true)
      setError(null)

      try {
        const payload: any = { id: taskId, patch: {} }

        if (patch.title !== undefined) payload.patch.title = patch.title
        if (patch.description !== undefined) payload.patch.description = patch.description
        if (patch.status !== undefined) payload.patch.status = patch.status
        if (patch.priority !== undefined) payload.patch.priority = patch.priority
        if (patch.dueDate !== undefined) payload.patch.dueDate = patch.dueDate
        if (patch.assigneeId !== undefined) payload.patch.assigneeId = patch.assigneeId

        await updateTaskMutation(payload)
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setIsUpdating(false)
      }
    },
    [updateTaskMutation],
  )

  const deleteTask = useCallback(
    async (taskId: Id<"tasks">) => {
      setIsRemoving(true)
      setError(null)

      try {
        await removeTaskMutation({ id: taskId })
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setIsRemoving(false)
      }
    },
    [removeTaskMutation],
  )

  return {
    tasks,
    stats,
    isLoading,
    error,
    isCreating,
    isUpdating,
    isRemoving,
    createTask,
    updateTask,
    deleteTask,
    hasWorkspace: Boolean(workspaceId),
  }
}
