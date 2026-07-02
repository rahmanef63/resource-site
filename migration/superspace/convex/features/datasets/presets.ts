import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requirePermission } from "../../shared/auth"
import { logAuditEvent } from "../../shared/audit"

/**
 * Built-in dataset type templates. A workspace owner can seed any
 * subset into their workspace via `seedPresetTypes`. Each preset is
 * generic — the rc-samata weekly Excel maps onto these without any
 * rc-samata-specific table/field.
 */
type FieldDef = {
  key: string
  label: string
  type: "string" | "number" | "currency" | "date" | "boolean" | "enum" | "json"
  required?: boolean
  indexed?: boolean
  enumValues?: string[]
  description?: string
}
type Preset = {
  name: string
  description: string
  category: string
  fields: FieldDef[]
  syncHints?: {
    externalIdField?: string
    periodLabelField?: string
    businessDateField?: string
  }
}
const PRESETS: Record<string, Preset> = {
  "weekly-sales-report": {
    name: "Weekly Sales Report",
    description: "Per-period revenue, channel commissions, discounts, and net sales.",
    category: "finance",
    fields: [
      { key: "periodStart", label: "Period start", type: "date", required: true },
      { key: "periodEnd", label: "Period end", type: "date", required: true },
      { key: "businessDate", label: "Business date", type: "date" },
      { key: "branchName", label: "Branch", type: "string" },
      { key: "grossSales", label: "Gross sales", type: "currency", required: true },
      { key: "discount", label: "Discount", type: "currency" },
      { key: "channelCommission", label: "Channel commission", type: "currency" },
      { key: "correction", label: "Correction", type: "currency" },
      { key: "netSales", label: "Net sales", type: "currency", required: true },
      { key: "notes", label: "Notes", type: "string" },
    ],
    syncHints: {
      externalIdField: "periodStart",
      periodLabelField: "periodStart",
      businessDateField: "businessDate",
    },
  },
  "petty-cash-ledger": {
    name: "Petty Cash Ledger",
    description: "Small-cash disbursements per branch and period.",
    category: "finance",
    fields: [
      { key: "businessDate", label: "Date", type: "date", required: true },
      { key: "branchName", label: "Branch", type: "string" },
      { key: "category", label: "Category", type: "string", required: true },
      { key: "description", label: "Description", type: "string", required: true },
      { key: "amount", label: "Amount", type: "currency", required: true },
      { key: "requestedBy", label: "Requested by", type: "string" },
      { key: "approvedBy", label: "Approved by", type: "string" },
      { key: "receiptRef", label: "Receipt #", type: "string" },
    ],
    syncHints: {
      businessDateField: "businessDate",
    },
  },
  "vendor-purchases": {
    name: "Vendor Purchases",
    description: "Inventory purchases by commodity, section, and supplier.",
    category: "inventory",
    fields: [
      { key: "weekStart", label: "Week start", type: "date", required: true },
      { key: "supplierName", label: "Supplier", type: "string", required: true },
      { key: "commodityName", label: "Commodity", type: "string", required: true },
      { key: "section", label: "Section", type: "string" },
      { key: "purchaseQty", label: "Qty", type: "number", required: true },
      { key: "purchaseValue", label: "Value", type: "currency", required: true },
      { key: "closingQty", label: "Closing qty", type: "number" },
      { key: "closingValue", label: "Closing value", type: "currency" },
    ],
    syncHints: {
      periodLabelField: "weekStart",
    },
  },
  "product-changes": {
    name: "Product Changes / Waste",
    description: "Daily ingredient replacements, waste, and write-offs.",
    category: "inventory",
    fields: [
      { key: "periodLabel", label: "Period", type: "string", required: true },
      { key: "businessDate", label: "Date", type: "date" },
      { key: "ingredientName", label: "Ingredient", type: "string", required: true },
      { key: "expiredDate", label: "Expired", type: "date" },
      { key: "qty", label: "Qty", type: "number", required: true },
      { key: "unit", label: "Unit", type: "string", required: true },
      { key: "unitPrice", label: "Unit price", type: "currency" },
      { key: "ppnAmount", label: "PPN", type: "currency" },
      { key: "totalPrice", label: "Total", type: "currency", required: true },
    ],
    syncHints: {
      periodLabelField: "periodLabel",
      businessDateField: "businessDate",
    },
  },
  "daily-cash-flow": {
    name: "Daily Cash Flow",
    description: "Opening, inflows, outflows, and closing balance per day.",
    category: "finance",
    fields: [
      { key: "businessDate", label: "Date", type: "date", required: true },
      { key: "openingBalance", label: "Opening", type: "currency", required: true },
      { key: "salesInflow", label: "Sales inflow", type: "currency" },
      { key: "otherInflow", label: "Other inflow", type: "currency" },
      { key: "expenseOutflow", label: "Expense outflow", type: "currency" },
      { key: "otherOutflow", label: "Other outflow", type: "currency" },
      { key: "closingBalance", label: "Closing", type: "currency", required: true },
    ],
    syncHints: {
      externalIdField: "businessDate",
      businessDateField: "businessDate",
    },
  },
  "credit-purchases": {
    name: "Credit Purchases (Payables)",
    description: "Vendor credit purchases tracked until paid.",
    category: "finance",
    fields: [
      { key: "purchaseDate", label: "Purchase date", type: "date", required: true },
      { key: "supplierName", label: "Supplier", type: "string", required: true },
      { key: "itemName", label: "Item", type: "string" },
      { key: "invoiceNo", label: "Invoice #", type: "string" },
      { key: "qty", label: "Qty", type: "number" },
      { key: "unitPrice", label: "Unit price", type: "currency" },
      { key: "totalAmount", label: "Total", type: "currency", required: true },
      { key: "dueDate", label: "Due", type: "date" },
      { key: "status", label: "Status", type: "enum", enumValues: ["open", "paid", "overdue", "cancelled"] },
    ],
    syncHints: {
      externalIdField: "invoiceNo",
      businessDateField: "purchaseDate",
    },
  },
  "employee-allowances": {
    name: "Employee Allowances / Incentives",
    description: "Per-employee incentives and allowances per period.",
    category: "hr",
    fields: [
      { key: "periodStart", label: "Period start", type: "date", required: true },
      { key: "employeeName", label: "Employee", type: "string", required: true },
      { key: "incentiveType", label: "Type", type: "string", required: true },
      { key: "amount", label: "Amount", type: "currency", required: true },
      { key: "notes", label: "Notes", type: "string" },
    ],
    syncHints: {
      periodLabelField: "periodStart",
    },
  },
}

