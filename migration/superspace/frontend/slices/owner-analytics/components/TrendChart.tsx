"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { TrendPoint } from "../hooks/useOwnerKpis"

interface Props {
  data: TrendPoint[] | null
}

const formatIDRshort = (n: number): string => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(Math.round(n))
}

/**
 * CSS-bar fallback chart — keeps bundle small and avoids the recharts cost
 * for this MVP dashboard. Shows revenue (bar) + bookings (caption) per day.
 */
export function TrendChart({ data }: Props) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-end gap-1">
            {Array.from({ length: 30 }).map((_, i) => (
              <Skeleton key={i} className="h-32 flex-1" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxRevenue = Math.max(1, ...data.map((d) => d.revenue))
  const totalBookings = data.reduce((acc, d) => acc + d.bookings, 0)
  const totalRevenue = data.reduce((acc, d) => acc + d.revenue, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Revenue &amp; Bookings Trend</CardTitle>
        <CardDescription>
          {data.length}-day window — {totalBookings} bookings, {formatIDRshort(totalRevenue)} IDR revenue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="flex h-64 items-end gap-1"
          role="img"
          aria-label="Daily revenue trend chart"
        >
          {data.map((d) => {
            const pct = (d.revenue / maxRevenue) * 100
            return (
              <div
                key={d.date}
                className="group relative flex h-full flex-1 flex-col justify-end"
                title={`${d.date} — ${formatIDRshort(d.revenue)} IDR, ${d.bookings} bookings`}
              >
                <div
                  className="rounded-t bg-primary/70 transition-colors group-hover:bg-primary"
                  style={{ height: `${Math.max(2, pct)}%` }}
                />
                {d.bookings > 0 ? (
                  <span className="mt-1 hidden text-center text-[10px] text-muted-foreground md:block">
                    {d.bookings}
                  </span>
                ) : null}
              </div>
            )
          })}
        </div>
        <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
          <span>{data[0]?.date ?? ""}</span>
          <span>{data[data.length - 1]?.date ?? ""}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default TrendChart
