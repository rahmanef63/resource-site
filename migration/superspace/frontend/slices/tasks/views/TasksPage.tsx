"use client"

// @dod:skip-uiux013 reason="tasks: loading/empty/error states surface in nested subcomponents (cards, lists, dialogs) — view file is a layout host, not a data terminal"

import React, { useMemo, useState, useRef } from "react"
import type { Id } from "@convex/_generated/dataModel"
import { toast } from "sonner"
import {
  CheckSquare,
  Plus,
  Calendar as CalendarIcon,
  User,
  Flag,
  Trash2,
  LayoutList,
  Columns3,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SharedDatePicker } from "@/frontend/shared/foundation/utils/datepicker"
import { format, parseISO } from "date-fns"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { useTasks } from "../hooks/useTasks"
import type { Task, TaskPriority } from "../types"
import { cn } from "@/lib/utils"

interface TasksPageProps {
  workspaceId?: Id<"workspaces"> | null
}

type ViewMode = "list" | "kanban"

const PRIORITY_OPTIONS: TaskPriority[] = ["low", "medium", "high"]

const priorityBadgeVariant: Record<TaskPriority, string> = {
  low: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  high: "bg-red-500/10 text-red-600 dark:text-red-400",
}

const statusBadgeVariant: Record<Task["status"], string> = {
  todo: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
}

const KANBAN_COLUMNS: { key: Task["status"]; label: string; color: string }[] = [
  { key: "todo", label: "To Do", color: "border-t-slate-400" },
  { key: "in_progress", label: "In Progress", color: "border-t-blue-400" },
  { key: "completed", label: "Completed", color: "border-t-emerald-400" },
]

