"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { STATUS_LABELS, type ForecastStatus } from "../types"

const STATUS_CLASSES: Record<ForecastStatus, string> = {
  draft: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  published: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  archived: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
}

export function ForecastStateBadge({
  status,
  className,
}: {
  status: ForecastStatus
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn("text-xs", STATUS_CLASSES[status], className)}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
