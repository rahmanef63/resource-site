"use client"

import { CheckCircle2, ClipboardCheck, FileCheck, ListChecks } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface ChecklistStats {
  templates: number
  activeRuns: number
  inReview: number
  approvedToday: number
}

interface Tile {
  label: string
  value: string
  Icon: React.ComponentType<{ className?: string }>
  accent: string
  hint?: string
}

export function ChecklistStatsCards({ stats }: { stats: ChecklistStats }) {
  const tiles: Tile[] = [
    {
      label: "Templates",
      value: stats.templates.toString(),
      Icon: ListChecks,
      accent: "text-blue-600",
      hint: stats.templates === 1 ? "defined" : "defined",
    },
    {
      label: "Active runs",
      value: stats.activeRuns.toString(),
      Icon: ClipboardCheck,
      accent: stats.activeRuns > 0 ? "text-violet-600" : "text-muted-foreground",
      hint: stats.activeRuns === 0 ? "none in flight" : "in flight",
    },
    {
      label: "In review",
      value: stats.inReview.toString(),
      Icon: FileCheck,
      accent: stats.inReview > 0 ? "text-amber-600" : "text-muted-foreground",
      hint: stats.inReview > 0 ? "awaiting sign-off" : "none pending",
    },
    {
      label: "Approved today",
      value: stats.approvedToday.toString(),
      Icon: CheckCircle2,
      accent: "text-emerald-600",
      hint: "signed off",
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
                {t.value}
              </p>
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
