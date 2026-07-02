"use client"

import { CalendarClock, Coins, ListChecks, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { MaintenanceSummary } from "../types"
import { formatCurrency } from "../lib/format"

interface Tile {
  label: string
  value: string
  Icon: React.ComponentType<{ className?: string }>
  accent: string
}

export function TaskStatsCards({ summary }: { summary: MaintenanceSummary | undefined }) {
  const tiles: Tile[] = [
    {
      label: "Total tasks",
      value: (summary?.total ?? 0).toString(),
      Icon: ListChecks,
      accent: "text-blue-600",
    },
    {
      label: "Scheduled",
      value: (summary?.scheduled ?? 0).toString(),
      Icon: CalendarClock,
      accent: "text-sky-600",
    },
    {
      label: "Overdue",
      value: (summary?.overdue ?? 0).toString(),
      Icon: AlertTriangle,
      accent: "text-red-600",
    },
    {
      label: "Total cost",
      value: formatCurrency(summary?.totalCost ?? 0),
      Icon: Coins,
      accent: "text-emerald-600",
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
