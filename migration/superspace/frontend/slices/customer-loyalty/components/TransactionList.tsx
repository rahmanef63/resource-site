"use client"

import { Inbox } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { TransactionTypeBadge } from "./TransactionTypeBadge"
import type { LoyaltyMember, LoyaltyTransaction } from "../types"

function formatPointsSigned(value: number) {
  const abs = Math.abs(value)
  let formatted: string
  try {
    formatted = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(abs)
  } catch {
    formatted = abs.toLocaleString()
  }
  if (value > 0) return `+${formatted}`
  if (value < 0) return `−${formatted}`
  return formatted
}

function formatCurrency(value: number | undefined) {
  if (value === undefined || value === null) return "—"
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return value.toLocaleString()
  }
}

function memberSlug(member: LoyaltyMember | undefined, fallbackId: string) {
  if (!member) return fallbackId.slice(-6)
  if (member.memberNumber) return member.memberNumber
  return member.name
}

interface TransactionListProps {
  items: LoyaltyTransaction[]
  members: LoyaltyMember[]
}

export function TransactionList({ items, members }: TransactionListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
        <div className="rounded-full bg-muted p-3">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No point activity yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Earn or redeem transactions will appear in the ledger as members use the program.
          </p>
        </div>
      </div>
    )
  }

  const memberById = new Map(members.map((m) => [String(m._id), m]))

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Member</TableHead>
            <TableHead className="text-right">Points</TableHead>
            <TableHead className="text-right">Ref. amount</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row) => {
            const member = memberById.get(String(row.memberId))
            const signClass =
              row.points > 0
                ? "text-emerald-600"
                : row.points < 0
                  ? "text-red-600"
                  : "text-muted-foreground"
            return (
              <TableRow key={row._id}>
                <TableCell className="font-mono text-xs">{row.transactionDate}</TableCell>
                <TableCell>
                  <TransactionTypeBadge type={row.type} />
                </TableCell>
                <TableCell className="text-sm">
                  {memberSlug(member, String(row.memberId))}
                </TableCell>
                <TableCell
                  className={cn("text-right font-mono text-sm font-semibold", signClass)}
                >
                  {formatPointsSigned(row.points)}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatCurrency(row.referenceAmount)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {row.reference ?? "—"}
                </TableCell>
                <TableCell className="max-w-[240px] truncate text-xs text-muted-foreground">
                  {row.note ?? "—"}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
