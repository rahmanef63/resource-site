"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import { cn } from "@/lib/utils"
import { PanelSection } from "@/frontend/shared/ui/layout/container/three-column"
import type { Id } from "@convex/_generated/dataModel"
import { SeverityBadge } from "./SeverityBadge"
import {
  acknowledgeAlertSchema,
  formatDirectionExpr,
  type AcknowledgeAlertInput,
  type KpiAlert,
  type KpiThreshold,
} from "../types"

interface Props {
  alert: KpiAlert | null
  threshold: KpiThreshold | null
  onClose: () => void
  onAcknowledge: (id: Id<"kpiAlerts">, input: AcknowledgeAlertInput) => Promise<void> | void
}

export function AlertDetailDrawer({ alert, threshold, onClose, onAcknowledge }: Props) {
  const [busy, setBusy] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AcknowledgeAlertInput>({
    resolver: zodResolver(acknowledgeAlertSchema),
    defaultValues: { resolutionNote: "" },
  })

  if (!alert) return null

  const onSubmit = handleSubmit(async (values) => {
    setBusy(true)
    try {
      await onAcknowledge(alert._id, values)
      reset()
    } finally {
      setBusy(false)
    }
  })

  return (
    <PanelSection>
      <PanelSection.Header className="flex items-start justify-between p-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Alert</p>
          <h2 className="truncate text-lg font-semibold">
            {threshold?.metric ?? "Unknown metric"}
          </h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {threshold?.kpiKey ?? String(alert.thresholdId)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SeverityBadge severity={alert.severity} />
          <Button aria-label="Close" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </PanelSection.Header>

      <PanelSection.Items className="p-4 text-sm">
        <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
          <dt className="text-muted-foreground">Triggered</dt>
          <dd className="col-span-2">{formatRelativeTime(alert.triggeredAt)}</dd>

          <dt className="text-muted-foreground">Actual value</dt>
          <dd className="col-span-2 font-medium">{alert.actualValue}</dd>

          {threshold ? (
            <>
              <dt className="text-muted-foreground">Expected</dt>
              <dd className="col-span-2 font-mono text-xs">
                {formatDirectionExpr(threshold.direction, threshold.value1, threshold.value2)}
              </dd>
            </>
          ) : null}

          <dt className="text-muted-foreground">Branch</dt>
          <dd className="col-span-2 truncate">{alert.branchId ?? "—"}</dd>

          <dt className="text-muted-foreground">Status</dt>
          <dd className="col-span-2">
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                alert.resolved
                  ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                  : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
              )}
            >
              {alert.resolved ? "Resolved" : "Open"}
            </Badge>
          </dd>
        </dl>

        {alert.resolved ? (
          <>
            <Separator className="my-4" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Resolution
            </p>
            <dl className="mt-2 grid grid-cols-3 gap-x-4 gap-y-3">
              {alert.resolvedAt ? (
                <>
                  <dt className="text-muted-foreground">Resolved</dt>
                  <dd className="col-span-2">{formatRelativeTime(alert.resolvedAt)}</dd>
                </>
              ) : null}
              {alert.resolvedBy ? (
                <>
                  <dt className="text-muted-foreground">Resolved by</dt>
                  <dd className="col-span-2 truncate font-mono text-xs">
                    {String(alert.resolvedBy)}
                  </dd>
                </>
              ) : null}
            </dl>
            {alert.resolutionNote ? (
              <>
                <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
                  Note
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{alert.resolutionNote}</p>
              </>
            ) : null}
          </>
        ) : null}
      </PanelSection.Items>

      {alert.resolved ? null : (
        <PanelSection.Footer className="p-3">
          <form className="space-y-2" onSubmit={onSubmit}>
            <Label htmlFor="resolutionNote" className="text-xs">
              Resolution note (optional)
            </Label>
            <Textarea
              id="resolutionNote"
              rows={2}
              placeholder="What was done to address this alert?"
              {...register("resolutionNote")}
              className={cn(errors.resolutionNote && "border-destructive")}
            />
            {errors.resolutionNote ? (
              <p className="text-xs text-destructive">{errors.resolutionNote.message}</p>
            ) : null}
            <div className="flex justify-end gap-2 pt-1">
              <Button type="submit" size="sm" disabled={busy} className="gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Acknowledge & resolve
              </Button>
            </div>
          </form>
        </PanelSection.Footer>
      )}
    </PanelSection>
  )
}
