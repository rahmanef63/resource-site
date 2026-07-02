"use client"

import { Calendar, DoorOpen, DollarSign, Scale } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { DailyClosingSummary } from "../types"

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
  hint?: string
}

export function ClosingStatsCards({
  summary,
}: {
  summary: DailyClosingSummary | undefined
}) {
  const last30 = summary?.last30Days ?? 0
  const openCount = summary?.openCount ?? 0
  const totalSales = summary?.totalSales ?? 0
  const totalVariance = summary?.totalVariance ?? 0

  const varianceColor =
    totalVariance === 0
      ? "text-muted-foreground"
      : totalVariance > 0
        ? "text-emerald-600"
        : "text-red-600"

  const tiles: Tile[] = [
    {
      label: "Last 30 days",
      value: last30.toString(),
      Icon: Calendar,
      accent: "text-slate-600",
      hint: last30 === 1 ? "closing" : "closings",
    },
    {
      label: "Open / recorded",
      value: openCount.toString(),
      Icon: DoorOpen,
      accent: "text-amber-600",
      hint: openCount === 1 ? "awaiting close" : "awaiting close",
    },
    {
      label: "Total sales (30d)",
      value: formatIDR(totalSales),
      Icon: DollarSign,
      accent: "text-blue-600",
      hint: "all payment methods",
    },
    {
      label: "Total variance (30d)",
      value: formatIDR(totalVariance),
      Icon: Scale,
      accent: varianceColor,
      hint: totalVariance >= 0 ? "cash overage" : "cash shortage",
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
              {t.hint ? (
                <p className="truncate text-[10px] text-muted-foreground">{t.hint}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
