"use client"

import { Inbox } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import { ScoreBadge } from "./ScoreBadge"
import type { BranchHealthSnapshot, ScoreCategory } from "../types"
import { SCORE_CATEGORIES, SCORE_CATEGORY_LABELS, getScoreTier } from "../types"

const BAR_TIER_CLASS: Record<ReturnType<typeof getScoreTier>, string> = {
  healthy: "bg-emerald-500",
  steady: "bg-blue-500",
  watch: "bg-amber-500",
  critical: "bg-red-500",
}

function MiniBar({ value }: { value: number }) {
  const tier = getScoreTier(value)
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative h-1.5 w-10 overflow-hidden rounded bg-muted">
        <div
          className={cn("absolute inset-y-0 left-0", BAR_TIER_CLASS[tier])}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
      <span className="font-mono text-[11px] tabular-nums">{value.toFixed(0)}</span>
    </div>
  )
}

function getScoreValue(snapshot: BranchHealthSnapshot, cat: ScoreCategory): number {
  switch (cat) {
    case "revenue":
      return snapshot.revenueScore
    case "expense":
      return snapshot.expenseScore
    case "ops":
      return snapshot.opsScore
    case "staff":
      return snapshot.staffScore
    case "customer":
      return snapshot.customerScore
  }
}

interface SnapshotListProps {
  items: BranchHealthSnapshot[]
  onSelect: (row: BranchHealthSnapshot) => void
  emptyAction?: React.ReactNode
}

export function SnapshotList({ items, onSelect, emptyAction }: SnapshotListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
        <div className="rounded-full bg-muted p-3">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No snapshots yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Capture the first branch health snapshot to start tracking composite scores over time.
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
            <TableHead>Period</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Composite</TableHead>
            {SCORE_CATEGORIES.map((cat) => (
              <TableHead key={cat} className="text-xs">
                {SCORE_CATEGORY_LABELS[cat]}
              </TableHead>
            ))}
            <TableHead className="text-right">Captured</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row) => (
            <TableRow
              key={row._id}
              className="cursor-pointer"
              onClick={() => onSelect(row)}
            >
              <TableCell className="font-mono text-xs">
                {new Date(row.capturedAt).toISOString().slice(0, 10)}
              </TableCell>
              <TableCell className="font-mono text-xs">{row.period}</TableCell>
              <TableCell className="truncate text-sm">{row.branchId}</TableCell>
              <TableCell>
                <ScoreBadge score={row.compositeScore} />
              </TableCell>
              {SCORE_CATEGORIES.map((cat) => (
                <TableCell key={cat}>
                  <MiniBar value={getScoreValue(row, cat)} />
                </TableCell>
              ))}
              <TableCell className="text-right text-xs text-muted-foreground">
                {formatRelativeTime(row.capturedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
