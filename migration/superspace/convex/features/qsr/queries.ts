/**
 * QSR feature queries — read-side API for the 15 qsr* tables.
 *
 * All queries are workspace-scoped and gated by `requireActiveMembership`
 * per superspace AGENTS.md §3.
 *
 * Pagination: most queries return up to 500 rows ordered by recency. For
 * heavy reports (qsrDailyProductSales, qsrInventoryValuation), prefer the
 * report-scoped variant `listByReport` which limits by parent FK.
 */

import { v } from "convex/values"
import { internalQuery, query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

// ─────────────────────────────────────────────────────────────
// qsrWeeklyReports — parent table
// ─────────────────────────────────────────────────────────────

export const listWeeklyReports = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.union(v.literal("pending"), v.literal("processed"), v.literal("error"))),
    fromPeriod: v.optional(v.string()), // YYYY-MM-DD
    toPeriod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("qsrWeeklyReports")
      .withIndex("by_workspace_period", (q) =>
        args.fromPeriod
          ? q.eq("workspaceId", args.workspaceId).gte("periodStart", args.fromPeriod)
          : q.eq("workspaceId", args.workspaceId),
      )
      .order("desc")
      .take(200)
    return rows.filter(
      (r) =>
        (!args.status || r.status === args.status) &&
        (!args.toPeriod || r.periodStart <= args.toPeriod),
    )
  },
})

export const getWeeklyReport = query({
  args: { reportId: v.id("qsrWeeklyReports") },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId)
    if (!report) return null
    await requireActiveMembership(ctx, report.workspaceId)
    return report
  },
})

// ─────────────────────────────────────────────────────────────
// qsrProductHPP
// ─────────────────────────────────────────────────────────────

export const listProductHPP = query({
  args: {
    reportId: v.id("qsrWeeklyReports"),
    pricingClass: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId)
    if (!report) return []
    await requireActiveMembership(ctx, report.workspaceId)
    const rows = await ctx.db
      .query("qsrProductHPP")
      .withIndex("by_report", (q) => q.eq("reportId", args.reportId))
      .take(1000)
    return args.pricingClass ? rows.filter((r) => r.pricingClass === args.pricingClass) : rows
  },
})

export const listProductHPPByClass = query({
  args: {
    workspaceId: v.id("workspaces"),
    pricingClass: v.union(
      v.literal("standard"), v.literal("kelas2"),
      v.literal("kelas3a"), v.literal("kelas3b"), v.literal("kelas4"),
    ),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    return ctx.db
      .query("qsrProductHPP")
      .withIndex("by_workspace_class", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("pricingClass", args.pricingClass),
      )
      .order("desc")
      .take(500)
  },
})

/**
 * Workspace-level HPP listing across all pricing classes.
 * Used by qsr-master-data view to show a deduped product catalog without
 * requiring a specific reportId or pricingClass filter upfront.
 */
export const listProductHPPByWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    return ctx.db
      .query("qsrProductHPP")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(1000)
  },
})

// ─────────────────────────────────────────────────────────────
// qsrFoodCostSummary
// ─────────────────────────────────────────────────────────────

export const listFoodCostSummary = query({
  args: {
    workspaceId: v.id("workspaces"),
    fromWeek: v.optional(v.string()),
    toWeek: v.optional(v.string()),
    category: v.optional(v.union(v.literal("food_beverage"), v.literal("paper"))),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("qsrFoodCostSummary")
      .withIndex("by_workspace_week", (q) =>
        args.fromWeek
          ? q.eq("workspaceId", args.workspaceId).gte("weekStart", args.fromWeek)
          : q.eq("workspaceId", args.workspaceId),
      )
      .order("desc")
      .take(200)
    return rows.filter(
      (r) =>
        (!args.toWeek || r.weekStart <= args.toWeek) &&
        (!args.category || r.category === args.category),
    )
  },
})

// ─────────────────────────────────────────────────────────────
// qsrSalesControl — daily MTD
// ─────────────────────────────────────────────────────────────

