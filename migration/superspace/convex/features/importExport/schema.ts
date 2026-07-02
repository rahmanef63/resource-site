/**
 * Import/Export Feature Schema
 * Provides import/export history tracking
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const importExportTables = {
  // Bulk workspace migration jobs
  bulkMigrations: defineTable({
    userId: v.id("users"),
    manifestName: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("partial"),
      v.literal("failed"),
      v.literal("rolled_back")
    ),
    totalWorkspaces: v.number(),
    createdWorkspaces: v.number(),
    failedWorkspaces: v.number(),
    workspaceResults: v.array(
      v.object({
        localId: v.string(),
        workspaceId: v.optional(v.id("workspaces")),
        name: v.string(),
        status: v.union(
          v.literal("created"),
          v.literal("failed"),
          v.literal("skipped"),
          v.literal("rolled_back")
        ),
        error: v.optional(v.string()),
      })
    ),
    manifestSnapshot: v.optional(v.string()), // JSON string for rollback
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // Import/Export history
  importExportHistory: defineTable({
    type: v.union(v.literal("import"), v.literal("export")),
    entityType: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    fileName: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    format: v.string(),
    recordCount: v.optional(v.number()),
    successCount: v.optional(v.number()),
    errorCount: v.optional(v.number()),
    errors: v.optional(v.array(v.object({
      row: v.optional(v.number()),
      field: v.optional(v.string()),
      message: v.string(),
    }))),
    options: v.optional(v.record(v.string(), v.any())),
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"]),

  // ────────────────────────────────────────────────────────────────────
  // ETL — weekly report ingestion (ported/adapted from rc-samata-dash)
  // workspaceId-scoped, RBAC-gated, audit-logged.
  // ────────────────────────────────────────────────────────────────────

  /** Header per uploaded file. */
  etlReports: defineTable({
    workspaceId: v.id("workspaces"),
    branchId: v.optional(v.string()),
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
    salesCount: v.optional(v.number()),
    vendorCount: v.optional(v.number()),
    inventoryCount: v.optional(v.number()),
    cashFlowCount: v.optional(v.number()),
    leftoverCount: v.optional(v.number()),
    error: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_period", ["workspaceId", "periodStart"]),

  /** Daily product sales rows. */
  etlProductSales: defineTable({
    workspaceId: v.id("workspaces"),
    reportId: v.id("etlReports"),
    businessDate: v.string(),
    productName: v.string(),
    qty: v.number(),
    amount: v.number(),
    unitPrice: v.number(),
    foodCostItem: v.optional(v.number()),
    channel: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_report", ["reportId"])
    .index("by_workspace_date", ["workspaceId", "businessDate"]),

  /** Weekly commodity / vendor purchases. */
  etlVendorPurchases: defineTable({
    workspaceId: v.id("workspaces"),
    reportId: v.id("etlReports"),
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
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_report", ["reportId"]),

  /** Daily cash flow snapshots. */
  etlCashFlow: defineTable({
    workspaceId: v.id("workspaces"),
    reportId: v.id("etlReports"),
    businessDate: v.string(),
    openingBalance: v.number(),
    salesInflow: v.number(),
    otherInflow: v.number(),
    expenseOutflow: v.number(),
    otherOutflow: v.number(),
    closingBalance: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_report", ["reportId"])
    .index("by_workspace_date", ["workspaceId", "businessDate"]),

  /** Inventory valuation snapshots. */
  etlInventoryValuation: defineTable({
    workspaceId: v.id("workspaces"),
    reportId: v.id("etlReports"),
    valuationDate: v.string(),
    category: v.string(),
    itemName: v.string(),
    qty: v.number(),
    unit: v.string(),
    unitPrice: v.number(),
    totalValue: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_report", ["reportId"]),

  /** Daily leftover / spoilage. */
  etlLeftOver: defineTable({
    workspaceId: v.id("workspaces"),
    reportId: v.id("etlReports"),
    businessDate: v.string(),
    itemName: v.string(),
    leftoverQty: v.number(),
    note: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_report", ["reportId"]),
};

export default importExportTables;
