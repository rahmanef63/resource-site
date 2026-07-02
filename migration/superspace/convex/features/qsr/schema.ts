/**
 * QSR (Quick Service Restaurant) feature schema.
 *
 * Industry-specific tables that don't fit the generic accounting/inventory/sales
 * features. Originally built for rc-samata-dash franchise (Rocket Chicken).
 *
 * Source: see docs/merge-playbook/sources/rc-samata-dash/etl-mapping-spec.md
 * Risks closed by this module: #11, #12, #13, #14, plus partial #15, #16.
 *
 * All tables are workspace-scoped (multi-tenant). All have `migrationKey`
 * for ETL idempotency.
 */

import { defineTable } from "convex/server"
import { v } from "convex/values"

export const qsrTables = {
  /**
   * Parent record per uploaded weekly Excel file.
   * Children (qsrProductSales/qsrVendorPurchases/etc) FK back via reportId.
   */
  qsrWeeklyReports: defineTable({
    workspaceId: v.id("workspaces"),
    fileName: v.string(),
    periodStart: v.string(), // YYYY-MM-DD
    periodEnd: v.string(),
    uploadedBy: v.id("users"),
    uploadedAt: v.number(),
    status: v.union(v.literal("pending"), v.literal("processed"), v.literal("error")),
    validationStatus: v.optional(v.union(v.literal("clean"), v.literal("needs_review"), v.literal("validated"))),
    validationNotes: v.optional(v.array(v.object({
      severity: v.string(),
      category: v.string(),
      message: v.string(),
      tip: v.string(),
    }))),
    // Sheet-level row counts (denormalized for quick display)
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
    // Attachment for owner validation — paste Google Sheet / Drive / Excel URL
    attachmentUrl: v.optional(v.string()),
    attachmentLabel: v.optional(v.string()),
    migrationKey: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_period", ["workspaceId", "periodStart"])
    .index("by_migration_key", ["migrationKey"]),

  /**
   * Recipe-based product cost (HPP) per pricing class.
   * Source: parseHPPProduk; sheets HITUNGAN HPP PRODUK + FOOD COST ITEM KELAS 2/3A/3B/4.
   */
  qsrProductHPP: defineTable({
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    productName: v.string(),
    pricingClass: v.union(
      v.literal("standard"),
      v.literal("kelas2"),
      v.literal("kelas3a"),
      v.literal("kelas3b"),
      v.literal("kelas4"),
    ),
    sellPrice: v.number(),
    totalHPP: v.number(),
    grossMargin: v.optional(v.number()),
    foodCostPercent: v.optional(v.number()),
    /** Recipe ingredients embedded as inline JSON (typically 5-15 items). */
    ingredients: v.array(v.object({
      ingredientName: v.string(),
      qty: v.number(),
      unit: v.string(),
      unitPrice: v.number(),
      subtotal: v.number(),
    })),
    migrationKey: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_report", ["reportId"])
    .index("by_workspace_class", ["workspaceId", "pricingClass"])
    .index("by_migration_key", ["migrationKey"]),

  /**
   * Weekly food cost summary per category (F&B, PAPER).
   * Source: parseIkhtisarFC; sheet IKHTISAR FOOD COST.
   */
  qsrFoodCostSummary: defineTable({
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
    /** Food cost percentage = (usage / netSales) × 100 */
    foodCostPercent: v.optional(v.number()),
    migrationKey: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_report", ["reportId"])
    .index("by_workspace_week", ["workspaceId", "weekStart"])
    .index("by_migration_key", ["migrationKey"]),

  /**
   * Daily MTD (month-to-date) sales control vs target.
   * Source: parseSalesControl; sheet SALES CONTROL.
   * Each row = one calendar day with cumulative MTD figures.
   */
  qsrSalesControl: defineTable({
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    businessDate: v.string(), // YYYY-MM-DD
    netSales: v.number(),
    customerCount: v.number(),
    /** Daya beli = spending power per customer = netSales / customerCount */
    dayaBeli: v.optional(v.number()),
    target: v.number(),
    achievementPercent: v.optional(v.number()),
    migrationKey: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_report", ["reportId"])
    .index("by_workspace_date", ["workspaceId", "businessDate"])
    .index("by_migration_key", ["migrationKey"]),

  /**
   * Product/ingredient substitution log.
   * Source: parseProductChanges; standalone file PERGANTIAN PRODUK.
   * Empty in rc-samata source as of 2026-05-06 but schema kept for future.
   */
  qsrProductChanges: defineTable({
    workspaceId: v.id("workspaces"),
    periodLabel: v.string(), // e.g. "22-31 JANUARI 2026"
    ingredientName: v.string(),
    expiredDate: v.optional(v.string()),
    unit: v.string(),
    unitPrice: v.number(),
    qty: v.number(),
    ppnAmount: v.optional(v.number()),
    totalPrice: v.number(),
    migrationKey: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_period", ["workspaceId", "periodLabel"])
    .index("by_migration_key", ["migrationKey"]),

  /**
   * Vendor purchase weekly snapshot (open/purchase/usage/closing per commodity).
   * Source: parseVendor; sheet VENDOR (3 lembar, 9 sections).
   * Closes risk #16 — preserves snapshot fidelity that doesn't fit transactional purchaseOrderItems.
   */
  qsrVendorPurchasesWeekly: defineTable({
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    weekStart: v.string(),
    commodityName: v.string(),
    section: v.optional(v.string()), // AYAM | PELENGKAP | BAHAN ES | MINUMAN | PEMBUNGKUS | MINYAK | GROCERIES | LAIN-LAIN | OTHERS
    openingQty: v.number(),
    openingValue: v.number(),
    purchaseQty: v.number(),
    purchaseValue: v.number(),
    usageQty: v.number(),
    usageValue: v.optional(v.number()),
    closingQty: v.number(),
    closingValue: v.number(),
    prevWeekValue: v.optional(v.number()),
    migrationKey: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_report", ["reportId"])
    .index("by_workspace_week", ["workspaceId", "weekStart"])
    .index("by_migration_key", ["migrationKey"]),

  /**
   * Daily product sales aggregate (preserves daily granularity for reporting).
   * Source: parsePenjualan + parsePlatformSales.
   * Closes risk #15 — keeps daily-aggregate fidelity that doesn't fit transactional posTransactions.
   * Per-transaction data still lands in pos.posTransactions for live operations.
   */
  qsrDailyProductSales: defineTable({
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    businessDate: v.string(),
    productName: v.string(),
    qty: v.number(),
    amount: v.number(),
    unitPrice: v.number(),
    foodCostItem: v.optional(v.number()),
    /** Channel: all|grabfood|gofood|shopeefood|tambahan */
    channel: v.optional(v.string()),
    migrationKey: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_report", ["reportId"])
    .index("by_workspace_date", ["workspaceId", "businessDate"])
    .index("by_report_channel", ["reportId", "channel"])
    .index("by_migration_key", ["migrationKey"]),

  /**
   * Weekly inventory valuation per item (qty × unit price).
   * Source: parseWeeklyFC; sheet WEEKLY FC.
   * Closes risk #15-extension — preserves snapshot fidelity (lossy in inventory.inventoryAudits).
   */
  qsrInventoryValuation: defineTable({
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    valuationDate: v.string(),
    category: v.string(),
    itemName: v.string(),
    qty: v.number(),
    unit: v.string(),
    unitPrice: v.number(),
    totalValue: v.number(),
    migrationKey: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_report", ["reportId"])
    .index("by_workspace_date", ["workspaceId", "valuationDate"])
    .index("by_migration_key", ["migrationKey"]),

  /**
   * Per-item cost variance analysis (opening + purchase - closing - usage).
   * Source: parseCostAnalysis; sheet COST ANALYSIS.
   */
  qsrCostAnalysis: defineTable({
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
    migrationKey: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_report", ["reportId"])
    .index("by_workspace_period", ["workspaceId", "periodStart"])
    .index("by_migration_key", ["migrationKey"]),

  /**
   * Inter-section transfer items (perkedel/catering/staff meal/free items).
   * Source: parseTransferTOTI; sheet TO - TI (6 side-by-side sections).
   */
  qsrTransferItems: defineTable({
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    periodStart: v.string(),
    direction: v.union(v.literal("out"), v.literal("in")),
    /** PERKEDEL | CATTERING_STAFF | FREE_UNDIAN | CHICKEN_PATTY | PERKEDEL_MANUAL | CATTERING_KHUSUS */
    category: v.string(),
    itemName: v.string(),
    qty: v.number(),
    unit: v.optional(v.string()),
    totalValue: v.number(),
    migrationKey: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_report", ["reportId"])
    .index("by_workspace_period", ["workspaceId", "periodStart"])
    .index("by_migration_key", ["migrationKey"]),

  /**
   * Credit purchases from suppliers (with due date).
   * Source: parsePembelianKredit; sheet PEMBELIAN KREDIT.
   */
  qsrCreditPurchases: defineTable({
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
    migrationKey: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_report", ["reportId"])
    .index("by_workspace_date", ["workspaceId", "purchaseDate"])
    .index("by_migration_key", ["migrationKey"]),

  /**
   * Employee performance incentives.
   * Source: parseInsentif; sheet INSENTIF.
   */
  qsrEmployeeIncentives: defineTable({
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    periodStart: v.string(),
    employeeName: v.string(),
    incentiveType: v.string(),
    amount: v.number(),
    notes: v.optional(v.string()),
    migrationKey: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_report", ["reportId"])
    .index("by_workspace_period", ["workspaceId", "periodStart"])
    .index("by_migration_key", ["migrationKey"]),

  /**
   * Daily leftover/spoilage qty per item.
   * Source: parseLeftOver; sheet LEFT OVER.
   */
  qsrLeftoverItems: defineTable({
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    businessDate: v.string(),
    itemName: v.string(),
    qty: v.number(),
    migrationKey: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_report", ["reportId"])
    .index("by_workspace_date", ["workspaceId", "businessDate"])
    .index("by_migration_key", ["migrationKey"]),

  /**
   * Daily cash flow ledger (opening/inflow/outflow/closing).
   * Source: parseLapCF; sheet LAP. CF.
   */
  qsrDailyCashFlow: defineTable({
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    businessDate: v.string(),
    openingBalance: v.number(),
    salesInflow: v.number(),
    otherInflow: v.number(),
    expenseOutflow: v.number(),
    otherOutflow: v.number(),
    closingBalance: v.number(),
    migrationKey: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_report", ["reportId"])
    .index("by_workspace_date", ["workspaceId", "businessDate"])
    .index("by_migration_key", ["migrationKey"]),

  /**
   * Daily cash summary with platform commission breakdown.
   * Source: parseLaporanKasPeriode; sheet LAPORAN KAS PERIODE.
   */
  qsrDailyCashSummary: defineTable({
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
    migrationKey: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_report", ["reportId"])
    .index("by_workspace_date", ["workspaceId", "businessDate"])
    .index("by_migration_key", ["migrationKey"]),

  /**
   * Petty cash (small-cash) requests — LPKK sheet (Laporan Pengeluaran Kas Kecil).
   * One row per disbursement line in the weekly LPKK section.
   * Source: parseLPKK; sheet "LPKK".
   */
  qsrPettyCash: defineTable({
    workspaceId: v.id("workspaces"),
    reportId: v.id("qsrWeeklyReports"),
    businessDate: v.string(),
    category: v.string(),
    description: v.string(),
    amount: v.number(),
    requestedBy: v.optional(v.string()),
    approvedBy: v.optional(v.string()),
    receiptRef: v.optional(v.string()),
    migrationKey: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_report", ["reportId"])
    .index("by_workspace_date", ["workspaceId", "businessDate"])
    .index("by_migration_key", ["migrationKey"]),

}

export default qsrTables
