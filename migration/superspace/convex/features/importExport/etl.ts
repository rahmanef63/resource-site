/**
 * ETL — weekly report ingestion mutations + queries.
 *
 * Adapted from rc-samata-dash convex/features/reports/. Workspace-scoped,
 * RBAC-gated via PERMS.ETL_*, every write logs an audit event.
 */

import { v } from "convex/values";
import { mutation, query } from "../../_generated/server";
import { ensureUser, requireActiveMembership, requirePermission } from "../../auth/helpers";
import { logAuditEvent } from "../../shared/audit";
import { PERMS } from "../../workspace/permissions";

const productSaleItem = v.object({
  businessDate: v.string(),
  productName: v.string(),
  qty: v.number(),
  amount: v.number(),
  unitPrice: v.number(),
  foodCostItem: v.optional(v.number()),
  channel: v.optional(v.string()),
});

const vendorPurchaseItem = v.object({
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
});

const cashFlowItem = v.object({
  businessDate: v.string(),
  openingBalance: v.number(),
  salesInflow: v.number(),
  otherInflow: v.number(),
  expenseOutflow: v.number(),
  otherOutflow: v.number(),
  closingBalance: v.number(),
});

const inventoryItem = v.object({
  valuationDate: v.string(),
  category: v.string(),
  itemName: v.string(),
  qty: v.number(),
  unit: v.string(),
  unitPrice: v.number(),
  totalValue: v.number(),
});

const leftoverItem = v.object({
  businessDate: v.string(),
  itemName: v.string(),
  leftoverQty: v.number(),
  note: v.optional(v.string()),
});

const validationNote = v.object({
  severity: v.string(),
  category: v.string(),
  message: v.string(),
  tip: v.string(),
});

export const createReport = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    branchId: v.optional(v.string()),
    fileName: v.string(),
    periodStart: v.string(),
    periodEnd: v.string(),
    validationNotes: v.optional(v.array(validationNote)),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);
    await requirePermission(ctx, args.workspaceId, PERMS.ETL_UPLOAD);
    const userId = await ensureUser(ctx);

    const status = "pending" as const;
    const validationStatus = (args.validationNotes ?? []).some((n) => n.severity === "warning")
      ? ("needs_review" as const)
      : ("clean" as const);

    const id = await ctx.db.insert("etlReports", {
      workspaceId: args.workspaceId,
      branchId: args.branchId,
      fileName: args.fileName,
      periodStart: args.periodStart,
      periodEnd: args.periodEnd,
      uploadedBy: userId,
      uploadedAt: Date.now(),
      status,
      validationStatus,
      validationNotes: args.validationNotes,
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "etl.report.created",
      resourceType: "etlReports",
      resourceId: id,
    });

    return { id };
  },
});

export const importSalesBatch = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    reportId: v.id("etlReports"),
    items: v.array(productSaleItem),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);
    await requirePermission(ctx, args.workspaceId, PERMS.ETL_UPLOAD);
    const userId = await ensureUser(ctx);

    const report = await ctx.db.get(args.reportId);
    if (!report || report.workspaceId !== args.workspaceId) {
      throw new Error("Report not found");
    }

    await Promise.all(args.items.map((item) =>
      ctx.db.insert("etlProductSales", {
        workspaceId: args.workspaceId,
        reportId: args.reportId,
        ...item,
      }),
    ));
    const inserted = args.items.length;

    await ctx.db.patch(args.reportId, {
      salesCount: (report.salesCount ?? 0) + inserted,
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "etl.sales.imported",
      resourceType: "etlReports",
      resourceId: args.reportId,
      metadata: { count: inserted },
    });

    return { inserted };
  },
});

export const importVendorBatch = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    reportId: v.id("etlReports"),
    items: v.array(vendorPurchaseItem),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);
    await requirePermission(ctx, args.workspaceId, PERMS.ETL_UPLOAD);
    const userId = await ensureUser(ctx);

    const report = await ctx.db.get(args.reportId);
    if (!report || report.workspaceId !== args.workspaceId) throw new Error("Report not found");

    await Promise.all(args.items.map((item) =>
      ctx.db.insert("etlVendorPurchases", {
        workspaceId: args.workspaceId,
        reportId: args.reportId,
        ...item,
      }),
    ));
    await ctx.db.patch(args.reportId, { vendorCount: (report.vendorCount ?? 0) + args.items.length });
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "etl.vendor.imported",
      resourceType: "etlReports",
      resourceId: args.reportId,
      metadata: { count: args.items.length },
    });
    return { inserted: args.items.length };
  },
});

export const importCashFlowBatch = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    reportId: v.id("etlReports"),
    items: v.array(cashFlowItem),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);
    await requirePermission(ctx, args.workspaceId, PERMS.ETL_UPLOAD);
    const userId = await ensureUser(ctx);

    const report = await ctx.db.get(args.reportId);
    if (!report || report.workspaceId !== args.workspaceId) throw new Error("Report not found");

    await Promise.all(args.items.map((item) =>
      ctx.db.insert("etlCashFlow", {
        workspaceId: args.workspaceId,
        reportId: args.reportId,
        ...item,
      }),
    ));
    await ctx.db.patch(args.reportId, { cashFlowCount: (report.cashFlowCount ?? 0) + args.items.length });
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "etl.cashflow.imported",
      resourceType: "etlReports",
      resourceId: args.reportId,
      metadata: { count: args.items.length },
    });
    return { inserted: args.items.length };
  },
});

