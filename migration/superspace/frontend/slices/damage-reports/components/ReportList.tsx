"use client"

import { Inbox } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import { ReportStateBadge, SeverityBadge } from "./ReportStateBadge"
import type { DamageReport } from "../types"

function formatAmount(value: number, currency = "IDR") {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${currency} ${value.toLocaleString()}`
  }
}

interface ReportListProps {
  items: DamageReport[]
  onSelect: (row: DamageReport) => void
  emptyAction?: React.ReactNode
}

export function ReportList({ items, onSelect, emptyAction }: ReportListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
        <div className="rounded-full bg-muted p-3">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No damage reports yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            File an incident to begin tracking through triage and resolution.
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
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead className="text-right">Filed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row) => {
            const cost = row.actualCost ?? row.costEstimate
            return (
              <TableRow
                key={row._id}
                className="cursor-pointer"
                onClick={() => onSelect(row)}
              >
                <TableCell className="min-w-0">
                  <div className="font-medium">{row.title}</div>
                  {row.location ? (
                    <div className="text-xs text-muted-foreground">{row.location}</div>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {row.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <SeverityBadge severity={row.severity} />
                </TableCell>
                <TableCell>
                  <ReportStateBadge status={row.status} />
                </TableCell>
                <TableCell className="font-medium">
                  {typeof cost === "number" ? formatAmount(cost) : "—"}
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                  {formatRelativeTime(row.createdAt)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
