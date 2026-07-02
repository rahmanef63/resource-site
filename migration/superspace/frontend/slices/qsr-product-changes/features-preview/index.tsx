"use client"

import * as React from "react"
import { ArrowLeftRight, Plus, Minus, Pencil } from "lucide-react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"
import { MetricCard } from "@/frontend/shared/ui/dashboard"
import { DataTable } from "@/frontend/shared/ui/components/data-display/table"

type ChangeKind = "added" | "removed" | "price"

interface ChangeRow {
  date: string
  product: string
  kind: ChangeKind
  detail: string
}

const MOCK_ROWS: ChangeRow[] = [
  { date: "2026-05-10", product: "Spicy Wings Trio", kind: "added", detail: "New SKU — class B HPP 16k" },
  { date: "2026-05-08", product: "Paket Hemat 3", kind: "price", detail: "HPP 18.5k → 19.2k (+3.8%)" },
  { date: "2026-05-03", product: "Lemon Tea 500ml", kind: "removed", detail: "Discontinued — supplier change" },
]

const iconByKind: Record<ChangeKind, typeof Plus> = { added: Plus, removed: Minus, price: Pencil }
const colorByKind: Record<ChangeKind, string> = {
  added: "text-emerald-600",
  removed: "text-rose-600",
  price: "text-amber-600",
}

function QsrProductChangesPreview({ compact }: FeaturePreviewProps) {
  const counts = MOCK_ROWS.reduce(
    (acc, r) => ({ ...acc, [r.kind]: (acc[r.kind] ?? 0) + 1 }),
    {} as Record<ChangeKind, number>,
  )

  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">QSR Product Changes</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_ROWS.length} weekly changes · added / removed / price updates
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-shrink-0 items-center gap-2 border-b px-4 py-3">
        <ArrowLeftRight className="h-5 w-5 text-sky-600" />
        <h3 className="text-base font-semibold">QSR Product Changes</h3>
        <span className="ml-auto text-xs text-muted-foreground">Recipe lifecycle audit trail</span>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <MetricCard title="Added" value={counts.added ?? 0} icon={Plus} iconClassName="text-emerald-600" />
          <MetricCard title="Price changes" value={counts.price ?? 0} icon={Pencil} iconClassName="text-amber-600" />
          <MetricCard title="Removed" value={counts.removed ?? 0} icon={Minus} iconClassName="text-rose-600" />
        </div>

        <DataTable
          data={MOCK_ROWS}
          columns={[
            { key: "date", header: "Date", render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
            { key: "product", header: "Product" },
            {
              key: "kind",
              header: "Kind",
              render: (v) => {
                const k = v as ChangeKind
                const Icon = iconByKind[k]
                return (
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${colorByKind[k]}`}>
                    <Icon className="h-3 w-3" /> {k}
                  </span>
                )
              },
            },
            { key: "detail", header: "Detail" },
          ]}
        />
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "qsr-product-changes",
  name: "QSR Product Changes",
  description: "Weekly product additions / removals / price updates per branch — recipe lifecycle audit trail.",
  component: QsrProductChangesPreview,
  category: "administration",
  tags: ["qsr", "fnb", "product-changes", "waste", "audit"],
  mockDataSets: [
    {
      id: "default",
      name: "Sample changes",
      description: "3 recent product lifecycle events: added / price-change / removed.",
      data: { rows: MOCK_ROWS },
    },
  ],
})
