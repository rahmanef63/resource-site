"use client"

import * as React from "react"
import { HandCoins, Users } from "lucide-react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"
import { MetricCard } from "@/frontend/shared/ui/dashboard"
import { DataTable } from "@/frontend/shared/ui/components/data-display/table"

interface AllowanceRow {
  name: string
  position: string
  luarKota: number
  transport: number
  kos: number
  total: number
}

const MOCK_ROWS: AllowanceRow[] = [
  { name: "Andi Setiawan", position: "Crew", luarKota: 0, transport: 350_000, kos: 600_000, total: 950_000 },
  { name: "Budi Hartono", position: "Shift Leader", luarKota: 500_000, transport: 350_000, kos: 750_000, total: 1_600_000 },
  { name: "Citra Anggraini", position: "Cashier", luarKota: 0, transport: 250_000, kos: 600_000, total: 850_000 },
]

const formatRp = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)

function QsrAllowancesPreview({ compact }: FeaturePreviewProps) {
  const total = MOCK_ROWS.reduce((a, r) => a + r.total, 0)

  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">QSR Allowances</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_ROWS.length} employees · {formatRp(total)} monthly allowance budget
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-shrink-0 items-center gap-2 border-b px-4 py-3">
        <HandCoins className="h-5 w-5 text-violet-600" />
        <h3 className="text-base font-semibold">QSR Allowances</h3>
        <span className="ml-auto text-xs text-muted-foreground">Indo-specific payroll</span>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <MetricCard title="Employees" value={MOCK_ROWS.length} icon={Users} />
          <MetricCard title="Monthly Total" value={formatRp(total)} icon={HandCoins} />
        </div>

        <DataTable
          data={MOCK_ROWS}
          columns={[
            { key: "name", header: "Employee" },
            { key: "position", header: "Position" },
            { key: "luarKota", header: "Luar Kota", render: (v) => <span className="tabular-nums">{Number(v) ? formatRp(Number(v)) : "—"}</span> },
            { key: "transport", header: "Transport", render: (v) => <span className="tabular-nums">{formatRp(Number(v))}</span> },
            { key: "kos", header: "Kos", render: (v) => <span className="tabular-nums">{formatRp(Number(v))}</span> },
          ]}
        />
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "qsr-allowances",
  name: "QSR Allowances",
  description: "Employee allowances — luar-kota, transport, kos subsidies + monthly incentives by branch.",
  component: QsrAllowancesPreview,
  category: "administration",
  tags: ["qsr", "fnb", "allowances", "employee", "payroll"],
  mockDataSets: [
    {
      id: "default",
      name: "Sample allowances",
      description: "3 employees with breakdown across luar-kota, transport, kos subsidies.",
      data: { rows: MOCK_ROWS },
    },
  ],
})
