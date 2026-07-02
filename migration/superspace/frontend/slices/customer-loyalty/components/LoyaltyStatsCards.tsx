"use client"

import { Coins, TrendingDown, TrendingUp, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LoyaltySummary } from "../types"

function formatNumber(value: number) {
  try {
    return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value)
  } catch {
    return value.toLocaleString()
  }
}

interface Tile {
  label: string
  value: number
  Icon: React.ComponentType<{ className?: string }>
  accent: string
  suffix?: string
}

export function LoyaltyStatsCards({ summary }: { summary: LoyaltySummary | undefined }) {
  const tiles: Tile[] = [
    {
      label: "Members",
      value: summary?.memberCount ?? 0,
      Icon: Users,
      accent: "text-indigo-600",
    },
    {
      label: "Outstanding balance",
      value: summary?.totalPointsOutstanding ?? 0,
      Icon: Coins,
      accent: "text-amber-600",
      suffix: "pts",
    },
    {
      label: "Lifetime earned",
      value: summary?.totalEarnedLifetime ?? 0,
      Icon: TrendingUp,
      accent: "text-emerald-600",
      suffix: "pts",
    },
    {
      label: "Lifetime redeemed",
      value: summary?.totalRedeemedLifetime ?? 0,
      Icon: TrendingDown,
      accent: "text-blue-600",
      suffix: "pts",
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
              <p className={cn("truncate text-sm font-semibold", t.accent)}>
                {formatNumber(t.value)}
                {t.suffix ? <span className="ml-1 text-xs font-normal text-muted-foreground">{t.suffix}</span> : null}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
