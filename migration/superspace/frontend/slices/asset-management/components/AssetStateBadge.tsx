"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AssetStatus } from "../types"
import { ASSET_STATUS_LABELS } from "../types"

const STATUS_CLASSES: Record<AssetStatus, string> = {
  active: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  maintenance: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  retired: "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-200",
  lost: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
}

export function AssetStateBadge({
  status,
  className,
}: {
  status: AssetStatus
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn("text-xs", STATUS_CLASSES[status], className)}>
      {ASSET_STATUS_LABELS[status]}
    </Badge>
  )
}