export const listSalesControl = query({
  args: {
    workspaceId: v.id("workspaces"),
    fromDate: v.optional(v.string()),
    toDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("qsrSalesControl")
      .withIndex("by_workspace_date", (q) =>
        args.fromDate
          ? q.eq("workspaceId", args.workspaceId).gte("businessDate", args.fromDate)
          : q.eq("workspaceId", args.workspaceId),
      )
      .order("desc")
      .take(500)
    return args.toDate ? rows.filter((r) => r.businessDate <= args.toDate!) : rows
  },
})

// ─────────────────────────────────────────────────────────────
// qsrVendorPurchasesWeekly
// ─────────────────────────────────────────────────────────────

export const listVendorPurchases = query({
  args: {
    workspaceId: v.id("workspaces"),
    fromWeek: v.optional(v.string()),
    toWeek: v.optional(v.string()),
    section: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("qsrVendorPurchasesWeekly")
      .withIndex("by_workspace_week", (q) =>
        args.fromWeek
          ? q.eq("workspaceId", args.workspaceId).gte("weekStart", args.fromWeek)
          : q.eq("workspaceId", args.workspaceId),
      )
      .order("desc")
      .take(500)
    return rows.filter(
      (r) =>
        (!args.toWeek || r.weekStart <= args.toWeek) &&
        (!args.section || r.section === args.section),
    )
  },
})

// ─────────────────────────────────────────────────────────────
// qsrDailyProductSales — heavy table (5k+ rows in rc-samata source)
// ─────────────────────────────────────────────────────────────

export const listDailyProductSales = query({
  args: {
    workspaceId: v.id("workspaces"),
    fromDate: v.optional(v.string()),
    toDate: v.optional(v.string()),
    channel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("qsrDailyProductSales")
      .withIndex("by_workspace_date", (q) =>
        args.fromDate
          ? q.eq("workspaceId", args.workspaceId).gte("businessDate", args.fromDate)
          : q.eq("workspaceId", args.workspaceId),
      )
      .order("desc")
      .take(1000)
    return rows.filter(
      (r) =>
        (!args.toDate || r.businessDate <= args.toDate) &&
        (!args.channel || r.channel === args.channel),
    )
  },
})

export const listDailyProductSalesByReport = query({
  args: {
    reportId: v.id("qsrWeeklyReports"),
    channel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId)
    if (!report) return []
    await requireActiveMembership(ctx, report.workspaceId)
    if (args.channel) {
      return ctx.db
        .query("qsrDailyProductSales")
        .withIndex("by_report_channel", (q) =>
          q.eq("reportId", args.reportId).eq("channel", args.channel),
        )
        .take(1000)
    }
    return ctx.db
      .query("qsrDailyProductSales")
      .withIndex("by_report", (q) => q.eq("reportId", args.reportId))
      .take(1000)
  },
})

// ─────────────────────────────────────────────────────────────
// qsrInventoryValuation
// ─────────────────────────────────────────────────────────────

export const listInventoryValuation = query({
  args: {
    workspaceId: v.id("workspaces"),
    fromDate: v.optional(v.string()),
    toDate: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("qsrInventoryValuation")
      .withIndex("by_workspace_date", (q) =>
        args.fromDate
          ? q.eq("workspaceId", args.workspaceId).gte("valuationDate", args.fromDate)
          : q.eq("workspaceId", args.workspaceId),
      )
      .order("desc")
      .take(1000)
    return rows.filter(
      (r) =>
        (!args.toDate || r.valuationDate <= args.toDate) &&
        (!args.category || r.category === args.category),
    )
  },
})

// ─────────────────────────────────────────────────────────────
// qsrCostAnalysis
// ─────────────────────────────────────────────────────────────

export const listCostAnalysis = query({
  args: {
    workspaceId: v.id("workspaces"),
    fromPeriod: v.optional(v.string()),
    toPeriod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("qsrCostAnalysis")
      .withIndex("by_workspace_period", (q) =>
        args.fromPeriod
          ? q.eq("workspaceId", args.workspaceId).gte("periodStart", args.fromPeriod)
          : q.eq("workspaceId", args.workspaceId),
      )
      .order("desc")
      .take(500)
    return args.toPeriod ? rows.filter((r) => r.periodStart <= args.toPeriod!) : rows
  },
})

