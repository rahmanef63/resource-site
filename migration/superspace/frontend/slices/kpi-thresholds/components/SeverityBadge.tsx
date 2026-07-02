"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Severity } from "../types"
import { SEVERITY_LABELS } from "../types"

const SEVERITY_CLASSES: Record<Severity, string> = {
  info: "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-200",
  warning: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  critical: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
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
