"use client"

import { Inbox, AlertTriangle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { TaskStateBadge } from "./TaskStateBadge"
import { isOverdue } from "../hooks/useMaintenance"
import type { MaintenanceTask } from "../types"
import { TASK_TYPE_LABELS, FREQUENCY_LABELS } from "../types"
import { formatCurrency, formatDate } from "../lib/format"

function dueHint(nextDueAt: number): { text: string; overdue: boolean } {
  const diff = nextDueAt - Date.now()
  const day = 86_400_000
  if (diff < 0) {
    const days = Math.ceil(-diff / day)
    return { text: `${days}d overdue`, overdue: true }
  }
  const days = Math.ceil(diff / day)
  if (days === 0) return { text: "Today", overdue: false }
  return { text: `in ${days}d`, overdue: false }
}

interface TaskListProps {
  items: MaintenanceTask[]
  onSelect: (row: MaintenanceTask) => void
  emptyAction?: React.ReactNode
}

export function TaskList({ items, onSelect, emptyAction }: TaskListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
        <div className="rounded-full bg-muted p-3">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No maintenance tasks</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Schedule preventive inspections or reactive fixes to start tracking.
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
            <TableHead>Next due</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Assigned</TableHead>
            <TableHead className="text-right">Est. cost</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row) => {
            const hint = dueHint(row.nextDueAt)
            const overdue = isOverdue(row) || hint.overdue
            return (
              <TableRow
                key={row._id}
                className="cursor-pointer"
                onClick={() => onSelect(row)}
              >
                <TableCell className="font-mono text-xs">
                  <div className="flex flex-col">
                    <span>{formatDate(row.nextDueAt)}</span>
                    <span
                      className={cn(
                        "flex items-center gap-1 text-[11px]",
                        overdue ? "text-red-600" : "text-muted-foreground",
                      )}
                    >
                      {overdue ? <AlertTriangle className="h-3 w-3" /> : null}
                      {hint.text}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{row.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {TASK_TYPE_LABELS[row.type]}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {FREQUENCY_LABELS[row.frequency]}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {row.assignedTo ? row.assignedTo.slice(0, 10) + "…" : "—"}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {row.estimatedCost != null ? formatCurrency(row.estimatedCost) : "—"}
                </TableCell>
                <TableCell>
                  <TaskStateBadge status={overdue && row.status === "scheduled" ? "overdue" : row.status} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
