import { v } from "convex/values"
import type { Id } from "../../_generated/dataModel"
import { query } from "../../_generated/server"
import { requirePermission } from "../../auth/helpers"

/**
 * Owner Analytics — Cross-feature Aggregator Queries (READ-ONLY).
 *
 * Each query is defensive: cross-feature table reads are wrapped in
 * try/catch so the dashboard does not crash when sibling features
 * (sales / cashFlowForecasts / guestBookings) have no data yet, or
 * when their schema fields drift. Falls back to zero defaults.
 */

const MAX_TX = 1000
const MAX_PER_QUERY = 500
const DAY_MS = 86_400_000

type AnyDoc = Record<string, any>

function safeNumber(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0
}

function pickAmount(doc: AnyDoc): number {
  // Try the canonical numeric fields used across sales/payments/booking schemas.
  return (
    safeNumber(doc?.total) ||
    safeNumber(doc?.totalAmount) ||
    safeNumber(doc?.totalIdr) ||
    safeNumber(doc?.amount) ||
    safeNumber(doc?.grossRevenueIdr) ||
    safeNumber(doc?.netRevenueIdr) ||
    0
  )
}

function pickDateMs(doc: AnyDoc): number {
  return (
    safeNumber(doc?.checkInDate) ||
    safeNumber(doc?.transactionDate) ||
    safeNumber(doc?.paidAt) ||
    safeNumber(doc?.createdAt) ||
    0
  )
}

async function safeRead(
  // `ctx` is the Convex QueryCtx — typing it precisely here triggers TS2589
  // (deep generated-type instantiation) because `table` is a dynamic string.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  table: string,
  workspaceId: Id<"workspaces">,
  take: number = MAX_PER_QUERY,
): Promise<AnyDoc[]> {
  try {
    const rows = await ctx.db
      .query(table)
      // Convex's index-builder type is parameterised by table name; with a
      // dynamic `table: string` the inferred type collapses to `never`, so
      // we need `any` for the query-builder callback signature only.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
      .take(take)
    return Array.isArray(rows) ? (rows as AnyDoc[]) : []
  } catch (err) {
    // Table may not exist yet (e.g. guestBookings before guest-booking ships),
    // or by_workspace index may differ — fall back to empty set.
    console.warn(
      "[ownerAnalytics] safeRead failed for",
      table,
      err instanceof Error ? err.message : err,
    )
    return []
  }
}

// ---------------------------------------------------------------------------
// 1. Revenue summary — sales + cashFlowForecasts over a period.
// ---------------------------------------------------------------------------
export const getRevenueSummary = query({
  args: {
    workspaceId: v.id("workspaces"),
    periodDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, "owner-analytics.view")

    const days = Math.max(1, Math.min(args.periodDays ?? 30, 365))
    const endDate = Date.now()
    const startDate = endDate - days * DAY_MS

    let totalRevenue = 0
    let totalExpenses = 0

    try {
      const invoices = await safeRead(ctx, "invoices", args.workspaceId, MAX_TX)
      for (const inv of invoices) {
        const created = pickDateMs(inv)
        if (created >= startDate && created <= endDate) {
          totalRevenue += pickAmount(inv)
        }
      }
    } catch (err) {
      console.warn(
        "[ownerAnalytics] getRevenueSummary invoices aggregation failed",
        err instanceof Error ? err.message : err,
      )
    }

    try {
      const payments = await safeRead(ctx, "payments", args.workspaceId, MAX_TX)
      for (const pay of payments) {
        const ts = pickDateMs(pay)
        if (ts >= startDate && ts <= endDate) {
          // Payments confirm cash inflow; only count completed.
          if (pay?.status === "completed" || pay?.status === undefined) {
            totalRevenue += safeNumber(pay?.amount)
          }
        }
      }
    } catch (err) {
      console.warn(
        "[ownerAnalytics] getRevenueSummary payments aggregation failed",
        err instanceof Error ? err.message : err,
      )
    }

    try {
      const forecasts = await safeRead(
        ctx,
        "cashFlowForecasts",
        args.workspaceId,
        MAX_TX,
      )
      for (const f of forecasts) {
        totalExpenses += safeNumber(f?.projectedOutflow)
      }
    } catch (err) {
      console.warn(
        "[ownerAnalytics] getRevenueSummary cashFlowForecasts aggregation failed",
        err instanceof Error ? err.message : err,
      )
    }

    const netCashflow = totalRevenue - totalExpenses

    return {
      totalRevenue,
      totalExpenses,
      netCashflow,
      period: { startDate, endDate, days },
    }
  },
})

