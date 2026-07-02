"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { RunStatus } from "../types"
import { RUN_STATUS_LABELS } from "../types"

const STATUS_CLASSES: Record<RunStatus, string> = {
  pending: "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-200",
  in_progress: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  completed: "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200",
  review: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  approved: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  failed: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
}

export function RunStateBadge({
  status,
  className,
}: {
  status: RunStatus
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn("text-xs", STATUS_CLASSES[status], className)}
    >
      {RUN_STATUS_LABELS[status]}
    </Badge>
  )
}
