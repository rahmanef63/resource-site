"use client"

import { Inbox, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import { ClosingStateBadge } from "./ClosingStateBadge"
import type { DailyClosing } from "../types"

function formatIDR(value: number | undefined) {
  if (value === undefined || value === null) return "—"
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

function formatSignedIDR(value: number | undefined) {
  if (value === undefined || value === null) return "—"
  const sign = value > 0 ? "+" : ""
  return `${sign}${formatIDR(value)}`
}

interface ClosingListProps {
  items: DailyClosing[]
  onSelect: (row: DailyClosing) => void
  onDelete?: (row: DailyClosing) => void | Promise<void>
  emptyAction?: React.ReactNode
}

export function ClosingList({ items, onSelect, onDelete, emptyAction }: ClosingListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
        <div className="rounded-full bg-muted p-3">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No daily closings yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Open today&apos;s register to start recording sales and reconciling cash.
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
            <TableHead>Business date</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead className="text-right">Total sales</TableHead>
            <TableHead className="text-right">Difference</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Opened</TableHead>
            {onDelete ? <TableHead className="w-12" /> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row) => {
            const diff = row.difference
            const diffColor =
              diff === undefined || diff === null
                ? "text-muted-foreground"
                : diff === 0
                  ? "text-muted-foreground"
                  : diff > 0
                    ? "text-emerald-600"
                    : "text-red-600"
            return (
              <TableRow
                key={row._id}
                className="cursor-pointer"
                onClick={() => onSelect(row)}
              >
                <TableCell className="font-mono text-xs">{row.businessDate}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {row.branchId ?? "—"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatIDR(row.totalSales)}
                </TableCell>
                <TableCell className={cn("text-right font-medium", diffColor)}>
                  {formatSignedIDR(diff)}
                </TableCell>
                <TableCell>
                  <ClosingStateBadge status={row.status} />
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                  {formatRelativeTime(row.openedAt)}
                </TableCell>
                {onDelete ? (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      disabled={row.status === "approved"}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (row.status === "approved") return
                        if (confirm(`Hapus closing ${row.businessDate}?`)) {
                          void onDelete(row)
                        }
                      }}
                      aria-label={`Hapus closing ${row.businessDate}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                ) : null}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
