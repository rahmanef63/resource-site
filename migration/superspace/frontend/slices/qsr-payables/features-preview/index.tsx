"use client"

import * as React from "react"
import { Receipt } from "lucide-react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"
import { MetricCard } from "@/frontend/shared/ui/dashboard"
import { DataTable } from "@/frontend/shared/ui/components/data-display/table"

interface PayableRow {
  supplier: string
  item: string
  qty: number
  total: number
  due: string
}

const MOCK_ROWS: PayableRow[] = [
  { supplier: "PT CIOMAS ADISATWA", item: "Ayam Broiler 1.1kg", qty: 120, total: 4_356_000, due: "2026-05-25" },
  { supplier: "CV SUMBER MAKMUR", item: "Minyak Goreng 5L", qty: 20, total: 1_780_000, due: "2026-05-22" },
  { supplier: "TOKO BERAS JAYA", item: "Beras Premium 50kg", qty: 6, total: 4_140_000, due: "2026-05-30" },
]

const formatRp = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)

function QsrPayablesPreview({ compact }: FeaturePreviewProps) {
  const total = MOCK_ROWS.reduce((a, r) => a + r.total, 0)
  const suppliers = new Set(MOCK_ROWS.map((r) => r.supplier)).size

  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">QSR Payables</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_ROWS.length} items · {suppliers} suppliers · {formatRp(total)} outstanding
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-shrink-0 items-center gap-2 border-b px-4 py-3">
        <Receipt className="h-5 w-5 text-amber-600" />
        <h3 className="text-base font-semibold">QSR Payables</h3>
        <span className="ml-auto text-xs text-muted-foreground">Vendor credit purchases</span>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <MetricCard title="Items" value={MOCK_ROWS.length} icon={Receipt} />
          <MetricCard title="Suppliers" value={suppliers} />
          <MetricCard title="Outstanding" value={formatRp(total)} />
        </div>
        <DataTable
          data={MOCK_ROWS}
          columns={[
            { key: "supplier", header: "Supplier" },
            { key: "item", header: "Item" },
            { key: "qty", header: "Qty", render: (v) => <span className="tabular-nums">{String(v)}</span> },
            { key: "total", header: "Total", render: (v) => <span className="tabular-nums">{formatRp(Number(v))}</span> },
            { key: "due", header: "Due", render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
          ]}
        />
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "qsr-payables",
  name: "QSR Payables",
  description: "Vendor credit purchases pending payment — invoice tracking + due-date aggregates.",
  component: QsrPayablesPreview,
  category: "administration",
  tags: ["qsr", "fnb", "payables", "vendor"],
  mockDataSets: [
    {
      id: "default",
      name: "Sample payables",
      description: "3 mock vendor invoices with supplier + due dates.",
      data: { rows: MOCK_ROWS },
    },
  ],
})