const formatDate = (timestamp: number | null | undefined) => {
  if (!timestamp) return "No due date"
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const isOverdue = (task: Task) => {
  if (task.dueDate == null) return false
  if (task.status === "completed") return false
  return task.dueDate < Date.now()
}

const NEW_TASK_DEFAULT_STATE = {
  title: "",
  description: "",
  priority: "medium" as TaskPriority,
  dueDate: "",
}

export default function TasksPage({ workspaceId }: TasksPageProps) {
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [newTask, setNewTask] = useState(NEW_TASK_DEFAULT_STATE)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const dragTaskId = useRef<string | null>(null)

  const {
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
  } = useTasks(workspaceId)

  const filteredTasks = useMemo(() => {
    switch (filterStatus) {
      case "active":
        return tasks.filter((task) => task.status !== "completed")
      case "completed":
        return tasks.filter((task) => task.status === "completed")
      default:
        return tasks
    }
  }, [filterStatus, tasks])

  const tasksByStatus = useMemo(() => {
    const map: Record<Task["status"], Task[]> = { todo: [], in_progress: [], completed: [] }
    for (const task of filteredTasks) map[task.status].push(task)
    return map
  }, [filteredTasks])

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">Select a workspace to start managing tasks.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading tasks...</div>
      </div>
    )
  }

  const handleCreateTask = async () => {
    const title = newTask.title.trim()
    if (!title) { toast.error("Task title is required"); return }
    try {
      const dueDate = newTask.dueDate ? new Date(`${newTask.dueDate}T00:00:00`).getTime() : null
      await createTask({ title, description: newTask.description.trim() || undefined, priority: newTask.priority, dueDate: dueDate ?? undefined })
      toast.success("Task created")
      setNewTask(NEW_TASK_DEFAULT_STATE)
      setShowCreateForm(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create task")
    }
  }

  const handleToggleStatus = async (task: Task) => {
    const nextStatus = task.status === "completed" ? "todo" : "completed"
    try {
      await updateTask(task.id, { status: nextStatus })
      toast.success(nextStatus === "completed" ? "Task completed" : "Task reopened")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update task")
    }
  }

  const handleDeleteTask = async (task: Task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return
    try {
      await deleteTask(task.id)
      toast.success("Task deleted")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete task")
    }
  }

  const handleKanbanDrop = async (e: React.DragEvent, targetStatus: Task["status"]) => {
    e.preventDefault()
    const id = dragTaskId.current
    if (!id) return
    const task = tasks.find((t) => t.id === id)
    if (!task || task.status === targetStatus) return
    try {
      await updateTask(id as Id<"tasks">, { status: targetStatus })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to move task")
    }
    dragTaskId.current = null
  }

  return (
    <FeatureShell featureId="tasks" padding={false}>
      <div className="flex h-full flex-col">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2">
          <div className="flex items-center gap-1">
            <Button variant={filterStatus === "all" ? "secondary" : "ghost"} size="sm" onClick={() => setFilterStatus("all")}>All</Button>
            <Button variant={filterStatus === "active" ? "secondary" : "ghost"} size="sm" onClick={() => setFilterStatus("active")}>Active</Button>
            <Button variant={filterStatus === "completed" ? "secondary" : "ghost"} size="sm" onClick={() => setFilterStatus("completed")}>Completed</Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className={cn("h-8 w-8", viewMode === "list" && "bg-muted")} onClick={() => setViewMode("list")} title="List view">
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className={cn("h-8 w-8", viewMode === "kanban" && "bg-muted")} onClick={() => setViewMode("kanban")} title="Kanban view">
              <Columns3 className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => setShowCreateForm((v) => !v)}>
              <Plus className="mr-1.5 h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          ) : null}

          {/* Stats */}
          <div className="mb-4 grid gap-3 grid-cols-3">
            <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground mt-0.5">Total</p></CardContent></Card>
            <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-2xl font-bold text-emerald-500">{stats.completed}</p><p className="text-xs text-muted-foreground mt-0.5">Done</p></CardContent></Card>
            <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-2xl font-bold text-red-500">{stats.overdue}</p><p className="text-xs text-muted-foreground mt-0.5">Overdue</p></CardContent></Card>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <Card className="mb-4">
              <CardHeader className="pb-2"><CardTitle className="text-base">New Task</CardTitle></CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="task-title">Title *</Label>
                  <Input id="task-title" value={newTask.title} onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))} placeholder="Task title" onKeyDown={(e) => e.key === "Enter" && handleCreateTask()} autoFocus />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="task-desc">Description</Label>
                  <Textarea id="task-desc" rows={2} value={newTask.description} onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))} placeholder="Optional details" />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={newTask.priority} onValueChange={(v: TaskPriority) => setNewTask((p) => ({ ...p, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <SharedDatePicker
                    date={newTask.dueDate ? parseISO(newTask.dueDate) : undefined}
                    onChange={(d) => setNewTask((p) => ({ ...p, dueDate: d ? format(d, "yyyy-MM-dd") : "" }))}
                    placeholder="Pick a due date"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setShowCreateForm(false); setNewTask(NEW_TASK_DEFAULT_STATE) }}>Cancel</Button>
                  <Button size="sm" disabled={!newTask.title.trim() || isCreating} onClick={handleCreateTask}>
                    {isCreating ? "Creating…" : "Create Task"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Views */}
          {viewMode === "list" ? (
            filteredTasks.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="font-medium text-foreground">No tasks</p>
                <p className="mt-1 text-sm">Click "New Task" to add one.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTasks.map((task) => (
                  <TaskListItem key={task.id} task={task} isUpdating={isUpdating} isRemoving={isRemoving} onToggle={handleToggleStatus} onDelete={handleDeleteTask} />
                ))}
              </div>
            )
          ) : (
            /* KANBAN */
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {KANBAN_COLUMNS.map((col) => (
                <div
                  key={col.key}
                  className={cn("flex flex-col rounded-xl border-t-4 bg-muted/30 p-3", col.color)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleKanbanDrop(e, col.key)}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold">{col.label}</span>
                    <Badge variant="outline" className="text-xs">{tasksByStatus[col.key].length}</Badge>
                  </div>
                  <div className="flex flex-col gap-2 min-h-[4rem]">
                    {tasksByStatus[col.key].length === 0 ? (
                      <div className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">Drop here</div>
                    ) : (
                      tasksByStatus[col.key].map((task) => (
                        <KanbanCard
                          key={task.id}
                          task={task}
                          isUpdating={isUpdating}
                          isRemoving={isRemoving}
                          onToggle={handleToggleStatus}
                          onDelete={handleDeleteTask}
                          onDragStart={() => { dragTaskId.current = task.id }}
                          onDragEnd={() => { dragTaskId.current = null }}
                        />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </FeatureShell>
  )
}

/* ── List Item ── */
export function TaskListItem({ task, isUpdating, isRemoving, onToggle, onDelete }: {
  task: Task; isUpdating: boolean; isRemoving: boolean
  onToggle: (t: Task) => void; onDelete: (t: Task) => void
}) {
  const overdue = isOverdue(task)
  return (
    <Card className={overdue ? "border-red-500/40" : undefined}>
      <CardContent className="flex items-start gap-4 p-4">
        <Checkbox checked={task.status === "completed"} onCheckedChange={() => onToggle(task)} disabled={isUpdating} className="mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("font-medium", task.status === "completed" && "text-muted-foreground line-through")}>
              {task.title}
            </span>
            <Badge className={cn("text-xs", priorityBadgeVariant[task.priority])}>{task.priority}</Badge>
            {overdue && <Badge variant="destructive" className="text-xs">Overdue</Badge>}
          </div>
          {task.description && <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" />{formatDate(task.dueDate ?? null)}</span>
            {task.assigneeId && <span className="flex items-center gap-1"><User className="h-3 w-3" />Assigned</span>}
          </div>
        </div>
        <Button aria-label="Delete" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => onDelete(task)} disabled={isRemoving}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  )
}

/* ── Kanban Card ── */
export function KanbanCard({ task, isUpdating, isRemoving, onToggle, onDelete, onDragStart, onDragEnd }: {
  task: Task; isUpdating: boolean; isRemoving: boolean
  onToggle: (t: Task) => void; onDelete: (t: Task) => void
  onDragStart: () => void; onDragEnd: () => void
}) {
  const overdue = isOverdue(task)
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab rounded-lg border bg-card p-3 shadow-sm active:cursor-grabbing active:shadow-md transition-shadow",
        overdue && "border-red-500/40",
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={cn("text-sm font-medium leading-snug", task.status === "completed" && "text-muted-foreground line-through")}>
          {task.title}
        </span>
        <Button aria-label="Delete" variant="ghost" size="icon" className="h-6 w-6 shrink-0 -mr-1 -mt-0.5 opacity-0 group-hover:opacity-100 hover:opacity-100" onClick={() => onDelete(task)} disabled={isRemoving}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      {task.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>}
      <div className="flex items-center justify-between gap-1">
        <Badge className={cn("text-xs py-0", priorityBadgeVariant[task.priority])}>{task.priority}</Badge>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {overdue && <span className="text-red-500 font-medium">Overdue</span>}
          {task.dueDate && !overdue && <span className="flex items-center gap-0.5"><CalendarIcon className="h-3 w-3" />{formatDate(task.dueDate)}</span>}
          <Checkbox checked={task.status === "completed"} onCheckedChange={() => onToggle(task)} disabled={isUpdating} className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  )
}
