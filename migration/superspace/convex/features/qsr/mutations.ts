/**
 * QSR feature mutations.
 *
 * Two surfaces:
 *   - `internalMutation` writers — used by ETL (admin-key bypass RBAC).
 *     All idempotent via `migrationKey`.
 *   - User-facing `mutation` — TODO when UI lands; not needed for ETL gate.
 */

import { v } from "convex/values"
import { internalMutation, mutation } from "../../_generated/server"
import { ensureUser, requireActiveMembership, requirePermission } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"

const upsertByMigrationKey = async <T extends string>(
  ctx: { db: any }, // eslint-disable-line @typescript-eslint/no-explicit-any
  table: T,
  migrationKey: string,
  doc: Record<string, unknown>,
) => {
  const existing = await ctx.db
    .query(table)
    .withIndex("by_migration_key", (q: any) => q.eq("migrationKey", migrationKey))
    .first()
  if (existing) {
    await ctx.db.patch(existing._id, doc)
    return { id: existing._id, action: "updated" as const }
  }
  const id = await ctx.db.insert(table, { ...doc, migrationKey })
  return { id, action: "inserted" as const }
}

// ─────────────────────────────────────────────────────────────
// qsrWeeklyReports
// ─────────────────────────────────────────────────────────────

export const etlUpsertWeeklyReport = internalMutation({
  args: {
    migrationKey: v.string(),
    workspaceId: v.id("workspaces"),
    fileName: v.string(),
    periodStart: v.string(),
    periodEnd: v.string(),
    uploadedBy: v.id("users"),
    uploadedAt: v.number(),
    status: v.union(v.literal("pending"), v.literal("processed"), v.literal("error")),
    validationStatus: v.optional(v.union(v.literal("clean"), v.literal("needs_review"), v.literal("validated"))),
    validationNotes: v.optional(v.array(v.object({
      severity: v.string(), category: v.string(), message: v.string(), tip: v.string(),
    }))),
    expenseCount: v.optional(v.number()),
    salesCount: v.optional(v.number()),
    vendorCount: v.optional(v.number()),
    inventoryCount: v.optional(v.number()),
    leftoverCount: v.optional(v.number()),
    kasPeriodeCount: v.optional(v.number()),
    salesControlCount: v.optional(v.number()),
    creditPurchaseCount: v.optional(v.number()),
    foodCostSummaryCount: v.optional(v.number()),
    transferCount: v.optional(v.number()),
    hppCount: v.optional(v.number()),
    costAnalysisCount: v.optional(v.number()),
    cashFlowCount: v.optional(v.number()),
    incentiveCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { migrationKey, ...doc } = args
    return upsertByMigrationKey(ctx, "qsrWeeklyReports", migrationKey, doc)
  },
})

// ─────────────────────────────────────────────────────────────
// qsrProductHPP
// ─────────────────────────────────────────────────────────────

