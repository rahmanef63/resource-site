"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TransactionType } from "../types"
import { TRANSACTION_TYPE_LABELS } from "../types"

const TYPE_CLASSES: Record<TransactionType, string> = {
  earn: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  redeem: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  adjust: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  expire: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
}

export function TransactionTypeBadge({
  type,
  className,
}: {
  type: TransactionType
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn("text-xs", TYPE_CLASSES[type], className)}>
      {TRANSACTION_TYPE_LABELS[type]}
    </Badge>
  )
}
