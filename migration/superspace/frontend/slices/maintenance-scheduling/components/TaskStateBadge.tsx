"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TaskStatus } from "../types"
import { TASK_STATUS_LABELS } from "../types"

const STATUS_CLASSES: Record<TaskStatus, string> = {
  scheduled: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  in_progress: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  completed: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  overdue: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
  skipped: "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-200",
}

export function TaskStateBadge({
  status,
  className,
}: {
  status: TaskStatus
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn("text-xs", STATUS_CLASSES[status], className)}>
      {TASK_STATUS_LABELS[status]}
    </Badge>
  )
}
