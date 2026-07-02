"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getScoreTier, SCORE_TIER_LABELS, type ScoreTier } from "../types"

const TIER_CLASSES: Record<ScoreTier, string> = {
  healthy: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  steady: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  watch: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  critical: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
}

interface ScoreBadgeProps {
  score: number
  className?: string
  showLabel?: boolean
}

/**
 * Pill badge that colours itself by composite-score tier:
 *  >= 80 emerald (Healthy) · >= 60 blue (Steady) ·
 *  >= 40 amber (Watch) · < 40 red (Critical).
 */
export function ScoreBadge({ score, className, showLabel = true }: ScoreBadgeProps) {
  const tier = getScoreTier(score)
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", TIER_CLASSES[tier], className)}>
      {score.toFixed(1)}
      {showLabel ? ` · ${SCORE_TIER_LABELS[tier]}` : ""}
    </Badge>
  )
}