// ─────────────────────────────────────────────────────────────
// qsrTransferItems
// ─────────────────────────────────────────────────────────────

export const listTransferItems = query({
  args: {
    workspaceId: v.id("workspaces"),
    fromPeriod: v.optional(v.string()),
    toPeriod: v.optional(v.string()),
    direction: v.optional(v.union(v.literal("out"), v.literal("in"))),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("qsrTransferItems")
      .withIndex("by_workspace_period", (q) =>
        args.fromPeriod
          ? q.eq("workspaceId", args.workspaceId).gte("periodStart", args.fromPeriod)
          : q.eq("workspaceId", args.workspaceId),
      )
      .order("desc")
      .take(500)
    return rows.filter(
      (r) =>
        (!args.toPeriod || r.periodStart <= args.toPeriod) &&
        (!args.direction || r.direction === args.direction) &&
        (!args.category || r.category === args.category),
    )
  },
})

// ─────────────────────────────────────────────────────────────
// qsrCreditPurchases
// ─────────────────────────────────────────────────────────────

export const listCreditPurchases = query({
  args: {
    workspaceId: v.id("workspaces"),
    fromDate: v.optional(v.string()),
    toDate: v.optional(v.string()),
    supplierName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("qsrCreditPurchases")
      .withIndex("by_workspace_date", (q) =>
        args.fromDate
          ? q.eq("workspaceId", args.workspaceId).gte("purchaseDate", args.fromDate)
          : q.eq("workspaceId", args.workspaceId),
      )
      .order("desc")
      .take(500)
    return rows.filter(
      (r) =>
        (!args.toDate || r.purchaseDate <= args.toDate) &&
        (!args.supplierName || r.supplierName === args.supplierName),
    )
  },
})

// ─────────────────────────────────────────────────────────────
// qsrEmployeeIncentives
// ─────────────────────────────────────────────────────────────

export const listEmployeeIncentives = query({
  args: {
    workspaceId: v.id("workspaces"),
    fromPeriod: v.optional(v.string()),
    toPeriod: v.optional(v.string()),
    employeeName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("qsrEmployeeIncentives")
      .withIndex("by_workspace_period", (q) =>
        args.fromPeriod
          ? q.eq("workspaceId", args.workspaceId).gte("periodStart", args.fromPeriod)
          : q.eq("workspaceId", args.workspaceId),
      )
      .order("desc")
      .take(500)
    return rows.filter(
      (r) =>
        (!args.toPeriod || r.periodStart <= args.toPeriod) &&
        (!args.employeeName || r.employeeName === args.employeeName),
    )
  },
})

// ─────────────────────────────────────────────────────────────
// qsrLeftoverItems
// ─────────────────────────────────────────────────────────────

export const listPettyCash = query({
  args: {
    workspaceId: v.id("workspaces"),
    fromDate: v.optional(v.string()),
    toDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const fromDate = args.fromDate
    const toDate = args.toDate
    const rows = await ctx.db
      .query("qsrPettyCash")
      .withIndex("by_workspace_date", (q) => {
        const base = q.eq("workspaceId", args.workspaceId)
        return fromDate ? base.gte("businessDate", fromDate) : base
      })
      .order("desc")
      .take(500)
    return toDate ? rows.filter((r) => r.businessDate <= toDate) : rows
  },
})

export const listLeftoverItems = query({
  args: {
    workspaceId: v.id("workspaces"),
    fromDate: v.optional(v.string()),
    toDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const fromDate = args.fromDate
    const toDate = args.toDate
    const rows = await ctx.db
      .query("qsrLeftoverItems")
      .withIndex("by_workspace_date", (q) => {
        const base = q.eq("workspaceId", args.workspaceId)
        return fromDate ? base.gte("businessDate", fromDate) : base
      })
      .order("desc")
      .take(500)
    return toDate ? rows.filter((r) => r.businessDate <= toDate) : rows
  },
})

