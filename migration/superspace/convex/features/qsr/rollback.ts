/**
 * QSR ETL rollback — admin-key path to delete migrated rows by migrationKey prefix.
 *
 * Use case: live ETL replay went wrong, need to wipe target rows for one source
 * tenant before re-running. Scoped per-table to avoid accidental cross-tenant
 * deletion. Idempotent: empty result if nothing matches.
 *
 * Invocation pattern (per table):
 *   POST /api/mutation
 *   path=features/qsr/rollback:deleteByMigrationKeyPrefix
 *   args={table:"qsrDailyProductSales", workspaceId:"<ws>", prefix:"rc-samata-dash::"}
 *
 * For full-tenant wipe: call once per qsr* table. Combine with workspace
 * delete (via UI) to fully reset.
 *
 * NOT a public mutation — admin-key only. NEVER expose without RBAC.
 */

import { v } from "convex/values"
import { internalMutation } from "../../_generated/server"

const QSR_TABLES = [
  "qsrWeeklyReports", "qsrProductHPP", "qsrFoodCostSummary",
  "qsrSalesControl", "qsrProductChanges", "qsrVendorPurchasesWeekly",
  "qsrDailyProductSales", "qsrInventoryValuation", "qsrCostAnalysis",
  "qsrTransferItems", "qsrCreditPurchases", "qsrEmployeeIncentives",
  "qsrLeftoverItems", "qsrDailyCashFlow", "qsrDailyCashSummary",
] as const

export const deleteByMigrationKeyPrefix = internalMutation({
  args: {
    table: v.string(),
    workspaceId: v.id("workspaces"),
    prefix: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    table: v.string(),
    workspaceId: v.id("workspaces"),
    matched: v.number(),
    deleted: v.number(),
    moreAvailable: v.boolean(),
  }),
  handler: async (ctx, args) => {
    if (!QSR_TABLES.includes(args.table as typeof QSR_TABLES[number])) {
      throw new Error(`Refusing to delete from non-qsr table: ${args.table}`)
    }
    if (!args.prefix || args.prefix.length < 4) {
      throw new Error("prefix too short — refusing wildcard-ish delete")
    }
    const cap = args.limit ?? 1000
    const rows = await ctx.db
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .query(args.table as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
      .take(1000)
    const matched = rows.filter((r: any) =>
      typeof r.migrationKey === "string" && r.migrationKey.startsWith(args.prefix),
    )
    const slice = matched.slice(0, cap)
    for (const r of slice) {
      await ctx.db.delete(r._id)
    }
    return {
      table: args.table,
      workspaceId: args.workspaceId,
      matched: matched.length,
      deleted: slice.length,
      moreAvailable: matched.length > slice.length,
    }
  },
})

/**
 * Convenience: wipe ALL qsr* rows for one workspace + prefix in one call.
 * Per-table loop respects 1000-row cap; caller re-invokes if `moreAvailable`.
 */
export const deleteAllQsrByPrefix = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    prefix: v.string(),
    perTableLimit: v.optional(v.number()),
  },
  returns: v.object({
    workspaceId: v.id("workspaces"),
    perTable: v.array(v.object({
      table: v.string(),
      matched: v.number(),
      deleted: v.number(),
      moreAvailable: v.boolean(),
    })),
    totalDeleted: v.number(),
    anyMoreAvailable: v.boolean(),
  }),
  handler: async (ctx, args) => {
    if (!args.prefix || args.prefix.length < 4) {
      throw new Error("prefix too short — refusing wildcard-ish delete")
    }
    const cap = args.perTableLimit ?? 1000
    const perTable: Array<{ table: string; matched: number; deleted: number; moreAvailable: boolean }> = []
    let total = 0
    let anyMore = false
    for (const table of QSR_TABLES) {
      const rows = await ctx.db
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .query(table as any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
        .take(1000)
      const matched = rows.filter((r: any) =>
        typeof r.migrationKey === "string" && r.migrationKey.startsWith(args.prefix),
      )
      const slice = matched.slice(0, cap)
      for (const r of slice) {
        await ctx.db.delete(r._id)
      }
      perTable.push({
        table,
        matched: matched.length,
        deleted: slice.length,
        moreAvailable: matched.length > slice.length,
      })
      total += slice.length
      if (matched.length > slice.length) anyMore = true
    }
    return {
      workspaceId: args.workspaceId,
      perTable,
      totalDeleted: total,
      anyMoreAvailable: anyMore,
    }
  },
})
