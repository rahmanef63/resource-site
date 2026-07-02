"use client"

import { useMemo } from "react"
import { useQuery } from "convex/react"
import { anyApi } from "convex/server"
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts"
import type { Id } from "@convex/_generated/dataModel"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiAny: any = anyApi

export interface QsrSalesTrendChartProps {
  workspaceId: Id<"workspaces">
  /** Optional date window — defaults to last 6 weekly reports. */
  fromDate?: string
  toDate?: string
  /** Color override — defaults to FNB bundle theme orange. */
  strokeColor?: string
  /** Display height in pixels. */
  height?: number
}

type WeeklyReport = {
  _id: string
  fileName: string
  periodStart: string
  periodEnd: string
  salesCount?: number
}

/**
 * Net-sales trend by weekly report. Reusable — pass workspaceId + color.
 *
 * Uses report.salesCount as a proxy magnitude until a domain query
 * `getWeeklySalesTotals` lands in `convex/features/qsr/queries`.
 */
export default function QsrSalesTrendChart({
  workspaceId,
  fromDate,
  toDate,
  strokeColor = "#ea580c",
  height = 280,
}: QsrSalesTrendChartProps) {
  const reports = useQuery(apiAny.features.qsr.queries.listWeeklyReports, {
    workspaceId,
  }) as WeeklyReport[] | undefined

  const series = useMemo(() => {
    if (!reports) return []
    return [...reports]
      .filter((r) => {
        if (fromDate && r.periodStart < fromDate) return false
        if (toDate && r.periodStart > toDate) return false
        return true
      })
      .sort((a, b) => a.periodStart.localeCompare(b.periodStart))
      .map((r) => ({
        week: r.periodStart.slice(5),
        salesRows: r.salesCount ?? 0,
      }))
  }, [reports, fromDate, toDate])

  if (!reports) {
    return <div className="h-[280px] animate-pulse rounded-lg border bg-card" />
  }
  if (series.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-lg border bg-card text-sm text-muted-foreground">
        No reports in window.
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-2 text-sm font-medium">Weekly Activity (sales row count)</div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={series}>
          <defs>
            <linearGradient id="qsrSalesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
          <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 6,
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="salesRows"
            stroke={strokeColor}
            strokeWidth={2}
            fill="url(#qsrSalesGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