// ─────────────────────────────────────────────────────────────
// qsrDailyCashFlow
// ─────────────────────────────────────────────────────────────

export const listDailyCashFlow = query({
  args: {
    workspaceId: v.id("workspaces"),
    fromDate: v.optional(v.string()),
    toDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const fromDate = args.fromDate
    const toDate = args.toDate
    const rows = await ctx.db
      .query("qsrDailyCashFlow")
      .withIndex("by_workspace_date", (q) => {
        const base = q.eq("workspaceId", args.workspaceId)
        return fromDate ? base.gte("businessDate", fromDate) : base
      })
      .order("desc")
      .take(500)
    return toDate ? rows.filter((r) => r.businessDate <= toDate) : rows
  },
})

// ─────────────────────────────────────────────────────────────
// qsrDailyCashSummary
// ─────────────────────────────────────────────────────────────

export const listDailyCashSummary = query({
  args: {
    workspaceId: v.id("workspaces"),
    fromDate: v.optional(v.string()),
    toDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const fromDate = args.fromDate
    const toDate = args.toDate
    const rows = await ctx.db
      .query("qsrDailyCashSummary")
      .withIndex("by_workspace_date", (q) => {
        const base = q.eq("workspaceId", args.workspaceId)
        return fromDate ? base.gte("businessDate", fromDate) : base
      })
      .order("desc")
      .take(500)
    return toDate ? rows.filter((r) => r.businessDate <= toDate) : rows
  },
})

// ─────────────────────────────────────────────────────────────
// qsrProductChanges
// ─────────────────────────────────────────────────────────────

export const listProductChanges = query({
  args: {
    workspaceId: v.id("workspaces"),
    periodLabel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    if (args.periodLabel) {
      return ctx.db
        .query("qsrProductChanges")
        .withIndex("by_workspace_period", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("periodLabel", args.periodLabel!),
        )
        .take(1000)
    }
    return ctx.db
      .query("qsrProductChanges")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(500)
  },
})

// ─────────────────────────────────────────────────────────────
// Aggregation: KPI dashboard summary for a workspace
// ─────────────────────────────────────────────────────────────

export const getKpiDashboard = query({
  args: {
    workspaceId: v.id("workspaces"),
    fromDate: v.string(), // YYYY-MM-DD
    toDate: v.string(),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    // Pull narrow ranges
    const sales = await ctx.db
      .query("qsrSalesControl")
      .withIndex("by_workspace_date", (q) =>
        q.eq("workspaceId", args.workspaceId).gte("businessDate", args.fromDate),
      )
      .take(1000)
    const cashflow = await ctx.db
      .query("qsrDailyCashFlow")
      .withIndex("by_workspace_date", (q) =>
        q.eq("workspaceId", args.workspaceId).gte("businessDate", args.fromDate),
      )
      .take(1000)
    const fcs = await ctx.db
      .query("qsrFoodCostSummary")
      .withIndex("by_workspace_week", (q) =>
        q.eq("workspaceId", args.workspaceId).gte("weekStart", args.fromDate),
      )
      .take(1000)

    const salesIn = sales.filter((r) => r.businessDate <= args.toDate)
    const cfIn = cashflow.filter((r) => r.businessDate <= args.toDate)
    const fcsIn = fcs.filter((r) => r.weekStart <= args.toDate)

    const totalNetSales = salesIn.reduce((a, r) => a + r.netSales, 0)
    const totalCustomers = salesIn.reduce((a, r) => a + r.customerCount, 0)
    const totalCashIn = cfIn.reduce((a, r) => a + r.salesInflow + r.otherInflow, 0)
    const totalCashOut = cfIn.reduce((a, r) => a + r.expenseOutflow + r.otherOutflow, 0)
    const avgFcPercentByCategory: Record<string, { sum: number; count: number }> = {}
    for (const r of fcsIn) {
      if (typeof r.foodCostPercent !== "number") continue
      avgFcPercentByCategory[r.category] ??= { sum: 0, count: 0 }
      avgFcPercentByCategory[r.category].sum += r.foodCostPercent
      avgFcPercentByCategory[r.category].count += 1
    }

    return {
      window: { fromDate: args.fromDate, toDate: args.toDate },
      sales: {
        netSales: totalNetSales,
        customers: totalCustomers,
        avgDayaBeli: totalCustomers > 0 ? totalNetSales / totalCustomers : 0,
        days: salesIn.length,
      },
      cashflow: {
        inflow: totalCashIn,
        outflow: totalCashOut,
        net: totalCashIn - totalCashOut,
        days: cfIn.length,
      },
      foodCost: Object.fromEntries(
        Object.entries(avgFcPercentByCategory).map(([cat, v]) => [
          cat,
          { avgPercent: v.count > 0 ? v.sum / v.count : 0, samples: v.count },
        ]),
      ),
    }
  },
})

