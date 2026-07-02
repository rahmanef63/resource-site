"use client"

import { useState } from "react"
import { Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import { PanelSection } from "@/frontend/shared/ui/layout/container/three-column"
import type { Id } from "@convex/_generated/dataModel"
import { ForecastStateBadge } from "./ForecastStateBadge"
import { LineItemBuckets } from "./LineItemBuckets"
import {
  BUCKETS,
  GENERATION_SOURCE_LABELS,
  type AddLineItemInput,
  type Forecast,
} from "../types"

function formatIDR(value: number) {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `IDR ${value.toLocaleString()}`
  }
}

interface Props {
  forecast: Forecast | null
  isLoading?: boolean
  onClose: () => void
  onAddLineItem: (
    forecastId: Id<"cashFlowForecasts">,
    input: AddLineItemInput,
  ) => Promise<unknown>
  onPublish: (forecastId: Id<"cashFlowForecasts">) => Promise<void> | void
}

export function ForecastDetailDrawer({
  forecast,
  isLoading,
  onClose,
  onAddLineItem,
  onPublish,
}: Props) {
  const [publishBusy, setPublishBusy] = useState(false)

  if (isLoading && !forecast) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
        Loading forecast…
      </div>
    )
  }

  if (!forecast) return null

  const editable = forecast.status === "draft"
  const closingClass =
    forecast.projectedClosing >= 0 ? "text-emerald-600" : "text-red-600"

  const runPublish = async () => {
    setPublishBusy(true)
    try {
      await onPublish(forecast._id)
    } finally {
      setPublishBusy(false)
    }
  }

  return (
    <PanelSection>
      <PanelSection.Header className="flex items-start justify-between p-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Cash-flow forecast
          </p>
          <h2 className="text-lg font-semibold">
            {forecast.startDate} — {forecast.endDate}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {forecast.horizonDays}-day horizon ·{" "}
            {GENERATION_SOURCE_LABELS[forecast.generationSource]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ForecastStateBadge status={forecast.status} />
          <Button aria-label="Close" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </PanelSection.Header>

      <PanelSection.Items className="p-4 text-sm">
        <div className="grid grid-cols-2 gap-3 rounded-md border bg-muted/30 p-3 md:grid-cols-4">
          <Stat label="Base cash" value={formatIDR(forecast.baseCash)} />
          <Stat
            label="Inflow"
            value={formatIDR(forecast.projectedInflow)}
            valueClass="text-emerald-600"
          />
          <Stat
            label="Outflow"
            value={formatIDR(forecast.projectedOutflow)}
            valueClass="text-red-600"
          />
          <Stat
            label="Closing"
            value={formatIDR(forecast.projectedClosing)}
            valueClass={closingClass}
          />
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-x-4 gap-y-2 text-xs">
          <dt className="text-muted-foreground">Branch</dt>
          <dd className="col-span-2 truncate">{forecast.branchId ?? "—"}</dd>

          <dt className="text-muted-foreground">Confidence</dt>
          <dd className="col-span-2">
            {forecast.confidence !== undefined ? `${forecast.confidence}%` : "—"}
          </dd>

          <dt className="text-muted-foreground">Created</dt>
          <dd className="col-span-2">{formatRelativeTime(forecast.createdAt)}</dd>

          {forecast.publishedAt ? (
            <>
              <dt className="text-muted-foreground">Published</dt>
              <dd className="col-span-2">{formatRelativeTime(forecast.publishedAt)}</dd>
            </>
          ) : null}
        </dl>

        {forecast.aiNotes ? (
          <>
            <Separator className="my-4" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              AI notes
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{forecast.aiNotes}</p>
          </>
        ) : null}

        <Separator className="my-4" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Line items
            </p>
            <p className="text-xs text-muted-foreground">
              {forecast.items.length} total
            </p>
          </div>
          {BUCKETS.map((bucket) => (
            <LineItemBuckets
              key={bucket}
              bucket={bucket}
              items={forecast.items}
              editable={editable}
              onAdd={(input) => onAddLineItem(forecast._id, input)}
            />
          ))}
        </div>
      </PanelSection.Items>

      {forecast.status === "draft" ? (
        <PanelSection.Footer className="p-3">
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              disabled={publishBusy}
              onClick={runPublish}
              className={cn("gap-1.5")}
            >
              <Send className="h-3.5 w-3.5" />
              {publishBusy ? "Publishing…" : "Publish"}
            </Button>
          </div>
        </PanelSection.Footer>
      ) : null}
    </PanelSection>
  )
}

function Stat({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={cn("text-sm font-semibold", valueClass)}>{value}</p>
    </div>
  )
}
