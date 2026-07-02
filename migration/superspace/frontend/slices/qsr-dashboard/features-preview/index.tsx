"use client"

import * as React from "react"
import { Utensils, TrendingUp, Receipt, Wallet } from "lucide-react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"
import { MetricCard } from "@/frontend/shared/ui/dashboard"

const KPIS = [
  { label: "Weekly Net Sales", value: "Rp 28.4M", trend: { value: 12.3, direction: "up" as const, label: "vs prior week" }, icon: TrendingUp, tone: "text-emerald-600" },
  { label: "Food Cost %", value: "32.1%", trend: { value: -1.8, direction: "down" as const, label: "pp vs target" }, icon: Utensils, tone: "text-amber-600" },
  { label: "Vendor Purchases", value: "Rp 9.7M", subtitle: "18 invoices", icon: Receipt, tone: "text-sky-600" },
  { label: "Cash Closing", value: "Rp 4.2M", subtitle: "7/7 days closed", icon: Wallet, tone: "text-violet-600" },
]

const TREND = [38, 42, 35, 51, 48, 56, 62]

function QsrDashboardPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">QSR Dashboard</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          Net sales · food cost % · vendor purchases · daily cash flow
        </p>
      </div>
    )
  }

  const max = Math.max(...TREND)

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-shrink-0 items-center gap-2 border-b px-4 py-3">
        <Utensils className="h-5 w-5 text-rose-600" />
        <h3 className="text-base font-semibold">QSR Dashboard</h3>
        <span className="ml-auto text-xs text-muted-foreground">Weekly owner overview</span>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {KPIS.map((k) => (
            <MetricCard
              key={k.label}
              title={k.label}
              value={k.value}
              icon={k.icon}
              iconClassName={k.tone}
              trend={k.trend}
              subtitle={k.subtitle}
            />
          ))}
        </div>

        <section className="rounded-lg border bg-card p-3">
          <header className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase">Sales trend (7d)</span>
            <span className="text-xs text-muted-foreground">Rp millions</span>
          </header>
          <div className="flex h-24 items-end gap-2">
            {TREND.map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-rose-500/60"
                style={{ height: `${(v / max) * 100}%` }}
                title={`Day ${i + 1}: Rp ${v}M`}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "qsr-dashboard",
  name: "QSR Dashboard",
  description: "Restaurant weekly report overview — net sales trend, food cost %, daily cash flow, vendor purchases.",
  component: QsrDashboardPreview,
  category: "analytics",
  tags: ["qsr", "fnb", "restaurant", "dashboard", "charts", "analytics"],
  mockDataSets: [
    {
      id: "default",
      name: "Sample dashboard",
      description: "Mock KPI cards + 7-day sales trend bars.",
      data: { kpis: KPIS.map((k) => ({ label: k.label, value: k.value })), trend: TREND },
    },
  ],
})
