"use client"

import { CalendarX, Gauge, TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LoyaltyTransaction, TransactionType } from "../types"
import { TRANSACTION_TYPE_LABELS } from "../types"

const ICONS: Record<TransactionType, React.ComponentType<{ className?: string }>> = {
  earn: TrendingUp,
  redeem: TrendingDown,
  adjust: Gauge,
  expire: CalendarX,
}

const ACCENTS: Record<TransactionType, string> = {
  earn: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950",
  redeem: "text-blue-600 bg-blue-50 dark:bg-blue-950",
  adjust: "text-amber-600 bg-amber-50 dark:bg-amber-950",
  expire: "text-slate-600 bg-slate-100 dark:bg-slate-900",
}

function formatPointsSigned(value: number) {
  const abs = Math.abs(value)
  let formatted: string
  try {
    formatted = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(abs)
  } catch {
    formatted = abs.toLocaleString()
  }
  if (value > 0) return `+${formatted}`
  if (value < 0) return `−${formatted}`
  return formatted
}

function formatCurrency(value: number | undefined) {
  if (value === undefined || value === null) return null
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `IDR ${value.toLocaleString()}`
  }
}

interface MemberLedgerProps {
  transactions: LoyaltyTransaction[]
}

export function MemberLedger({ transactions }: MemberLedgerProps) {
  if (transactions.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No point activity recorded yet.
      </p>
    )
  }

  return (
    <ol className="relative space-y-3 border-l pl-4">
      {transactions.map((tx) => {
        const Icon = ICONS[tx.type]
        const amount = formatCurrency(tx.referenceAmount)
        const signClass =
          tx.points > 0
            ? "text-emerald-600"
            : tx.points < 0
              ? "text-red-600"
              : "text-muted-foreground"
        return (
          <li key={tx._id} className="relative">
            <span
              className={cn(
                "absolute -left-[28px] flex h-6 w-6 items-center justify-center rounded-full ring-1 ring-border",
                ACCENTS[tx.type],
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium">{TRANSACTION_TYPE_LABELS[tx.type]}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {tx.transactionDate}
              </p>
            </div>
            <p className={cn("font-mono text-sm font-semibold", signClass)}>
              {formatPointsSigned(tx.points)} <span className="text-xs font-normal">pts</span>
            </p>
            {amount ? (
              <p className="text-xs text-muted-foreground">Reference amount · {amount}</p>
            ) : null}
            {tx.reference ? (
              <p className="text-xs text-muted-foreground">Ref · {tx.reference}</p>
            ) : null}
            {tx.note ? (
              <p className="mt-0.5 whitespace-pre-wrap text-xs text-muted-foreground">
                {tx.note}
              </p>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
