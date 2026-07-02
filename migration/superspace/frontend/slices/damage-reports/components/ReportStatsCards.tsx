"use client"

import { AlertTriangle, FileWarning, Flame, Wallet } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { DamageReportSummary } from "../types"

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

interface Tile {
  label: string
  display: string
  Icon: React.ComponentType<{ className?: string }>
  accent: string
}

export function ReportStatsCards({ summary }: { summary: DamageReportSummary | undefined }) {
  const open = summary?.open ?? 0
  const critical = summary?.critical ?? 0
  const totalCost = summary?.totalCost ?? 0
  const total = summary?.total ?? 0

  const tiles: Tile[] = [
    {
      label: "Open",
      display: String(open),
      Icon: FileWarning,
      accent: "text-amber-600",
    },
    {
      label: "Critical",
      display: String(critical),
      Icon: Flame,
      accent: critical > 0 ? "text-red-600" : "text-muted-foreground",
    },
    {
      label: "Total cost",
      display: formatAmount(totalCost),
      Icon: Wallet,
      accent: "text-emerald-600",
    },
    {
      label: "Reports",
      display: String(total),
      Icon: AlertTriangle,
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
              <p className={cn("truncate text-sm font-semibold", t.accent)}>{t.display}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
