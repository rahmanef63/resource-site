"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LayoutList, Columns3, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

import { TaskListItem, KanbanCard } from "../views/TasksPage"
import type { Task } from "../types"

const NOW = Date.now()
const DAY = 86_400_000
const _id = (raw: string) => raw as unknown as Task["id"]
const _wsId = "ws_demo" as unknown as Task["workspaceId"]

const MOCK_TASKS: Task[] = [
  { id: _id("t_1"), workspaceId: _wsId, title: "Review Q2 product roadmap", description: "Add feedback from last week's customer council.", status: "todo",        priority: "high",   dueDate: NOW + DAY * 2, createdAt: NOW - DAY * 3, updatedAt: NOW - DAY * 1 },
  { id: _id("t_2"), workspaceId: _wsId, title: "Ship onboarding emails v3",   description: "Final QA + Mailchimp template upload.",       status: "in_progress", priority: "medium", dueDate: NOW + DAY * 5, createdAt: NOW - DAY * 4, updatedAt: NOW - DAY * 1 },
  { id: _id("t_3"), workspaceId: _wsId, title: "Audit RBAC role keys",         description: "Match config.ts permissions array to mutations.", status: "in_progress", priority: "high",  dueDate: NOW - DAY * 1, createdAt: NOW - DAY * 7, updatedAt: NOW - DAY * 2 },
  { id: _id("t_4"), workspaceId: _wsId, title: "Renew SSL certificate",        description: null,                                            status: "completed",  priority: "low",    dueDate: NOW - DAY * 10, createdAt: NOW - DAY * 14, updatedAt: NOW - DAY * 9, completedAt: NOW - DAY * 9 },
  { id: _id("t_5"), workspaceId: _wsId, title: "Pay AWS invoice",              description: "Use ops@superspace.com card.",                  status: "todo",        priority: "medium", dueDate: NOW + DAY * 7, createdAt: NOW - DAY * 1, updatedAt: NOW - DAY * 1 },
]

const KANBAN_COLUMNS: { key: Task["status"]; label: string; color: string }[] = [
  { key: "todo", label: "To Do", color: "border-t-slate-400" },
  { key: "in_progress", label: "In Progress", color: "border-t-blue-400" },
  { key: "completed", label: "Completed", color: "border-t-emerald-400" },
]

function TasksPreview({ compact }: FeaturePreviewProps) {
  const [tasks, setTasks] = React.useState<Task[]>(MOCK_TASKS)
  const [viewMode, setViewMode] = React.useState<"list" | "kanban">("list")

  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Tasks</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {tasks.filter((t) => t.status !== "completed").length} active · {tasks.length} total
        </p>
      </div>
    )
  }

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    overdue: tasks.filter((t) => t.dueDate && t.dueDate < NOW && t.status !== "completed").length,
  }

  const tasksByStatus: Record<Task["status"], Task[]> = { todo: [], in_progress: [], completed: [] }
  for (const t of tasks) tasksByStatus[t.status].push(t)

  const handleToggle = (task: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: t.status === "completed" ? "todo" : "completed" } : t))
    )
  }
  const handleDelete = (task: Task) => setTasks((prev) => prev.filter((t) => t.id !== task.id))

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-shrink-0 items-center justify-between border-b px-4 py-2">
        <h3 className="text-sm font-semibold">Tasks</h3>
        <div className="flex items-center gap-2">
          <Button aria-label="List view" variant="ghost" size="icon" className={cn("h-8 w-8", viewMode === "list" && "bg-muted")} onClick={() => setViewMode("list")}>
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button aria-label="Column view" variant="ghost" size="icon" className={cn("h-8 w-8", viewMode === "kanban" && "bg-muted")} onClick={() => setViewMode("kanban")}>
            <Columns3 className="h-4 w-4" />
          </Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New</Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="mb-4 grid grid-cols-3 gap-3">
          <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="mt-0.5 text-xs text-muted-foreground">Total</p></CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-2xl font-bold text-emerald-500">{stats.completed}</p><p className="mt-0.5 text-xs text-muted-foreground">Done</p></CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-2xl font-bold text-red-500">{stats.overdue}</p><p className="mt-0.5 text-xs text-muted-foreground">Overdue</p></CardContent></Card>
        </div>

        {viewMode === "list" ? (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                isUpdating={false}
                isRemoving={false}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {KANBAN_COLUMNS.map((col) => (
              <div key={col.key} className={cn("flex flex-col rounded-xl border-t-4 bg-muted/30 p-3", col.color)}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold">{col.label}</span>
                  <Badge variant="outline" className="text-xs">{tasksByStatus[col.key].length}</Badge>
                </div>
                <div className="flex min-h-[4rem] flex-col gap-2">
                  {tasksByStatus[col.key].map((task) => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      isUpdating={false}
                      isRemoving={false}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onDragStart={() => { /* preview: no-op */ }}
                      onDragEnd={() => { /* preview: no-op */ }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "tasks",
  name: "Tasks",
  description: "Task management with list + kanban views, priorities, and due dates.",
  component: TasksPreview,
  category: "productivity",
  tags: ["tasks", "todos", "kanban", "productivity"],
  mockDataSets: [
    {
      id: "default",
      name: "Active sprint",
      description: "5 mixed-status tasks driving real TaskListItem and KanbanCard from TasksPage.",
      data: { tasks: MOCK_TASKS },
    },
  ],
})
