"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { RequestStatus } from "../types"
import { REQUEST_STATUS_LABELS } from "../types"

const STATUS_CLASSES: Record<RequestStatus, string> = {
  pending: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  approved: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  disbursed: "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200",
  closed: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  rejected: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
  cancelled: "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-200",
}

export function RequestStateBadge({
  status,
  className,
}: {
  status: RequestStatus
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn("text-xs", STATUS_CLASSES[status], className)}>
      {REQUEST_STATUS_LABELS[status]}
    </Badge>
  )
}
