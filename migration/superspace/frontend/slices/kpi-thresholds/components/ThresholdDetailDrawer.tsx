"use client"

import { useState } from "react"
import { Power, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import { PanelSection } from "@/frontend/shared/ui/layout/container/three-column"
import type { Id } from "@convex/_generated/dataModel"
import { SeverityBadge } from "./SeverityBadge"
import type { KpiThreshold } from "../types"
import { ACTION_POLICY_LABELS, DIRECTION_LABELS, formatDirectionExpr } from "../types"

interface Props {
  threshold: KpiThreshold | null
  onClose: () => void
  onToggle: (id: Id<"kpiThresholds">, isActive: boolean) => Promise<void> | void
}

export function ThresholdDetailDrawer({ threshold, onClose, onToggle }: Props) {
  const [busy, setBusy] = useState(false)

  if (!threshold) return null

  const runToggle = async () => {
    setBusy(true)
    try {
      await onToggle(threshold._id, !threshold.isActive)
    } finally {
      setBusy(false)
    }
  }

  return (
    <PanelSection>
      <PanelSection.Header className="flex items-start justify-between p-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">KPI threshold</p>
          <h2 className="truncate text-lg font-semibold">{threshold.metric}</h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{threshold.kpiKey}</p>
        </div>
        <div className="flex items-center gap-2">
          <SeverityBadge severity={threshold.severity} />
          <Button aria-label="Close" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </PanelSection.Header>

      <PanelSection.Items className="p-4 text-sm">
        <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
          <dt className="text-muted-foreground">Direction</dt>
          <dd className="col-span-2">{DIRECTION_LABELS[threshold.direction]}</dd>

          <dt className="text-muted-foreground">Condition</dt>
          <dd className="col-span-2 font-mono text-xs">
            {formatDirectionExpr(threshold.direction, threshold.value1, threshold.value2)}
          </dd>

          <dt className="text-muted-foreground">Branch</dt>
          <dd className="col-span-2 truncate">{threshold.branchId ?? "—"}</dd>

          <dt className="text-muted-foreground">Status</dt>
          <dd className="col-span-2">
            <Badge
              variant="outline"
              className={
                threshold.isActive
                  ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }
            >
              {threshold.isActive ? "Active" : "Paused"}
            </Badge>
          </dd>

          <dt className="text-muted-foreground">Created</dt>
          <dd className="col-span-2">{formatRelativeTime(threshold.createdAt)}</dd>

          <dt className="text-muted-foreground">Updated</dt>
          <dd className="col-span-2">{formatRelativeTime(threshold.updatedAt)}</dd>
        </dl>

        <Separator className="my-4" />
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Action policy</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {threshold.actionPolicy.length === 0 ? (
            <span className="text-xs text-muted-foreground">— None</span>
          ) : (
            threshold.actionPolicy.map((p) => (
              <Badge key={p} variant="secondary" className="text-xs">
                {ACTION_POLICY_LABELS[p]}
              </Badge>
            ))
          )}
        </div>

        <Separator className="my-4" />
        <p className="text-[11px] text-muted-foreground">
          Deleting thresholds is out of scope for this release — pause instead. Deletion
          support is tracked as a follow-up.
        </p>
      </PanelSection.Items>

      <PanelSection.Footer className="p-3">
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant={threshold.isActive ? "outline" : "default"}
            disabled={busy}
            onClick={runToggle}
            className="gap-1.5"
          >
            <Power className="h-3.5 w-3.5" />
            {threshold.isActive ? "Pause threshold" : "Activate threshold"}
          </Button>
        </div>
      </PanelSection.Footer>
    </PanelSection>
  )
}
