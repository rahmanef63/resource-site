"use client"

import { AlertOctagon, Bell, CheckCircle2, Gauge } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { KpiSummary } from "../types"

interface Tile {
  label: string
  value: string
  Icon: React.ComponentType<{ className?: string }>
  accent: string
  hint?: string
}

export function KpiStatsCards({ summary }: { summary: KpiSummary | undefined }) {
  const activeThresholds = summary?.activeThresholds ?? 0
  const openAlerts = summary?.openAlerts ?? 0
  const criticalAlerts = summary?.criticalAlerts ?? 0
  const totalAlerts = summary?.totalAlerts ?? 0

  const tiles: Tile[] = [
    {
      label: "Active thresholds",
      value: activeThresholds.toString(),
      Icon: Gauge,
      accent: "text-blue-600",
      hint: activeThresholds === 1 ? "being monitored" : "being monitored",
    },
    {
      label: "Open alerts",
      value: openAlerts.toString(),
      Icon: Bell,
      accent: openAlerts > 0 ? "text-amber-600" : "text-muted-foreground",
      hint: openAlerts === 0 ? "all clear" : "need triage",
    },
    {
      label: "Critical",
      value: criticalAlerts.toString(),
      Icon: AlertOctagon,
      accent: criticalAlerts > 0 ? "text-red-600" : "text-muted-foreground",
      hint: criticalAlerts > 0 ? "action required" : "none open",
    },
    {
      label: "Total alerts",
      value: totalAlerts.toString(),
      Icon: CheckCircle2,
      accent: "text-slate-600",
      hint: "lifetime",
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
