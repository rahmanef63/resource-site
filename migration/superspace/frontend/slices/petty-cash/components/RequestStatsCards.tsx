"use client"

import { Clock, CheckCircle2, Send, Lock, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { PettyCashSummary } from "../types"

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
  hint?: string
}

export function RequestStatsCards({ summary }: { summary: PettyCashSummary | undefined }) {
  const pending = summary?.pending ?? 0
  const disbursed = summary?.disbursed ?? 0
  const closed = summary?.closed ?? 0
  const outstanding = summary?.outstandingAmount ?? 0
  const totalClosed = summary?.totalClosedAmount ?? 0

  const tiles: Tile[] = [
    {
      label: "Pending approval",
      value: pending.toString(),
      Icon: Clock,
      accent: "text-amber-600",
      hint: pending === 1 ? "request" : "requests",
    },
    {
      label: "Outstanding",
      value: formatAmount(outstanding),
      Icon: CheckCircle2,
      accent: "text-blue-600",
      hint: "approved + disbursed",
    },
    {
      label: "Disbursed (in-flight)",
      value: disbursed.toString(),
      Icon: Send,
      accent: "text-purple-600",
      hint: disbursed === 1 ? "awaiting close" : "awaiting close",
    },
    {
      label: "Closed total",
      value: formatAmount(totalClosed),
      Icon: Lock,
      accent: "text-emerald-600",
      hint: `${closed} closed`,
    },
    {
      label: "Variance tracked",
      value: closed > 0 ? formatAmount(totalClosed) : "—",
      Icon: TrendingUp,
      accent: "text-slate-600",
      hint: closed > 0 ? "on closed requests" : "no closed requests",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
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
