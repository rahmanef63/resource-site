"use client"

import { Inbox } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { SeverityBadge } from "./SeverityBadge"
import type { KpiThreshold } from "../types"
import { formatDirectionExpr } from "../types"
import type { Id } from "@convex/_generated/dataModel"

interface ThresholdListProps {
  items: KpiThreshold[]
  onSelect: (row: KpiThreshold) => void
  onToggle: (id: Id<"kpiThresholds">, isActive: boolean) => Promise<void> | void
  emptyAction?: React.ReactNode
}

export function ThresholdList({ items, onSelect, onToggle, emptyAction }: ThresholdListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
        <div className="rounded-full bg-muted p-3">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No thresholds defined yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Define a threshold to start monitoring a KPI and emit alerts when it is breached.
          </p>
        </div>
        {emptyAction}
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>KPI key</TableHead>
            <TableHead>Metric</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead className="text-right">Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row) => (
            <TableRow key={row._id} className="cursor-pointer">
              <TableCell className="font-mono text-xs" onClick={() => onSelect(row)}>
                {row.kpiKey}
              </TableCell>
              <TableCell className="text-sm" onClick={() => onSelect(row)}>
                {row.metric}
              </TableCell>
              <TableCell
                className="font-mono text-xs text-muted-foreground"
                onClick={() => onSelect(row)}
              >
                {formatDirectionExpr(row.direction, row.value1, row.value2)}
              </TableCell>
              <TableCell onClick={() => onSelect(row)}>
                <SeverityBadge severity={row.severity} />
              </TableCell>
              <TableCell
                className="text-sm text-muted-foreground"
                onClick={() => onSelect(row)}
              >
                {row.branchId ?? "—"}
              </TableCell>
              <TableCell
                className="text-right"
                onClick={(e) => e.stopPropagation()}
              >
                <Switch
                  checked={row.isActive}
                  onCheckedChange={(checked) => onToggle(row._id, checked)}
                  aria-label={row.isActive ? "Deactivate threshold" : "Activate threshold"}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
