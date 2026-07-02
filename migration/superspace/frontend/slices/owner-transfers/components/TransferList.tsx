"use client"

import { Inbox } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import { TransferStateBadge } from "./TransferStateBadge"
import type { OwnerTransfer } from "../types"
import { TRANSFER_TYPE_LABELS } from "../types"
import { formatAmount } from "../lib/format"

interface TransferListProps {
  items: OwnerTransfer[]
  onSelect: (row: OwnerTransfer) => void
  emptyAction?: React.ReactNode
}

export function TransferList({ items, onSelect, emptyAction }: TransferListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
        <div className="rounded-full bg-muted p-3">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No owner transfers yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Log a withdrawal, capital injection, or loan to start tracking.
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
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row) => (
            <TableRow
              key={row._id}
              className="cursor-pointer"
              onClick={() => onSelect(row)}
            >
              <TableCell className="font-mono text-xs">{row.transferDate}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {TRANSFER_TYPE_LABELS[row.type]}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{formatAmount(row.amount, row.currency)}</TableCell>
              <TableCell>
                <TransferStateBadge status={row.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {row.category ?? "—"}
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
