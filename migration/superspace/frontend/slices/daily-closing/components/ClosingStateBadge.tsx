"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ClosingStatus } from "../types"
import { CLOSING_STATUS_LABELS } from "../types"

const STATUS_CLASSES: Record<ClosingStatus, string> = {
  open: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  recorded: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  closed: "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200",
  approved: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  disputed: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
}

export function ClosingStateBadge({
  status,
  className,
}: {
  status: ClosingStatus
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn("text-xs", STATUS_CLASSES[status], className)}
    >
      {CLOSING_STATUS_LABELS[status]}
    </Badge>
  )
}
