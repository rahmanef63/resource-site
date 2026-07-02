"use client"

import { Inbox } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import type { LoyaltyMember } from "../types"

function formatPoints(value: number) {
  try {
    return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value)
  } catch {
    return value.toLocaleString()
  }
}

interface MemberListProps {
  items: LoyaltyMember[]
  onSelect: (row: LoyaltyMember) => void
  emptyAction?: React.ReactNode
}

export function MemberList({ items, onSelect, emptyAction }: MemberListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
        <div className="rounded-full bg-muted p-3">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No members enrolled yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Enroll your first customer to start tracking points and tier progress.
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
            <TableHead>Member #</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead className="text-right">Last activity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row) => (
            <TableRow
              key={row._id}
              className="cursor-pointer"
              onClick={() => onSelect(row)}
            >
              <TableCell className="font-mono text-xs">{row.memberNumber}</TableCell>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {row.email ?? "—"}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs capitalize">
                  {row.tier}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {formatPoints(row.pointsBalance)} <span className="text-xs text-muted-foreground">pts</span>
              </TableCell>
              <TableCell className="text-right text-xs text-muted-foreground">
                {row.lastActivityAt ? formatRelativeTime(row.lastActivityAt) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
