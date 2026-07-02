"use client"

import { useQuery } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import type { Id } from "@convex/_generated/dataModel"

/**
 * useOwnerKpis — thin wrapper around the 3 owner-analytics aggregator queries.
 *
 * Returns `undefined`-tolerant slots so consumers can render skeletons while
 * Convex resolves; passes `"skip"` when workspaceId is null.
 */
export function useOwnerKpis(
  workspaceId: Id<"workspaces"> | null | undefined,
  options?: { periodDays?: number; trendDays?: number },
) {
  const periodDays = options?.periodDays ?? 30
  const trendDays = options?.trendDays ?? 30

  const revenue = useQuery(
    api.features.ownerAnalytics.queries.getRevenueSummary,
    workspaceId ? { workspaceId, periodDays } : "skip",
  )
  const occupancy = useQuery(
    api.features.ownerAnalytics.queries.getOccupancySummary,
    workspaceId ? { workspaceId } : "skip",
  )
  const trend = useQuery(
    api.features.ownerAnalytics.queries.getKpiTrend,
    workspaceId ? { workspaceId, days: trendDays } : "skip",
  )

  return {
    revenue: (revenue ?? null) as RevenueSummary | null,
    occupancy: (occupancy ?? null) as OccupancySummary | null,
    trend: (trend ?? null) as TrendPoint[] | null,
    isLoading: workspaceId
      ? revenue === undefined || occupancy === undefined || trend === undefined
      : false,
  }
}

export interface RevenueSummary {
  totalRevenue: number
  totalExpenses: number
  netCashflow: number
  period: { startDate: number; endDate: number; days: number }
}

export interface OccupancySummary {
  totalBookings: number
  pendingBookings: number
  verifiedBookings: number
  checkedInBookings: number
  occupancyRate: number
}

export interface TrendPoint {
  date: string
  revenue: number
  bookings: number
}
