"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import { PanelSection } from "@/frontend/shared/ui/layout/container/three-column"
import type { Id } from "@convex/_generated/dataModel"
import { ReportStateBadge, SeverityBadge } from "./ReportStateBadge"
import { availableActions } from "../hooks/useDamageReports"
import type { DamageReport, Resolution } from "../types"
import { RESOLUTIONS, RESOLUTION_LABELS } from "../types"

function formatAmount(value: number, currency = "IDR") {
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

interface Props {
  report: DamageReport | null
  onClose: () => void
  onTriage: (id: Id<"damageReports">, assignedTo: Id<"users">) => Promise<void> | void
  onResolve: (
    id: Id<"damageReports">,
    input: {
      resolution: Resolution
      actualCost?: number
      insuranceClaimRef?: string
      notes?: string
    },
  ) => Promise<void> | void
}

export function ReportDetailDrawer({ report, onClose, onTriage, onResolve }: Props) {
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<"idle" | "triage" | "resolve">("idle")
  const [assigneeId, setAssigneeId] = useState("")
  const [resolution, setResolution] = useState<Resolution>("repaired")
  const [actualCost, setActualCost] = useState<string>("")
  const [insuranceRef, setInsuranceRef] = useState("")
  const [resolveNotes, setResolveNotes] = useState("")

  if (!report) return null

  const actions = availableActions(report.status)

  const doTriage = async () => {
    if (!assigneeId.trim()) return
    setBusy(true)
    try {
      await onTriage(report._id, assigneeId.trim() as Id<"users">)
      setMode("idle")
      setAssigneeId("")
    } finally {
      setBusy(false)
    }
  }

  const doResolve = async () => {
    setBusy(true)
    try {
      const cost = actualCost ? Number(actualCost) : undefined
      await onResolve(report._id, {
        resolution,
        actualCost: Number.isFinite(cost as number) ? (cost as number) : undefined,
        insuranceClaimRef: insuranceRef.trim() || undefined,
        notes: resolveNotes.trim() || undefined,
      })
      setMode("idle")
      setActualCost("")
      setInsuranceRef("")
      setResolveNotes("")
    } finally {
      setBusy(false)
    }
  }

  const cost = report.actualCost ?? report.costEstimate

  return (
    <PanelSection>
      <PanelSection.Header className="flex items-start justify-between p-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Damage report</p>
          <h2 className="text-lg font-semibold">{report.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {report.category}
            {report.location ? ` · ${report.location}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SeverityBadge severity={report.severity} />
          <ReportStateBadge status={report.status} />
          <Button aria-label="Close" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </PanelSection.Header>

      <PanelSection.Items className="p-4 text-sm">
        <p className="whitespace-pre-wrap">{report.description}</p>

        <Separator className="my-4" />

        <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
          <dt className="text-muted-foreground">Branch</dt>
          <dd className="col-span-2 truncate">{report.branchId ?? "—"}</dd>

          <dt className="text-muted-foreground">Related</dt>
          <dd className="col-span-2 truncate">
            {report.relatedEntityType
              ? `${report.relatedEntityType}${report.relatedEntityId ? ` · ${report.relatedEntityId}` : ""}`
              : "—"}
          </dd>

          <dt className="text-muted-foreground">Assigned to</dt>
          <dd className="col-span-2 truncate">{report.assignedTo ?? "—"}</dd>

          <dt className="text-muted-foreground">Cost</dt>
          <dd className="col-span-2">{typeof cost === "number" ? formatAmount(cost) : "—"}</dd>

          {report.insuranceClaimRef ? (
            <>
              <dt className="text-muted-foreground">Insurance ref</dt>
              <dd className="col-span-2 truncate">{report.insuranceClaimRef}</dd>
            </>
          ) : null}

          {report.resolution ? (
            <>
              <dt className="text-muted-foreground">Resolution</dt>
              <dd className="col-span-2">{RESOLUTION_LABELS[report.resolution]}</dd>
            </>
          ) : null}

          <dt className="text-muted-foreground">Filed</dt>
          <dd className="col-span-2">{formatRelativeTime(report.createdAt)}</dd>

          {report.resolvedAt ? (
            <>
              <dt className="text-muted-foreground">Resolved</dt>
              <dd className="col-span-2">{formatRelativeTime(report.resolvedAt)}</dd>
            </>
          ) : null}
        </dl>

        {report.photos && report.photos.length > 0 ? (
          <>
            <Separator className="my-4" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Photos</p>
            <ul className="mt-1 space-y-1 text-xs">
              {report.photos.map((url) => (
                <li key={url} className="truncate">
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {report.notes ? (
          <>
            <Separator className="my-4" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{report.notes}</p>
          </>
        ) : null}
      </PanelSection.Items>

      {mode === "triage" ? (
        <PanelSection.Footer className="space-y-2 p-3">
          <Label htmlFor="assigneeId" className="text-xs">
            Assign to (user ID)
          </Label>
          <Input
            id="assigneeId"
            placeholder="users/..."
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMode("idle")
                setAssigneeId("")
              }}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={doTriage} disabled={busy || !assigneeId.trim()}>
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Confirm triage
            </Button>
          </div>
        </PanelSection.Footer>
      ) : mode === "resolve" ? (
        <PanelSection.Footer className="space-y-2 p-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1">
              <Label htmlFor="resolution" className="text-xs">
                Resolution
              </Label>
              <Select value={resolution} onValueChange={(v) => setResolution(v as Resolution)}>
                <SelectTrigger id="resolution" className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOLUTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {RESOLUTION_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="actualCost" className="text-xs">
                Actual cost (IDR)
              </Label>
              <Input
                id="actualCost"
                type="number"
                step="1"
                min={0}
                className="h-8"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="insuranceRef" className="text-xs">
              Insurance claim ref (optional)
            </Label>
            <Input
              id="insuranceRef"
              className="h-8"
              value={insuranceRef}
              onChange={(e) => setInsuranceRef(e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="resolveNotes" className="text-xs">
              Resolution notes (optional)
            </Label>
            <Textarea
              id="resolveNotes"
              rows={2}
              value={resolveNotes}
              onChange={(e) => setResolveNotes(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode("idle")}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={doResolve} disabled={busy}>
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Confirm resolve
            </Button>
          </div>
        </PanelSection.Footer>
      ) : actions.length > 0 ? (
        <PanelSection.Footer className="p-3">
          <div className="flex items-center justify-end gap-2">
            {actions.map((a) => (
              <Button
                key={a.id}
                size="sm"
                disabled={busy}
                onClick={() => setMode(a.id)}
                className="gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                {a.label}
              </Button>
            ))}
          </div>
        </PanelSection.Footer>
      ) : null}
    </PanelSection>
  )
}