// ---------------------------------------------------------------------------
// 2. Occupancy summary — guestBookings counts by status.
// ---------------------------------------------------------------------------
export const getOccupancySummary = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, "owner-analytics.view")

    let totalBookings = 0
    let pendingBookings = 0
    let verifiedBookings = 0
    let checkedInBookings = 0

    try {
      const bookings = await safeRead(
        ctx,
        "guestBookings",
        args.workspaceId,
        MAX_TX,
      )
      totalBookings = bookings.length
      for (const b of bookings) {
        const status = String(b?.status ?? "")
        if (status === "pending") pendingBookings++
        else if (status === "verified" || status === "confirmed") verifiedBookings++
        else if (status === "checked_in" || status === "checkedIn") checkedInBookings++
      }
    } catch (err) {
      // defensive — bookings table may not exist yet
      console.warn(
        "[ownerAnalytics] getOccupancySummary bookings aggregation failed",
        err instanceof Error ? err.message : err,
      )
    }

    const occupancyRate =
      totalBookings > 0 ? checkedInBookings / totalBookings : 0

    return {
      totalBookings,
      pendingBookings,
      verifiedBookings,
      checkedInBookings,
      occupancyRate,
    }
  },
})

// ---------------------------------------------------------------------------
// 3. KPI trend — per-day revenue + booking counts.
// ---------------------------------------------------------------------------
export const getKpiTrend = query({
  args: {
    workspaceId: v.id("workspaces"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, "owner-analytics.view")

    const days = Math.max(1, Math.min(args.days ?? 30, 30))
    const endDate = Date.now()
    const startDate = endDate - days * DAY_MS

    // Bucket key = yyyy-mm-dd (UTC)
    const bucketKey = (ms: number): string => {
      const d = new Date(ms)
      const y = d.getUTCFullYear()
      const m = String(d.getUTCMonth() + 1).padStart(2, "0")
      const day = String(d.getUTCDate()).padStart(2, "0")
      return `${y}-${m}-${day}`
    }

    // Initialise all days to zero so the chart has a continuous x-axis.
    const buckets = new Map<string, { revenue: number; bookings: number }>()
    for (let i = 0; i < days; i++) {
      buckets.set(bucketKey(startDate + i * DAY_MS), { revenue: 0, bookings: 0 })
    }

    try {
      const invoices = await safeRead(ctx, "invoices", args.workspaceId)
      for (const inv of invoices) {
        const ts = pickDateMs(inv)
        if (ts < startDate || ts > endDate) continue
        const k = bucketKey(ts)
        const slot = buckets.get(k)
        if (slot) slot.revenue += pickAmount(inv)
      }
    } catch (err) {
      console.warn(
        "[ownerAnalytics] getKpiTrend invoices aggregation failed",
        err instanceof Error ? err.message : err,
      )
    }

    try {
      const payments = await safeRead(ctx, "payments", args.workspaceId)
      for (const pay of payments) {
        const ts = pickDateMs(pay)
        if (ts < startDate || ts > endDate) continue
        const k = bucketKey(ts)
        const slot = buckets.get(k)
        if (slot && (pay?.status === "completed" || pay?.status === undefined)) {
          slot.revenue += safeNumber(pay?.amount)
        }
      }
    } catch (err) {
      console.warn(
        "[ownerAnalytics] getKpiTrend payments aggregation failed",
        err instanceof Error ? err.message : err,
      )
    }

    try {
      const bookings = await safeRead(ctx, "guestBookings", args.workspaceId)
      for (const b of bookings) {
        const ts = pickDateMs(b)
        if (ts < startDate || ts > endDate) continue
        const k = bucketKey(ts)
        const slot = buckets.get(k)
        if (slot) {
          slot.bookings += 1
          slot.revenue += safeNumber(b?.totalIdr)
        }
      }
    } catch (err) {
      console.warn(
        "[ownerAnalytics] getKpiTrend guestBookings aggregation failed",
        err instanceof Error ? err.message : err,
      )
    }

    return Array.from(buckets.entries())
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([date, v]) => ({ date, revenue: v.revenue, bookings: v.bookings }))
  },
})
