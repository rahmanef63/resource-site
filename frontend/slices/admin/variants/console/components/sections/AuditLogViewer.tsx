"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MOCK_AUDIT, type AuditEntry } from "../../lib/mock"

/**
 * Audit Log — gap section. Filterable table over injected audit rows (default:
 * mock) with a before/after diff drawer. The audit-log slice records; this is
 * the viewer nothing else shipped.
 */
export function AuditLogViewer({ entries = MOCK_AUDIT }: { entries?: AuditEntry[] }) {
  const [q, setQ] = React.useState("")
  const [active, setActive] = React.useState<AuditEntry | null>(null)

  const rows = React.useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return entries
    return entries.filter((e) =>
      [e.actor, e.action, e.target].join(" ").toLowerCase().includes(needle),
    )
  }, [entries, q])

  return (
    <div className="space-y-3">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter by actor, action or target…"
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {new Date(e.at).toLocaleString()}
                </TableCell>
                <TableCell className="text-sm">{e.actor}</TableCell>
                <TableCell>
                  <Badge variant="outline">{e.action}</Badge>
                </TableCell>
                <TableCell className="text-sm">{e.target}</TableCell>
                <TableCell>
                  {(e.before !== undefined || e.after !== undefined) && (
                    <Button variant="ghost" size="sm" onClick={() => setActive(e)}>
                      Diff
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No matching events.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{active?.action}</SheetTitle>
            <SheetDescription>
              {active?.actor} → {active?.target}
            </SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-3 p-4 text-sm">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Before</p>
              <pre className="rounded bg-muted p-2 text-xs">{active?.before ?? "—"}</pre>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">After</p>
              <pre className="rounded bg-muted p-2 text-xs">{active?.after ?? "—"}</pre>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
