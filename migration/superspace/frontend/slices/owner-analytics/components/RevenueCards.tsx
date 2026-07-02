"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Wallet, Calendar } from "lucide-react"
import type { RevenueSummary } from "../hooks/useOwnerKpis"

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n)

const formatDate = (ms: number) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(ms))

interface Props {
  data: RevenueSummary | null
}

export function RevenueCards({ data }: Props) {
  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const netPositive = data.netCashflow >= 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatIDR(data.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">Last {data.period.days} days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatIDR(data.totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">Forecast projected outflow</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Cashflow</CardTitle>
          <Wallet className={`h-4 w-4 ${netPositive ? "text-emerald-500" : "text-rose-500"}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netPositive ? "" : "text-rose-600"}`}>
            {formatIDR(data.netCashflow)}
          </div>
          <p className="text-xs text-muted-foreground">Revenue − Expenses</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Period</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-semibold">
            {formatDate(data.period.startDate)}
          </div>
          <p className="text-xs text-muted-foreground">
            to {formatDate(data.period.endDate)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default RevenueCards
