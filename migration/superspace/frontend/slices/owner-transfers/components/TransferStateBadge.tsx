"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TransferStatus } from "../types"
import { TRANSFER_STATUS_LABELS } from "../types"

const STATUS_CLASSES: Record<TransferStatus, string> = {
  pending: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  approved: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  rejected: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
  reconciled: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
}

export function TransferStateBadge({
  status,
  className,
}: {
  status: TransferStatus
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn("text-xs", STATUS_CLASSES[status], className)}>
      {TRANSFER_STATUS_LABELS[status]}
    </Badge>
  )
}
