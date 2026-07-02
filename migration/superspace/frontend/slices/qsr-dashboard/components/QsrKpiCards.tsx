"use client"

import { useMemo } from "react"
import { useQuery } from "convex/react"
import { anyApi } from "convex/server"
import { TrendingUp, ShoppingBag, DollarSign, FileText } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiAny: any = anyApi

export interface QsrKpiCardsProps {
  workspaceId: Id<"workspaces">
  /** Optional KPI date window. Falls back to last 30d if omitted. */
  fromDate?: string
  toDate?: string
}

type WeeklyReport = {
  _id: string
  fileName: string
  periodStart: string
  periodEnd: string
  status: string
  salesCount?: number
  vendorCount?: number
  cashFlowCount?: number
}

const formatRp = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)

/**
 * KPI summary cards. Reusable for any QSR-pattern workspace — pass workspaceId.
 * Date range optional; defaults derive from the latest weekly report.
 */
export default function QsrKpiCards({ workspaceId, fromDate, toDate }: QsrKpiCardsProps) {
  const reports = useQuery(apiAny.features.qsr.queries.listWeeklyReports, {
    workspaceId,
  }) as WeeklyReport[] | undefined

  const stats = useMemo(() => {
    if (!reports) return null
    const inWindow = reports.filter((r) => {
      if (!fromDate && !toDate) return true
      const ps = r.periodStart
      if (fromDate && ps < fromDate) return false
      if (toDate && ps > toDate) return false
      return true
    })
    return {
      reportCount: inWindow.length,
      totalSalesRows: inWindow.reduce((a, r) => a + (r.salesCount ?? 0), 0),
      totalVendorRows: inWindow.reduce((a, r) => a + (r.vendorCount ?? 0), 0),
      totalCashflowRows: inWindow.reduce((a, r) => a + (r.cashFlowCount ?? 0), 0),
    }
  }, [reports, fromDate, toDate])

  if (!reports) return <KpiSkeleton />
  if (!stats) return null

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        icon={<FileText className="h-4 w-4" />}
        label="Weekly Reports"
        value={String(stats.reportCount)}
        sublabel="in window"
      />
      <KpiCard
        icon={<ShoppingBag className="h-4 w-4" />}
        label="Sales Rows"
        value={String(stats.totalSalesRows)}
        sublabel="daily × channel"
      />
      <KpiCard
        icon={<TrendingUp className="h-4 w-4" />}
        label="Vendor Purchases"
        value={String(stats.totalVendorRows)}
        sublabel="commodity rows"
      />
      <KpiCard
        icon={<DollarSign className="h-4 w-4" />}
        label="Cash-Flow Days"
        value={String(stats.totalCashflowRows)}
        sublabel="daily ledger"
      />
    </div>
  )
}

function KpiCard({
  icon, label, value, sublabel,
}: { icon: React.ReactNode; label: string; value: string; sublabel?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs uppercase tracking-wide">{label}</span>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {sublabel && <div className="text-xs text-muted-foreground">{sublabel}</div>}
    </div>
  )
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-lg border bg-card" />
      ))}
    </div>
  )
}

// formatRp exported for sibling components (chart, list)
export { formatRp }
