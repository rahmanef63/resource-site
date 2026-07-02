import { v } from "convex/values"
import { internalMutation } from "../../_generated/server"
import type { Id } from "../../_generated/dataModel"

/**
 * One-shot migration: copy existing qsr* rows into datasetRecords under
 * matching dataset preset types. Idempotent — externalId = qsr row id +
 * migrationKey, so re-running won't duplicate.
 *
 * Trigger via Convex CLI:
 *   npx convex run features/datasets/migrateQsr:migrateQsrToDatasets \
 *     '{ "workspaceId": "<id>", "presetSlug": "petty-cash-ledger", "limit": 1000 }'
 *
 * Run once per preset slug. Safe to re-run.
 */
const QSR_MAPPINGS: Record<
  string,
  {
    qsrTable: string
    map: (row: Record<string, unknown>) => Record<string, unknown>
  }
> = {
  "petty-cash-ledger": {
    qsrTable: "qsrPettyCash",
    map: (r) => ({
      businessDate: r.businessDate,
      category: r.category,
      description: r.description,
      amount: r.amount,
      requestedBy: r.requestedBy,
      approvedBy: r.approvedBy,
      receiptRef: r.receiptRef,
    }),
  },
  "vendor-purchases": {
    qsrTable: "qsrVendorPurchasesWeekly",
    map: (r) => ({
      weekStart: r.weekStart,
      supplierName: r.supplierName,
      commodityName: r.commodityName,
      section: r.section,
      purchaseQty: r.purchaseQty,
      purchaseValue: r.purchaseValue,
      closingQty: r.closingQty,
      closingValue: r.closingValue,
    }),
  },
  "product-changes": {
    qsrTable: "qsrProductChanges",
    map: (r) => ({
      periodLabel: r.periodLabel,
      businessDate: r.businessDate,
      ingredientName: r.ingredientName,
      expiredDate: r.expiredDate,
      qty: r.qty,
      unit: r.unit,
      unitPrice: r.unitPrice,
      ppnAmount: r.ppnAmount,
      totalPrice: r.totalPrice,
    }),
  },
  "daily-cash-flow": {
    qsrTable: "qsrDailyCashFlow",
    map: (r) => ({
      businessDate: r.businessDate,
      openingBalance: r.openingBalance,
      salesInflow: r.salesInflow,
      otherInflow: r.otherInflow,
      expenseOutflow: r.expenseOutflow,
      otherOutflow: r.otherOutflow,
      closingBalance: r.closingBalance,
    }),
  },
  "credit-purchases": {
    qsrTable: "qsrCreditPurchases",
    map: (r) => ({
      purchaseDate: r.purchaseDate,
      supplierName: r.supplierName,
      itemName: r.itemName,
      invoiceNo: r.invoiceNo,
      qty: r.qty,
      unitPrice: r.unitPrice,
      totalAmount: r.totalAmount,
      dueDate: r.dueDate,
      status: r.status ?? "open",
    }),
  },
  "employee-allowances": {
    qsrTable: "qsrEmployeeIncentives",
    map: (r) => ({
      periodStart: r.periodStart,
      employeeName: r.employeeName,
      incentiveType: r.incentiveType,
      amount: r.amount,
      notes: r.notes,
    }),
  },
}

interface MigrationResult {
  preset: string
  qsrTable: string
  scanned: number
  inserted: number
  updated: number
  skipped: number
  errors: number
  errorMessages: string[]
}

