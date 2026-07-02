"use client"

import {
  Archive,
  ArrowRightLeft,
  RefreshCw,
  ShoppingCart,
  TrendingDown,
  Wrench,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { AssetTransaction, TransactionType } from "../types"
import { TRANSACTION_TYPE_LABELS } from "../types"

const ICONS: Record<TransactionType, React.ComponentType<{ className?: string }>> = {
  purchase: ShoppingCart,
  transfer: ArrowRightLeft,
  maintenance: Wrench,
  depreciation: TrendingDown,
  retirement: Archive,
  revaluation: RefreshCw,
}

const ACCENTS: Record<TransactionType, string> = {
  purchase: "text-blue-600 bg-blue-50 dark:bg-blue-950",
  transfer: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950",
  maintenance: "text-amber-600 bg-amber-50 dark:bg-amber-950",
  depreciation: "text-rose-600 bg-rose-50 dark:bg-rose-950",
  retirement: "text-slate-600 bg-slate-100 dark:bg-slate-900",
  revaluation: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950",
}

function formatAmount(value: number | undefined, currency = "IDR") {
  if (value === undefined || value === null) return null
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

interface AssetTransactionLedgerProps {
  transactions: AssetTransaction[]
}

export function AssetTransactionLedger({ transactions }: AssetTransactionLedgerProps) {
  if (transactions.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No transactions recorded yet.
      </p>
    )
  }

  return (
    <ol className="relative space-y-3 border-l pl-4">
      {transactions.map((tx) => {
        const Icon = ICONS[tx.type]
        const amount = formatAmount(tx.amount)
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
              <p className="font-mono text-xs text-muted-foreground">{tx.date}</p>
            </div>
            {amount ? (
              <p className="text-sm font-semibold">{amount}</p>
            ) : null}
            {tx.notes ? (
              <p className="mt-0.5 whitespace-pre-wrap text-xs text-muted-foreground">
                {tx.notes}
              </p>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
