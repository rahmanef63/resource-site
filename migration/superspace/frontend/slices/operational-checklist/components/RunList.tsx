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
import { RunStateBadge } from "./RunStateBadge"
import type { ChecklistRun, ChecklistTemplate } from "../types"
import { countCompletedRequired, countRequiredItems } from "../types"

interface RunListProps {
  items: ChecklistRun[]
  templates: ChecklistTemplate[]
  onSelect: (row: ChecklistRun) => void
  emptyHint?: string
}

function shortId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 4)}…${id.slice(-4)}` : id
}

export function RunList({ items, templates, onSelect, emptyHint }: RunListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
        <div className="rounded-full bg-muted p-3">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No runs</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {emptyHint ?? "Start a run from any active template to begin tracking."}
          </p>
        </div>
      </div>
    )
  }

  const templateMap = new Map(templates.map((t) => [String(t._id), t]))

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Run date</TableHead>
            <TableHead>Template</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned</TableHead>
            <TableHead className="text-right">Required done</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row) => {
            const template = templateMap.get(String(row.templateId)) ?? null
            const required = countRequiredItems(template)
            const done = countCompletedRequired(template, row)
            return (
              <TableRow
                key={row._id}
                className="cursor-pointer"
                onClick={() => onSelect(row)}
              >
                <TableCell className="font-mono text-xs">{row.runDate}</TableCell>
                <TableCell className="text-sm">
                  {template?.name ?? (
                    <span className="font-mono text-xs text-muted-foreground">
                      {shortId(String(row.templateId))}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <RunStateBadge status={row.overallStatus} />
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {row.assignedTo ? shortId(String(row.assignedTo)) : "—"}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {done} / {required}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
