"use client"

import { BellOff, CheckCircle2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import { cn } from "@/lib/utils"
import { SeverityBadge } from "./SeverityBadge"
import type { KpiAlert, KpiThreshold } from "../types"

interface AlertListProps {
  items: KpiAlert[]
  thresholds: KpiThreshold[]
  onSelect: (row: KpiAlert) => void
  emptyHint?: string
}

function shortId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 4)}…${id.slice(-4)}` : id
}

export function AlertList({ items, thresholds, onSelect, emptyHint }: AlertListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
        <div className="rounded-full bg-muted p-3">
          <BellOff className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No alerts</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {emptyHint ?? "Nothing to triage — all KPIs are within defined thresholds."}
          </p>
        </div>
      </div>
    )
  }

  const thresholdMap = new Map(thresholds.map((t) => [String(t._id), t]))

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Triggered</TableHead>
            <TableHead>KPI</TableHead>
            <TableHead>Actual value</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row) => {
            const threshold = thresholdMap.get(String(row.thresholdId))
            const kpiLabel = threshold?.kpiKey ?? shortId(String(row.thresholdId))
            return (
              <TableRow
                key={row._id}
                className="cursor-pointer"
                onClick={() => onSelect(row)}
              >
                <TableCell className="text-xs text-muted-foreground">
                  {formatRelativeTime(row.triggeredAt)}
                </TableCell>
                <TableCell className="font-mono text-xs">{kpiLabel}</TableCell>
                <TableCell className="font-medium">{row.actualValue}</TableCell>
                <TableCell>
                  <SeverityBadge severity={row.severity} />
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      row.resolved
                        ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                        : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
                    )}
                  >
                    {row.resolved ? "Resolved" : "Open"}
                  </Badge>
                </TableCell>
                <TableCell
                  className="text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  {row.resolved ? (
                    <span className="text-xs text-muted-foreground">
                      {row.resolvedAt ? formatRelativeTime(row.resolvedAt) : "—"}
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => onSelect(row)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Resolve
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
