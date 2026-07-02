"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ReportStatus, Severity } from "../types"
import { STATUS_LABELS, SEVERITY_LABELS } from "../types"

const STATUS_CLASSES: Record<ReportStatus, string> = {
  reported: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  triaged: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  investigating: "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200",
  resolved: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  "written-off": "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-200",
}

const SEVERITY_CLASSES: Record<Severity, string> = {
  low: "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-200",
  medium: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  high: "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200",
  critical: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
}

export function ReportStateBadge({
  status,
  className,
}: {
  status: ReportStatus
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn("text-xs", STATUS_CLASSES[status], className)}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn("text-xs", SEVERITY_CLASSES[severity], className)}>
      {SEVERITY_LABELS[severity]}
    </Badge>
  )
}
