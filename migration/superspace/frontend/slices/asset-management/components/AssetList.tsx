"use client"

import { Inbox } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AssetStateBadge } from "./AssetStateBadge"
import type { ManagedAsset } from "../types"

function formatAmount(value: number | undefined, currency = "IDR") {
  if (value === undefined || value === null) return "—"
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

function shortId(value: string | undefined) {
  if (!value) return "—"
  return value.length > 10 ? `${value.slice(0, 6)}…${value.slice(-2)}` : value
}

interface AssetListProps {
  items: ManagedAsset[]
  onSelect: (row: ManagedAsset) => void
  emptyAction?: React.ReactNode
}

export function AssetList({ items, onSelect, emptyAction }: AssetListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
        <div className="rounded-full bg-muted p-3">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No assets registered yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Register a fixed asset to start tracking location, assignment, and depreciation.
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
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead className="text-right">Current value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row) => (
            <TableRow
              key={row._id}
              className="cursor-pointer"
              onClick={() => onSelect(row)}
            >
              <TableCell className="max-w-[260px] truncate font-medium">{row.name}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {row.category}
                </Badge>
              </TableCell>
              <TableCell>
                <AssetStateBadge status={row.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {row.location ?? "—"}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {shortId(row.assignedTo ? String(row.assignedTo) : undefined)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatAmount(row.currentValue)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
