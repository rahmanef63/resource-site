"use client"

import { Inbox } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import { ForecastStateBadge } from "./ForecastStateBadge"
import type { ForecastSummary } from "../types"

function formatIDR(value: number) {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `IDR ${value.toLocaleString()}`
  }
}

interface Props {
  items: ForecastSummary[]
  onSelect: (row: ForecastSummary) => void
  emptyAction?: React.ReactNode
}

export function ForecastList({ items, onSelect, emptyAction }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
        <div className="rounded-full bg-muted p-3">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No cash-flow forecasts yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Start a draft to project inflow, outflow, and closing balance.
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
            <TableHead>Period</TableHead>
            <TableHead>Horizon</TableHead>
            <TableHead>Base cash</TableHead>
            <TableHead>Inflow</TableHead>
            <TableHead>Outflow</TableHead>
            <TableHead>Closing</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row) => (
            <TableRow key={row._id} className="cursor-pointer" onClick={() => onSelect(row)}>
              <TableCell className="font-mono text-xs">
                {row.startDate} — {row.endDate}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {row.horizonDays}d
              </TableCell>
              <TableCell className="text-sm">{formatIDR(row.baseCash)}</TableCell>
              <TableCell className="text-sm text-emerald-600">
                {formatIDR(row.projectedInflow)}
              </TableCell>
              <TableCell className="text-sm text-red-600">
                {formatIDR(row.projectedOutflow)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-sm font-semibold",
                  row.projectedClosing >= 0 ? "text-emerald-600" : "text-red-600",
                )}
              >
                {formatIDR(row.projectedClosing)}
              </TableCell>
              <TableCell>
                <ForecastStateBadge status={row.status} />
              </TableCell>
              <TableCell className="text-right text-xs text-muted-foreground">
                {formatRelativeTime(row.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