export const seedPresetTypes = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    presetSlugs: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const membership = await requirePermission(ctx, args.workspaceId, "workspace.manage")
    const selected = args.presetSlugs ?? Object.keys(PRESETS)
    const now = Date.now()
    let inserted = 0
    let skipped = 0

    for (const slug of selected) {
      const preset = PRESETS[slug]
      if (!preset) {
        skipped++
        continue
      }
      const dup = await ctx.db
        .query("datasetTypes")
        .withIndex("by_workspace_slug", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("slug", slug),
        )
        .first()
      if (dup) {
        skipped++
        continue
      }
      await ctx.db.insert("datasetTypes", {
        workspaceId: args.workspaceId,
        slug,
        name: preset.name,
        description: preset.description,
        category: preset.category,
        schemaVersion: 1,
        fields: preset.fields.map((f) => ({ ...f })),
        syncHints: preset.syncHints,
        createdBy: membership.userDocId,
        createdAt: now,
        updatedAt: now,
      })
      inserted++
    }

    await logAuditEvent(ctx, {
      action: "dataset.presets.seeded",
      workspaceId: args.workspaceId,
      actorUserId: membership.userDocId,
      metadata: { inserted, skipped, selected },
    })
    return { inserted, skipped, available: Object.keys(PRESETS) }
  },
})

export const listPresets = mutation({
  args: {},
  handler: async () => {
    return Object.entries(PRESETS).map(([slug, p]) => ({
      slug,
      name: p.name,
      description: p.description,
      category: p.category,
      fieldCount: p.fields.length,
    }))
  },
})
