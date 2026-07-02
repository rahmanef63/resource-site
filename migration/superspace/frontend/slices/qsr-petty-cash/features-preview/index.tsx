"use client"

import * as React from "react"
import { Wallet, FileText } from "lucide-react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"
import { MetricCard } from "@/frontend/shared/ui/dashboard"
import { DataTable } from "@/frontend/shared/ui/components/data-display/table"

interface PettyCashRow {
  date: string
  category: string
  description: string
  requestedBy: string
  amount: number
}

const MOCK_ROWS: PettyCashRow[] = [
  { date: "2026-05-14", category: "Operasional", description: "Gas LPG 12kg × 2", requestedBy: "Andi S.", amount: 380_000 },
  { date: "2026-05-13", category: "Maintenance", description: "Service AC kitchen", requestedBy: "Budi H.", amount: 250_000 },
  { date: "2026-05-12", category: "Operasional", description: "Galon air + tissue", requestedBy: "Citra A.", amount: 165_000 },
  { date: "2026-05-10", category: "Transport", description: "Ojek belanja pasar", requestedBy: "Andi S.", amount: 75_000 },
]

const formatRp = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)

function QsrPettyCashPreview({ compact }: FeaturePreviewProps) {
  const total = MOCK_ROWS.reduce((a, r) => a + r.amount, 0)
  const categories = new Set(MOCK_ROWS.map((r) => r.category)).size

  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">QSR Petty Cash</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_ROWS.length} disbursements · {categories} categories · {formatRp(total)} weekly
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-shrink-0 items-center gap-2 border-b px-4 py-3">
        <Wallet className="h-5 w-5 text-blue-600" />
        <h3 className="text-base font-semibold">QSR Petty Cash</h3>
        <span className="ml-auto text-xs text-muted-foreground">LPKK weekly sheet</span>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <MetricCard title="Entries" value={MOCK_ROWS.length} icon={FileText} />
          <MetricCard title="Categories" value={categories} />
          <MetricCard title="Weekly Total" value={formatRp(total)} icon={Wallet} />
        </div>

        <DataTable
          data={MOCK_ROWS}
          columns={[
            { key: "date", header: "Date", render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
            { key: "category", header: "Category" },
            { key: "description", header: "Description" },
            { key: "requestedBy", header: "Requested By" },
            { key: "amount", header: "Amount", render: (v) => <span className="tabular-nums">{formatRp(Number(v))}</span> },
          ]}
        />
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "qsr-petty-cash",
  name: "QSR Petty Cash",
  description: "Weekly LPKK small-cash disbursements — categorised entries with requestor + receipt tracking.",
  component: QsrPettyCashPreview,
  category: "administration",
  tags: ["qsr", "fnb", "petty-cash", "lpkk"],
  mockDataSets: [
    {
      id: "default",
      name: "Sample petty cash",
      description: "4 mock LPKK entries across operasional / maintenance / transport.",
      data: { rows: MOCK_ROWS },
    },
  ],
})