export const etlUpsertProductHPP = internalMutation({
  args: {
    migrationKey: v.string(),
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    productName: v.string(),
    pricingClass: v.union(
      v.literal("standard"), v.literal("kelas2"),
      v.literal("kelas3a"), v.literal("kelas3b"), v.literal("kelas4"),
    ),
    sellPrice: v.number(),
    totalHPP: v.number(),
    grossMargin: v.optional(v.number()),
    foodCostPercent: v.optional(v.number()),
    ingredients: v.array(v.object({
      ingredientName: v.string(), qty: v.number(), unit: v.string(),
      unitPrice: v.number(), subtotal: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const { migrationKey, ...doc } = args
    return upsertByMigrationKey(ctx, "qsrProductHPP", migrationKey, doc)
  },
})

// ─────────────────────────────────────────────────────────────
// qsrFoodCostSummary
// ─────────────────────────────────────────────────────────────

export const etlUpsertFoodCostSummary = internalMutation({
  args: {
    migrationKey: v.string(),
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    weekStart: v.string(),
    category: v.union(v.literal("food_beverage"), v.literal("paper")),
    openingValue: v.number(),
    transferInValue: v.optional(v.number()),
    purchaseValue: v.number(),
    transferOutValue: v.optional(v.number()),
    closingValue: v.number(),
    usageValue: v.number(),
    netSales: v.optional(v.number()),
    foodCostPercent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { migrationKey, ...doc } = args
    return upsertByMigrationKey(ctx, "qsrFoodCostSummary", migrationKey, doc)
  },
})

// ─────────────────────────────────────────────────────────────
// qsrSalesControl
// ─────────────────────────────────────────────────────────────

export const etlUpsertSalesControl = internalMutation({
  args: {
    migrationKey: v.string(),
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    businessDate: v.string(),
    netSales: v.number(),
    customerCount: v.number(),
    dayaBeli: v.optional(v.number()),
    target: v.number(),
    achievementPercent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { migrationKey, ...doc } = args
    return upsertByMigrationKey(ctx, "qsrSalesControl", migrationKey, doc)
  },
})

// ─────────────────────────────────────────────────────────────
// qsrProductChanges
// ─────────────────────────────────────────────────────────────

export const etlUpsertProductChanges = internalMutation({
  args: {
    migrationKey: v.string(),
    workspaceId: v.id("workspaces"),
    periodLabel: v.string(),
    ingredientName: v.string(),
    expiredDate: v.optional(v.string()),
    unit: v.string(),
    unitPrice: v.number(),
    qty: v.number(),
    ppnAmount: v.optional(v.number()),
    totalPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const { migrationKey, ...doc } = args
    return upsertByMigrationKey(ctx, "qsrProductChanges", migrationKey, doc)
  },
})

// ─────────────────────────────────────────────────────────────
// qsrVendorPurchasesWeekly
// ─────────────────────────────────────────────────────────────

export const etlUpsertVendorPurchasesWeekly = internalMutation({
  args: {
    migrationKey: v.string(),
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    weekStart: v.string(),
    commodityName: v.string(),
    section: v.optional(v.string()),
    openingQty: v.number(),
    openingValue: v.number(),
    purchaseQty: v.number(),
    purchaseValue: v.number(),
    usageQty: v.number(),
    usageValue: v.optional(v.number()),
    closingQty: v.number(),
    closingValue: v.number(),
    prevWeekValue: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { migrationKey, ...doc } = args
    return upsertByMigrationKey(ctx, "qsrVendorPurchasesWeekly", migrationKey, doc)
  },
})

// ─────────────────────────────────────────────────────────────
// qsrDailyProductSales
// ─────────────────────────────────────────────────────────────

export const etlUpsertDailyProductSales = internalMutation({
  args: {
    migrationKey: v.string(),
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    businessDate: v.string(),
    productName: v.string(),
    qty: v.number(),
    amount: v.number(),
    unitPrice: v.number(),
    foodCostItem: v.optional(v.number()),
    channel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { migrationKey, ...doc } = args
    return upsertByMigrationKey(ctx, "qsrDailyProductSales", migrationKey, doc)
  },
})

// ─────────────────────────────────────────────────────────────
// qsrInventoryValuation
// ─────────────────────────────────────────────────────────────

export const etlUpsertInventoryValuation = internalMutation({
  args: {
    migrationKey: v.string(),
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    valuationDate: v.string(),
    category: v.string(),
    itemName: v.string(),
    qty: v.number(),
    unit: v.string(),
    unitPrice: v.number(),
    totalValue: v.number(),
  },
  handler: async (ctx, args) => {
    const { migrationKey, ...doc } = args
    return upsertByMigrationKey(ctx, "qsrInventoryValuation", migrationKey, doc)
  },
})

// ─────────────────────────────────────────────────────────────
// qsrCostAnalysis
// ─────────────────────────────────────────────────────────────

export const etlUpsertCostAnalysis = internalMutation({
  args: {
    migrationKey: v.string(),
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    periodStart: v.string(),
    itemName: v.string(),
    unit: v.optional(v.string()),
    openingQty: v.number(),
    openingValue: v.number(),
    purchaseQty: v.number(),
    purchaseValue: v.number(),
    usageQty: v.number(),
    usageValue: v.number(),
    closingQty: v.number(),
    closingValue: v.number(),
    variance: v.number(),
  },
  handler: async (ctx, args) => {
    const { migrationKey, ...doc } = args
    return upsertByMigrationKey(ctx, "qsrCostAnalysis", migrationKey, doc)
  },
})

// ─────────────────────────────────────────────────────────────
// qsrTransferItems
// ─────────────────────────────────────────────────────────────

export const etlUpsertTransferItems = internalMutation({
  args: {
    migrationKey: v.string(),
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    periodStart: v.string(),
    direction: v.union(v.literal("out"), v.literal("in")),
    category: v.string(),
    itemName: v.string(),
    qty: v.number(),
    unit: v.optional(v.string()),
    totalValue: v.number(),
  },
  handler: async (ctx, args) => {
    const { migrationKey, ...doc } = args
    return upsertByMigrationKey(ctx, "qsrTransferItems", migrationKey, doc)
  },
})

// ─────────────────────────────────────────────────────────────
// qsrCreditPurchases
// ─────────────────────────────────────────────────────────────

export const etlUpsertCreditPurchases = internalMutation({
  args: {
    migrationKey: v.string(),
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    purchaseDate: v.string(),
    supplierName: v.string(),
    itemName: v.string(),
    invoiceNo: v.optional(v.string()),
    qty: v.number(),
    unitPrice: v.number(),
    totalAmount: v.number(),
    dueDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { migrationKey, ...doc } = args
    return upsertByMigrationKey(ctx, "qsrCreditPurchases", migrationKey, doc)
  },
})

// ─────────────────────────────────────────────────────────────
// qsrEmployeeIncentives
// ─────────────────────────────────────────────────────────────

export const etlUpsertEmployeeIncentives = internalMutation({
  args: {
    migrationKey: v.string(),
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    periodStart: v.string(),
    employeeName: v.string(),
    incentiveType: v.string(),
    amount: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { migrationKey, ...doc } = args
    return upsertByMigrationKey(ctx, "qsrEmployeeIncentives", migrationKey, doc)
  },
})

// ─────────────────────────────────────────────────────────────
// qsrLeftoverItems
// ─────────────────────────────────────────────────────────────

export const etlUpsertLeftoverItems = internalMutation({
  args: {
    migrationKey: v.string(),
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    businessDate: v.string(),
    itemName: v.string(),
    qty: v.number(),
  },
  handler: async (ctx, args) => {
    const { migrationKey, ...doc } = args
    return upsertByMigrationKey(ctx, "qsrLeftoverItems", migrationKey, doc)
  },
})

// ─────────────────────────────────────────────────────────────
// qsrPettyCash (LPKK — Laporan Pengeluaran Kas Kecil)
// ─────────────────────────────────────────────────────────────

export const etlUpsertPettyCash = internalMutation({
  args: {
    migrationKey: v.string(),
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    businessDate: v.string(),
    category: v.string(),
    description: v.string(),
    amount: v.number(),
    requestedBy: v.optional(v.string()),
    approvedBy: v.optional(v.string()),
    receiptRef: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { migrationKey, ...doc } = args
    return upsertByMigrationKey(ctx, "qsrPettyCash", migrationKey, doc)
  },
})

// ─────────────────────────────────────────────────────────────
// qsrDailyCashFlow
// ─────────────────────────────────────────────────────────────

export const etlUpsertDailyCashFlow = internalMutation({
  args: {
    migrationKey: v.string(),
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    businessDate: v.string(),
    openingBalance: v.number(),
    salesInflow: v.number(),
    otherInflow: v.number(),
    expenseOutflow: v.number(),
    otherOutflow: v.number(),
    closingBalance: v.number(),
  },
  handler: async (ctx, args) => {
    const { migrationKey, ...doc } = args
    return upsertByMigrationKey(ctx, "qsrDailyCashFlow", migrationKey, doc)
  },
})

// ─────────────────────────────────────────────────────────────
// qsrDailyCashSummary
// ─────────────────────────────────────────────────────────────

export const etlUpsertDailyCashSummary = internalMutation({
  args: {
    migrationKey: v.string(),
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    businessDate: v.string(),
    grossSales: v.number(),
    komisiGofood: v.number(),
    komisiGrabfood: v.number(),
    komisiShopeefood: v.number(),
    koreksi: v.number(),
    discount: v.number(),
    netSales: v.number(),
  },
  handler: async (ctx, args) => {
    const { migrationKey, ...doc } = args
    return upsertByMigrationKey(ctx, "qsrDailyCashSummary", migrationKey, doc)
  },
})

// ─────────────────────────────────────────────────────────────
// ETL completion audit log
// ─────────────────────────────────────────────────────────────

/**
 * Single audit log entry summarizing a completed ETL run.
 * Satisfies AGENTS.md §4 for the per-row internalMutation bypass — call
 * this once at the end of `etl-rc-samata.ts` to record what was migrated.
 */
export const etlLogCompletion = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    actorUserId: v.id("users"),
    sourceTenant: v.string(), // e.g. "rc-samata-dash"
    runId: v.string(),         // e.g. timestamp from etl run report
    phase: v.string(),         // "all" | "4" | "5"
    stats: v.record(v.string(), v.object({
      read: v.number(),
      written: v.number(),
      existed: v.number(),
      errors: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const totalRead = Object.values(args.stats).reduce((a, s) => a + s.read, 0)
    const totalWritten = Object.values(args.stats).reduce((a, s) => a + s.written, 0)
    const totalExisted = Object.values(args.stats).reduce((a, s) => a + s.existed, 0)
    const totalErrors = Object.values(args.stats).reduce((a, s) => a + s.errors, 0)
    return logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: args.actorUserId,
      action: "etl.run.completed",
      resourceType: "qsrWeeklyReports",
      resourceId: args.runId,
      metadata: {
        sourceTenant: args.sourceTenant,
        phase: args.phase,
        runId: args.runId,
        totals: { read: totalRead, written: totalWritten, existed: totalExisted, errors: totalErrors },
        perTable: args.stats,
      },
    })
  },
})

// ─────────────────────────────────────────────────────────────
// User-facing: attach Google Sheet / Drive / Excel URL to a weekly report
// ─────────────────────────────────────────────────────────────

/**
 * Set or clear an attachment URL on a qsrWeeklyReports row. Owners use this
 * to link the source spreadsheet so admins (and themselves) can validate
 * ingested figures against the original file.
 */
export const setWeeklyReportAttachment = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    attachmentUrl: v.optional(v.string()),
    attachmentLabel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, PERMS.ETL_UPLOAD)
    const row = await ctx.db.get(args.reportId)
    if (!row || row.workspaceId !== args.workspaceId) {
      throw new Error("Report not found in this workspace")
    }
    const userId = await ensureUser(ctx)
    await ctx.db.patch(args.reportId, {
      attachmentUrl: args.attachmentUrl,
      attachmentLabel: args.attachmentLabel,
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "qsr.weeklyReport.attachmentSet",
      resourceType: "qsrWeeklyReports",
      resourceId: args.reportId,
      metadata: {
        hasAttachment: !!args.attachmentUrl,
        attachmentLabel: args.attachmentLabel,
      },
    })
    return { id: args.reportId, action: "patched" as const }
  },
})
