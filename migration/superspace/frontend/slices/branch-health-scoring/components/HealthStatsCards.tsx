"use client"

import { Activity, Building2, ClockIcon, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import type { BranchHealthSnapshot } from "../types"
import { getScoreTier } from "../types"

const TIER_ACCENT: Record<ReturnType<typeof getScoreTier>, string> = {
  healthy: "text-emerald-600",
  steady: "text-blue-600",
  watch: "text-amber-600",
  critical: "text-red-600",
}

interface HealthStatsCardsProps {
  latestPerBranch: BranchHealthSnapshot[]
}

/**
 * Four-tile strip summarising the latest-per-branch collection:
 *   - branches covered
 *   - average composite score
 *   - most recent capture (relative)
 *   - lowest-score branch
 */
export function HealthStatsCards({ latestPerBranch }: HealthStatsCardsProps) {
  const count = latestPerBranch.length
  const avgComposite = count
    ? latestPerBranch.reduce((sum, s) => sum + s.compositeScore, 0) / count
    : 0
  const avgTier = getScoreTier(avgComposite)

  const mostRecent = latestPerBranch.reduce<BranchHealthSnapshot | null>(
    (acc, s) => (!acc || s.capturedAt > acc.capturedAt ? s : acc),
    null,
  )

  const lowest = latestPerBranch.reduce<BranchHealthSnapshot | null>(
    (acc, s) => (!acc || s.compositeScore < acc.compositeScore ? s : acc),
    null,
  )
  const lowestTier = lowest ? getScoreTier(lowest.compositeScore) : "healthy"

  const tiles = [
    {
      label: "Branches covered",
      value: String(count),
      Icon: Building2,
      accent: "text-foreground",
    },
    {
      label: "Avg composite",
      value: count ? avgComposite.toFixed(1) : "—",
      Icon: Activity,
      accent: count ? TIER_ACCENT[avgTier] : "text-muted-foreground",
    },
    {
      label: "Latest capture",
      value: mostRecent ? formatRelativeTime(mostRecent.capturedAt) : "—",
      Icon: ClockIcon,
      accent: "text-foreground",
    },
    {
      label: "Lowest branch",
      value: lowest ? `${lowest.branchId} · ${lowest.compositeScore.toFixed(1)}` : "—",
      Icon: TrendingDown,
      accent: lowest ? TIER_ACCENT[lowestTier] : "text-muted-foreground",
    },
  ] as const

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
