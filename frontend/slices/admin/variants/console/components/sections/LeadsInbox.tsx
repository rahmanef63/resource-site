"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { MOCK_LEADS, type Lead, type LeadStatus } from "../../lib/mock"

const STATUSES: LeadStatus[] = ["new", "open", "won", "lost"]
const TONE: Record<LeadStatus, "default" | "secondary" | "outline" | "destructive"> = {
  new: "default",
  open: "secondary",
  won: "outline",
  lost: "destructive",
}

/**
 * Leads / CRM inbox — gap section. Status pipeline + notes drawer over injected
 * leads (default: mock). `onUpdateStatus` / `onAddNote` persist; omit for demo.
 */
export function LeadsInbox({
  leads = MOCK_LEADS,
  onUpdateStatus,
  onAddNote,
}: {
  leads?: Lead[]
  onUpdateStatus?: (id: string, status: LeadStatus) => void
  onAddNote?: (id: string, note: string) => void
}) {
  const [list, setList] = React.useState<Lead[]>(leads)
  const [active, setActive] = React.useState<Lead | null>(null)
  const [note, setNote] = React.useState("")

  const setStatus = (id: string, status: LeadStatus) => {
    setList((l) => l.map((x) => (x.id === id ? { ...x, status } : x)))
    onUpdateStatus?.(id, status)
  }

  const addNote = () => {
    if (!active || !note.trim()) return
    const text = note.trim()
    setList((l) => l.map((x) => (x.id === active.id ? { ...x, notes: [...x.notes, text] } : x)))
    onAddNote?.(active.id, text)
    setActive((a) => (a ? { ...a, notes: [...a.notes, text] } : a))
    setNote("")
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>
                <div className="font-medium">{lead.name}</div>
                <div className="text-xs text-muted-foreground">{lead.email}</div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{lead.source}</Badge>
              </TableCell>
              <TableCell>
                <Select value={lead.status} onValueChange={(v) => setStatus(lead.id, v as LeadStatus)}>
                  <SelectTrigger className="h-8 w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        <Badge variant={TONE[s]} className="capitalize">
                          {s}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => setActive(lead)}>
                  Open
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{active?.name}</SheetTitle>
            <SheetDescription>{active?.email}</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 p-4">
            <p className="rounded bg-muted p-3 text-sm">{active?.message}</p>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Notes</p>
              {active?.notes.length ? (
                active.notes.map((n, i) => (
                  <p key={i} className="rounded border px-2 py-1 text-sm">
                    {n}
                  </p>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No notes yet.</p>
              )}
            </div>
            <div className="space-y-2">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" />
              <Button size="sm" onClick={addNote} disabled={!note.trim()}>
                Add note
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
