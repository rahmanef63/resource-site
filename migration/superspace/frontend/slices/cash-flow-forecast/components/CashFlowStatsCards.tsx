"use client"

import { FileText, ListChecks, Scale, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ForecastSummary } from "../types"

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

interface Tile {
  label: string
  value: string
  Icon: React.ComponentType<{ className?: string }>
  accent: string
}

interface Props {
  latestPublished: ForecastSummary | null
  forecasts: ForecastSummary[]
  totalDraftLineItems: number
}

export function CashFlowStatsCards({
  latestPublished,
  forecasts,
  totalDraftLineItems,
}: Props) {
  const netClosing = latestPublished?.projectedClosing ?? 0
  const draftCount = forecasts.filter((f) => f.status === "draft").length
  const publishedCount = forecasts.filter((f) => f.status === "published").length

  const tiles: Tile[] = [
    {
      label: "Latest published net closing",
      value: latestPublished ? formatIDR(netClosing) : "—",
      Icon: TrendingUp,
      accent: netClosing >= 0 ? "text-emerald-600" : "text-red-600",
    },
    {
      label: "Drafts",
      value: draftCount.toString(),
      Icon: FileText,
      accent: "text-amber-600",
    },
    {
      label: "Published",
      value: publishedCount.toString(),
      Icon: Scale,
      accent: "text-emerald-600",
    },
    {
      label: "Draft line items",
      value: totalDraftLineItems.toString(),
      Icon: ListChecks,
      accent: "text-blue-600",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {tiles.map((t) => (
        <Card key={t.label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={cn("rounded-md bg-muted p-2", t.accent)}>
              <t.Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">{t.label}</p>
              <p className={cn("truncate text-sm font-semibold", t.accent)}>{t.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