export const importInventoryBatch = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    reportId: v.id("etlReports"),
    items: v.array(inventoryItem),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);
    await requirePermission(ctx, args.workspaceId, PERMS.ETL_UPLOAD);
    const userId = await ensureUser(ctx);

    const report = await ctx.db.get(args.reportId);
    if (!report || report.workspaceId !== args.workspaceId) throw new Error("Report not found");

    await Promise.all(args.items.map((item) =>
      ctx.db.insert("etlInventoryValuation", {
        workspaceId: args.workspaceId,
        reportId: args.reportId,
        ...item,
      }),
    ));
    await ctx.db.patch(args.reportId, { inventoryCount: (report.inventoryCount ?? 0) + args.items.length });
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "etl.inventory.imported",
      resourceType: "etlReports",
      resourceId: args.reportId,
      metadata: { count: args.items.length },
    });
    return { inserted: args.items.length };
  },
});

export const importLeftoverBatch = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    reportId: v.id("etlReports"),
    items: v.array(leftoverItem),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);
    await requirePermission(ctx, args.workspaceId, PERMS.ETL_UPLOAD);
    const userId = await ensureUser(ctx);

    const report = await ctx.db.get(args.reportId);
    if (!report || report.workspaceId !== args.workspaceId) throw new Error("Report not found");

    await Promise.all(args.items.map((item) =>
      ctx.db.insert("etlLeftOver", {
        workspaceId: args.workspaceId,
        reportId: args.reportId,
        ...item,
      }),
    ));
    await ctx.db.patch(args.reportId, { leftoverCount: (report.leftoverCount ?? 0) + args.items.length });
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "etl.leftover.imported",
      resourceType: "etlReports",
      resourceId: args.reportId,
      metadata: { count: args.items.length },
    });
    return { inserted: args.items.length };
  },
});

export const finalizeReport = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    reportId: v.id("etlReports"),
    status: v.union(v.literal("processed"), v.literal("error")),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);
    await requirePermission(ctx, args.workspaceId, PERMS.ETL_UPLOAD);
    const userId = await ensureUser(ctx);

    const report = await ctx.db.get(args.reportId);
    if (!report || report.workspaceId !== args.workspaceId) throw new Error("Report not found");

    await ctx.db.patch(args.reportId, { status: args.status, error: args.error });
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "etl.report.finalized",
      resourceType: "etlReports",
      resourceId: args.reportId,
      metadata: { status: args.status },
    });
    return { id: args.reportId };
  },
});

export const deleteReport = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    reportId: v.id("etlReports"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);
    await requirePermission(ctx, args.workspaceId, PERMS.ETL_DELETE);
    const userId = await ensureUser(ctx);

    const report = await ctx.db.get(args.reportId);
    if (!report || report.workspaceId !== args.workspaceId) throw new Error("Report not found");

    const tables = ["etlProductSales", "etlVendorPurchases", "etlCashFlow", "etlInventoryValuation", "etlLeftOver"] as const;
    const allRows = await Promise.all(
      tables.map((t) =>
        ctx.db
          .query(t)
          .withIndex("by_report", (q) => q.eq("reportId", args.reportId))
          .take(5000),
      ),
    );
    await Promise.all(allRows.flat().map((row) => ctx.db.delete(row._id)));
    await ctx.db.delete(args.reportId);

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "etl.report.deleted",
      resourceType: "etlReports",
      resourceId: args.reportId,
    });
    return { success: true };
  },
});

export const listReports = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);
    await requirePermission(ctx, args.workspaceId, PERMS.ETL_VIEW);

    return await ctx.db
      .query("etlReports")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(args.limit ?? 50);
  },
});

export const getReport = query({
  args: {
    workspaceId: v.id("workspaces"),
    reportId: v.id("etlReports"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);
    await requirePermission(ctx, args.workspaceId, PERMS.ETL_VIEW);

    const report = await ctx.db.get(args.reportId);
    if (!report || report.workspaceId !== args.workspaceId) return null;
    return report;
  },
});

export const reportStats = query({
  args: {
    workspaceId: v.id("workspaces"),
    reportId: v.id("etlReports"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);
    await requirePermission(ctx, args.workspaceId, PERMS.ETL_VIEW);

    const report = await ctx.db.get(args.reportId);
    if (!report || report.workspaceId !== args.workspaceId) return null;

    return {
      sales: report.salesCount ?? 0,
      vendor: report.vendorCount ?? 0,
      inventory: report.inventoryCount ?? 0,
      cashFlow: report.cashFlowCount ?? 0,
      leftover: report.leftoverCount ?? 0,
    };
  },
});
