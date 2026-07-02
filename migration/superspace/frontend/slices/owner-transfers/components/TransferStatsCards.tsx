"use client"

import { ArrowDownCircle, ArrowUpCircle, Coins, Scale } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { OwnerTransferSummary } from "../types"
import { formatAmount } from "../lib/format"

interface Tile {
  label: string
  value: number
  Icon: React.ComponentType<{ className?: string }>
  accent: string
  signed?: boolean
}

export function TransferStatsCards({ summary }: { summary: OwnerTransferSummary | undefined }) {
  const net = summary?.netOwnerPosition ?? 0
  const tiles: Tile[] = [
    {
      label: "Withdrawals",
      value: summary?.totalWithdraw ?? 0,
      Icon: ArrowUpCircle,
      accent: "text-red-600",
    },
    {
      label: "Injections",
      value: summary?.totalInject ?? 0,
      Icon: ArrowDownCircle,
      accent: "text-emerald-600",
    },
    {
      label: "Loans outstanding",
      value: (summary?.totalLoan ?? 0) - (summary?.totalRepayment ?? 0),
      Icon: Coins,
      accent: "text-amber-600",
    },
    {
      label: "Net owner position",
      value: net,
      Icon: Scale,
      accent: net >= 0 ? "text-emerald-600" : "text-red-600",
      signed: true,
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
                {t.signed && t.value > 0 ? "+" : ""}
                {formatAmount(t.value)}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
