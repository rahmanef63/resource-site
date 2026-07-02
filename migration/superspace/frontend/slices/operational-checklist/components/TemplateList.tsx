"use client"

import { Inbox } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import { cn } from "@/lib/utils"
import type { ChecklistTemplate } from "../types"
import { SCOPE_LABELS } from "../types"

interface TemplateListProps {
  items: ChecklistTemplate[]
  onSelect: (row: ChecklistTemplate) => void
  emptyAction?: React.ReactNode
}

export function TemplateList({ items, onSelect, emptyAction }: TemplateListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
        <div className="rounded-full bg-muted p-3">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No templates defined yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Define a template to capture the items that must be checked during a run.
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
            <TableHead>Scope</TableHead>
            <TableHead className="text-right">Items</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Branch</TableHead>
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
              <TableCell className="text-sm font-medium">{row.name}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {SCOPE_LABELS[row.scope]}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {row.items.length}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    row.isActive
                      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
                  )}
                >
                  {row.isActive ? "Active" : "Paused"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {row.branchId ?? "—"}
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