// ─────────────────────────────────────────────────────────────
// Migration verification — row counts per qsr* table for a workspace
// ─────────────────────────────────────────────────────────────

/**
 * Returns row counts for each qsr* table scoped to one workspace.
 * Used by CUTOVER.md step 6 to reconcile against `row-counts-baseline.json`.
 */
export const getMigrationStats = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const tables = [
      "qsrWeeklyReports", "qsrProductHPP", "qsrFoodCostSummary",
      "qsrSalesControl", "qsrProductChanges", "qsrVendorPurchasesWeekly",
      "qsrDailyProductSales", "qsrInventoryValuation", "qsrCostAnalysis",
      "qsrTransferItems", "qsrCreditPurchases", "qsrEmployeeIncentives",
      "qsrLeftoverItems", "qsrDailyCashFlow", "qsrDailyCashSummary",
    ] as const
    const counts: Record<string, number> = {}
    for (const t of tables) {
      const rows = await ctx.db
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .query(t as any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
        .take(1000)
      counts[t] = rows.length
    }
    return {
      workspaceId: args.workspaceId,
      capturedAt: new Date().toISOString(),
      counts,
      total: Object.values(counts).reduce((a, b) => a + b, 0),
    }
  },
})

/**
 * Admin-key financial reconciliation — sum daily sales amount grouped by YYYY-MM.
 * Used by ETL CUTOVER step 6 to verify against `financial-baseline.json`.
 */
export const sumDailyProductSalesByMonthAdmin = internalQuery({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("qsrDailyProductSales")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)
    const sums: Record<string, number> = {}
    for (const r of rows) {
      const month = (r.businessDate ?? "unknown").slice(0, 7)
      sums[month] = (sums[month] ?? 0) + (r.amount ?? 0)
    }
    return { workspaceId: args.workspaceId, totalRows: rows.length, sumByMonth: sums }
  },
})

/**
 * Admin-key reconciliation — same counts, no membership check.
 * Used by ETL CUTOVER step 6 (admin-key invocation, no Clerk JWT).
 */
export const getMigrationStatsAdmin = internalQuery({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const tables = [
      "qsrWeeklyReports", "qsrProductHPP", "qsrFoodCostSummary",
      "qsrSalesControl", "qsrProductChanges", "qsrVendorPurchasesWeekly",
      "qsrDailyProductSales", "qsrInventoryValuation", "qsrCostAnalysis",
      "qsrTransferItems", "qsrCreditPurchases", "qsrEmployeeIncentives",
      "qsrLeftoverItems", "qsrDailyCashFlow", "qsrDailyCashSummary",
    ] as const
    const counts: Record<string, number> = {}
    for (const t of tables) {
      const rows = await ctx.db
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .query(t as any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
        .take(1000)
      counts[t] = rows.length
    }
    return {
      workspaceId: args.workspaceId,
      capturedAt: new Date().toISOString(),
      counts,
      total: Object.values(counts).reduce((a, b) => a + b, 0),
    }
  },
})