export const migrateQsrToDatasets = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    presetSlug: v.string(),
    datasetName: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<MigrationResult> => {
    const mapping = QSR_MAPPINGS[args.presetSlug]
    if (!mapping) {
      throw new Error(`Unknown preset slug: ${args.presetSlug}. Known: ${Object.keys(QSR_MAPPINGS).join(", ")}`)
    }

    // Find / create the datasetType for this preset.
    const type = await ctx.db
      .query("datasetTypes")
      .withIndex("by_workspace_slug", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("slug", args.presetSlug),
      )
      .first()
    if (!type) {
      throw new Error(
        `Dataset type "${args.presetSlug}" not found in this workspace. Run seedPresetTypes first.`,
      )
    }

    // Find / create the destination dataset.
    let dataset = await ctx.db
      .query("datasets")
      .withIndex("by_workspace_type", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("typeId", type._id),
      )
      .first()
    if (!dataset) {
      const now = Date.now()
      const dsId = await ctx.db.insert("datasets", {
        workspaceId: args.workspaceId,
        typeId: type._id,
        name: args.datasetName ?? `${type.name} (QSR migration)`,
        description: "Auto-created during qsr→datasets migration.",
        status: "active",
        recordCount: 0,
        createdBy: type.createdBy,
        createdAt: now,
        updatedAt: now,
      })
      dataset = (await ctx.db.get(dsId))!
    }

    // Walk qsr table rows (workspace-scoped via by_workspace).
    const limit = Math.min(args.limit ?? 5000, 5000)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (ctx.db as any)
      .query(mapping.qsrTable)
      .withIndex("by_workspace", (q: { eq: (k: string, v: unknown) => unknown }) =>
        q.eq("workspaceId", args.workspaceId),
      )
      .take(limit)

    const result: MigrationResult = {
      preset: args.presetSlug,
      qsrTable: mapping.qsrTable,
      scanned: rows.length,
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      errorMessages: [],
    }

    const now = Date.now()
    const fields = type.fields

    for (const row of rows) {
      const externalId = `qsr:${mapping.qsrTable}:${row._id}`
      const raw = mapping.map(row as Record<string, unknown>)

      // Type-validate against type.fields.
      const out: Record<string, unknown> = {}
      let validationErr: string | null = null
      for (const def of fields) {
        const v = raw[def.key]
        if (v === undefined || v === null || v === "") {
          if (def.required) {
            validationErr = `Missing required ${def.key}`
            break
          }
          continue
        }
        switch (def.type) {
          case "string":
          case "date":
            if (typeof v !== "string") {
              validationErr = `${def.key} must be string`
              break
            }
            out[def.key] = v
            break
          case "number":
          case "currency":
            if (typeof v !== "number" || !Number.isFinite(v)) {
              validationErr = `${def.key} must be finite number`
              break
            }
            out[def.key] = v
            break
          case "boolean":
            if (typeof v !== "boolean") {
              validationErr = `${def.key} must be boolean`
              break
            }
            out[def.key] = v
            break
          case "enum":
            if (typeof v !== "string" || !def.enumValues?.includes(v)) {
              validationErr = `${def.key} not in enum ${def.enumValues?.join("|")}`
              break
            }
            out[def.key] = v
            break
          case "json":
            out[def.key] = v
            break
        }
        if (validationErr) break
      }

      if (validationErr) {
        result.errors++
        if (result.errorMessages.length < 10) {
          result.errorMessages.push(`${row._id}: ${validationErr}`)
        }
        continue
      }

      const periodLabel = type.syncHints?.periodLabelField
        ? (out[type.syncHints.periodLabelField] as string | undefined)
        : undefined
      const businessDate = type.syncHints?.businessDateField
        ? (out[type.syncHints.businessDateField] as string | undefined)
        : undefined

      const existing = await ctx.db
        .query("datasetRecords")
        .withIndex("by_dataset_external", (q) =>
          q.eq("datasetId", dataset!._id).eq("externalId", externalId),
        )
        .first()

      if (existing) {
        await ctx.db.patch(existing._id, {
          fields: out,
          periodLabel,
          businessDate,
          updatedAt: now,
        })
        result.updated++
      } else {
        await ctx.db.insert("datasetRecords", {
          workspaceId: args.workspaceId,
          datasetId: dataset._id,
          typeId: type._id,
          externalId,
          periodLabel,
          businessDate,
          fields: out,
          source: "etl",
          createdAt: now,
          updatedAt: now,
        })
        result.inserted++
      }
    }

    if (result.inserted > 0) {
      await ctx.db.patch(dataset._id, {
        recordCount: (dataset.recordCount ?? 0) + result.inserted,
        lastRecordAt: now,
        updatedAt: now,
      })
    }

    return result
  },
})
