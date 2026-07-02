"use client"

import { Inbox, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import { RequestStateBadge } from "./RequestStateBadge"
import type { PettyCashRequest } from "../types"

function formatAmount(value: number, currency: string) {
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

function shortId(value: string) {
  return value.length > 8 ? `${value.slice(0, 6)}…${value.slice(-2)}` : value
}

interface RequestListProps {
  items: PettyCashRequest[]
  onSelect: (row: PettyCashRequest) => void
  onDelete?: (row: PettyCashRequest) => void | Promise<void>
  emptyAction?: React.ReactNode
}

export function RequestList({ items, onSelect, onDelete, emptyAction }: RequestListProps) {
  const canDelete = (row: PettyCashRequest) =>
    row.status === "pending" || row.status === "approved" || row.status === "rejected" || row.status === "cancelled"
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
        <div className="rounded-full bg-muted p-3">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No petty cash requests yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Log a request to start routing it through the approval → disbursement flow.
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
            <TableHead>Date</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Requester</TableHead>
            {onDelete ? <TableHead className="w-12" /> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row) => (
            <TableRow
              key={row._id}
              className="cursor-pointer"
              onClick={() => onSelect(row)}
            >
              <TableCell className="text-xs text-muted-foreground">
                {formatRelativeTime(row.createdAt)}
              </TableCell>
              <TableCell className="max-w-[260px] truncate font-medium">{row.purpose}</TableCell>
              <TableCell className="font-medium">{formatAmount(row.amount, row.currency)}</TableCell>
              <TableCell>
                <RequestStateBadge status={row.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {row.category ?? "—"}
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-muted-foreground">
                {shortId(String(row.requesterId))}
              </TableCell>
              {onDelete ? (
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    disabled={!canDelete(row)}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!canDelete(row)) return
                      if (confirm(`Hapus request "${row.purpose}"?`)) {
                        void onDelete(row)
                      }
                    }}
                    aria-label={`Hapus request ${row.purpose}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
