"use client"

import { Archive, CheckCircle2, Package, Wallet, Wrench } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { AssetSummary } from "../types"

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
  value: string
  Icon: React.ComponentType<{ className?: string }>
  accent: string
}

export function AssetStatsCards({ summary }: { summary: AssetSummary | undefined }) {
  const total = summary?.total ?? 0
  const active = summary?.active ?? 0
  const maintenance = summary?.maintenance ?? 0
  const retired = summary?.retired ?? 0
  const currentValue = summary?.totalCurrentValue ?? 0

  const tiles: Tile[] = [
    {
      label: "Total assets",
      value: String(total),
      Icon: Package,
      accent: "text-blue-600",
    },
    {
      label: "Active",
      value: String(active),
      Icon: CheckCircle2,
      accent: "text-emerald-600",
    },
    {
      label: `Maintenance (+ ${retired} retired)`,
      value: String(maintenance),
      Icon: Wrench,
      accent: "text-amber-600",
    },
    {
      label: "Current value",
      value: formatAmount(currentValue),
      Icon: Wallet,
      accent: "text-slate-700 dark:text-slate-200",
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
      {/* retired hint for screen readers in case label truncates */}
      <span className="sr-only">
        <Archive className="inline h-3 w-3" /> Retired assets: {retired}
      </span>
    </div>
  )
}
