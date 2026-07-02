import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import type { Doc, Id } from "../../_generated/dataModel"
import { requirePermission, requireMembership } from "../../shared/auth"
import { logAuditEvent } from "../../shared/audit"

const SLUG_RE = /^[a-z][a-z0-9-]{1,63}$/
const MAX_FIELDS = 64
const MAX_RECORDS_PER_DATASET = 100_000

interface FieldDef {
  key: string
  label: string
  type: "string" | "number" | "currency" | "date" | "boolean" | "enum" | "json"
  required?: boolean
  indexed?: boolean
  enumValues?: string[]
  description?: string
}

function validateFieldDefs(fields: FieldDef[]): void {
  if (fields.length === 0) throw new Error("At least one field is required")
  if (fields.length > MAX_FIELDS) throw new Error(`Too many fields (max ${MAX_FIELDS})`)
  const seen = new Set<string>()
  for (const f of fields) {
    if (!/^[a-z][a-zA-Z0-9_]*$/.test(f.key)) {
      throw new Error(`Field key "${f.key}" must be camelCase`)
    }
    if (seen.has(f.key)) throw new Error(`Duplicate field key: ${f.key}`)
    seen.add(f.key)
    if (f.type === "enum" && (!f.enumValues || f.enumValues.length === 0)) {
      throw new Error(`Enum field "${f.key}" requires enumValues`)
    }
  }
}

/**
 * Validates a record's fields object against the type's schema.
 * Returns the validated/coerced fields, or throws.
 */
function validateRecordFields(
  type: Doc<"datasetTypes">,
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const def of type.fields) {
    const v = raw[def.key]
    if (v === undefined || v === null || v === "") {
      if (def.required) throw new Error(`Missing required field: ${def.key}`)
      continue
    }
    switch (def.type) {
      case "string":
      case "date":
        if (typeof v !== "string") throw new Error(`Field ${def.key} must be string`)
        out[def.key] = v
        break
      case "number":
      case "currency":
        if (typeof v !== "number" || !Number.isFinite(v)) {
          throw new Error(`Field ${def.key} must be a finite number`)
        }
        out[def.key] = v
        break
      case "boolean":
        if (typeof v !== "boolean") throw new Error(`Field ${def.key} must be boolean`)
        out[def.key] = v
        break
      case "enum":
        if (typeof v !== "string" || !def.enumValues?.includes(v)) {
          throw new Error(`Field ${def.key} must be one of: ${def.enumValues?.join(", ")}`)
        }
        out[def.key] = v
        break
      case "json":
        out[def.key] = v
        break
    }
  }
  return out
}

// ─────────────────────────────────────────────────────────────
// Dataset Types (schema CRUD)
// ─────────────────────────────────────────────────────────────

export const upsertDatasetType = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    id: v.optional(v.id("datasetTypes")),
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    fields: v.array(
      v.object({
        key: v.string(),
        label: v.string(),
        type: v.union(
          v.literal("string"),
          v.literal("number"),
          v.literal("currency"),
          v.literal("date"),
          v.literal("boolean"),
          v.literal("enum"),
          v.literal("json"),
        ),
        required: v.optional(v.boolean()),
        indexed: v.optional(v.boolean()),
        enumValues: v.optional(v.array(v.string())),
        description: v.optional(v.string()),
      }),
    ),
    syncHints: v.optional(
      v.object({
        externalIdField: v.optional(v.string()),
        periodLabelField: v.optional(v.string()),
        businessDateField: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const membership = await requirePermission(ctx, args.workspaceId, "workspace.manage")
    if (!SLUG_RE.test(args.slug)) throw new Error("Invalid slug (kebab-case, 2..64 chars)")
    validateFieldDefs(args.fields as FieldDef[])

    const now = Date.now()
    if (args.id) {
      const existing = await ctx.db.get(args.id)
      if (!existing || existing.workspaceId !== args.workspaceId) {
        throw new Error("Dataset type not found")
      }
      const schemaChanged = JSON.stringify(existing.fields) !== JSON.stringify(args.fields)
      await ctx.db.patch(args.id, {
        slug: args.slug,
        name: args.name,
        description: args.description,
        category: args.category,
        fields: args.fields,
        syncHints: args.syncHints,
        schemaVersion: schemaChanged ? existing.schemaVersion + 1 : existing.schemaVersion,
        updatedAt: now,
      })
      await logAuditEvent(ctx, {
        action: "dataset.type.updated",
        workspaceId: args.workspaceId,
        actorUserId: membership.userDocId,
        target: { type: "datasetTypes", id: String(args.id) },
        metadata: { slug: args.slug, schemaChanged },
      })
      return { id: args.id, schemaChanged }
    }

    const dup = await ctx.db
      .query("datasetTypes")
      .withIndex("by_workspace_slug", (q) => q.eq("workspaceId", args.workspaceId).eq("slug", args.slug))
      .first()
    if (dup) throw new Error(`Slug "${args.slug}" already exists in this workspace`)

    const id = await ctx.db.insert("datasetTypes", {
      workspaceId: args.workspaceId,
      slug: args.slug,
      name: args.name,
      description: args.description,
      category: args.category,
      schemaVersion: 1,
      fields: args.fields,
      syncHints: args.syncHints,
      createdBy: membership.userDocId,
      createdAt: now,
      updatedAt: now,
    })
    await logAuditEvent(ctx, {
      action: "dataset.type.created",
      workspaceId: args.workspaceId,
      actorUserId: membership.userDocId,
      target: { type: "datasetTypes", id: String(id) },
      metadata: { slug: args.slug, fieldCount: args.fields.length },
    })
    return { id, schemaChanged: false }
  },
})

export const deleteDatasetType = mutation({
  args: { id: v.id("datasetTypes") },
  handler: async (ctx, args) => {
    const type = await ctx.db.get(args.id)
    if (!type) throw new Error("Dataset type not found")
    const membership = await requirePermission(ctx, type.workspaceId, "workspace.manage")
    // Refuse delete if any datasets reference this type.
    const refs = await ctx.db
      .query("datasets")
      .withIndex("by_workspace_type", (q) => q.eq("workspaceId", type.workspaceId).eq("typeId", args.id))
      .take(1)
    if (refs.length > 0) {
      throw new Error("Cannot delete — datasets still reference this type. Archive or migrate them first.")
    }
    await ctx.db.delete(args.id)
    await logAuditEvent(ctx, {
      action: "dataset.type.deleted",
      workspaceId: type.workspaceId,
      actorUserId: membership.userDocId,
      target: { type: "datasetTypes", id: String(args.id) },
      metadata: { slug: type.slug },
    })
    return { ok: true }
  },
})

// ─────────────────────────────────────────────────────────────
// Datasets (workspace instances of a type)
// ─────────────────────────────────────────────────────────────

export const upsertDataset = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    id: v.optional(v.id("datasets")),
    typeId: v.id("datasetTypes"),
    name: v.string(),
    description: v.optional(v.string()),
    sourceId: v.optional(v.id("workspaceDataSources")),
    status: v.optional(
      v.union(v.literal("active"), v.literal("paused"), v.literal("archived")),
    ),
  },
  handler: async (ctx, args) => {
    const membership = await requirePermission(ctx, args.workspaceId, "workspace.manage")
    const type = await ctx.db.get(args.typeId)
    if (!type || type.workspaceId !== args.workspaceId) {
      throw new Error("Dataset type not found in this workspace")
    }
    if (args.sourceId) {
      const source = await ctx.db.get(args.sourceId)
      if (!source || source.workspaceId !== args.workspaceId) {
        throw new Error("Data source not found in this workspace")
      }
    }

    const now = Date.now()
    if (args.id) {
      const existing = await ctx.db.get(args.id)
      if (!existing || existing.workspaceId !== args.workspaceId) {
        throw new Error("Dataset not found")
      }
      await ctx.db.patch(args.id, {
        name: args.name,
        description: args.description,
        sourceId: args.sourceId,
        status: args.status ?? existing.status,
        updatedAt: now,
      })
      await logAuditEvent(ctx, {
        action: "dataset.updated",
        workspaceId: args.workspaceId,
        actorUserId: membership.userDocId,
        target: { type: "datasets", id: String(args.id) },
      })
      return { id: args.id }
    }

    const id = await ctx.db.insert("datasets", {
      workspaceId: args.workspaceId,
      typeId: args.typeId,
      name: args.name,
      description: args.description,
      sourceId: args.sourceId,
      status: args.status ?? "active",
      recordCount: 0,
      createdBy: membership.userDocId,
      createdAt: now,
      updatedAt: now,
    })
    await logAuditEvent(ctx, {
      action: "dataset.created",
      workspaceId: args.workspaceId,
      actorUserId: membership.userDocId,
      target: { type: "datasets", id: String(id) },
      metadata: { typeId: String(args.typeId), name: args.name },
    })
    return { id }
  },
})

export const deleteDataset = mutation({
  args: { id: v.id("datasets"), cascade: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const dataset = await ctx.db.get(args.id)
    if (!dataset) throw new Error("Dataset not found")
    const membership = await requirePermission(ctx, dataset.workspaceId, "workspace.manage")

    if (args.cascade) {
      // Delete records in pages.
      let deleted = 0
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const page = await ctx.db
          .query("datasetRecords")
          .withIndex("by_dataset", (q) => q.eq("datasetId", args.id))
          .take(200)
        if (page.length === 0) break
        for (const row of page) {
          await ctx.db.delete(row._id)
          deleted++
        }
        if (page.length < 200) break
      }
      await logAuditEvent(ctx, {
        action: "dataset.records.cascadeDeleted",
        workspaceId: dataset.workspaceId,
        actorUserId: membership.userDocId,
        target: { type: "datasets", id: String(args.id) },
        metadata: { deleted },
      })
    } else {
      const sample = await ctx.db
        .query("datasetRecords")
        .withIndex("by_dataset", (q) => q.eq("datasetId", args.id))
        .take(1)
      if (sample.length > 0) {
        throw new Error("Dataset has records. Pass cascade: true to delete them too.")
      }
    }

    await ctx.db.delete(args.id)
    await logAuditEvent(ctx, {
      action: "dataset.deleted",
      workspaceId: dataset.workspaceId,
      actorUserId: membership.userDocId,
      target: { type: "datasets", id: String(args.id) },
      metadata: { name: dataset.name },
    })
    return { ok: true }
  },
})

// ─────────────────────────────────────────────────────────────
// Records (the actual data)
// ─────────────────────────────────────────────────────────────

export const upsertDatasetRecord = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    datasetId: v.id("datasets"),
    externalId: v.optional(v.string()),
    fields: v.record(v.string(), v.any()),
    source: v.optional(
      v.union(v.literal("ui"), v.literal("etl"), v.literal("api"), v.literal("sync")),
    ),
  },
  handler: async (ctx, args) => {
    // Membership is sufficient for write (permission is per-dataset via type creation);
    // tighten to a per-dataset permission later if needed.
    const membership = await requireMembership(ctx, args.workspaceId)
    const dataset = await ctx.db.get(args.datasetId)
    if (!dataset || dataset.workspaceId !== args.workspaceId) {
      throw new Error("Dataset not found in this workspace")
    }
    if (dataset.status === "archived") {
      throw new Error("Dataset is archived — writes blocked")
    }
    const type = await ctx.db.get(dataset.typeId)
    if (!type) throw new Error("Dataset type missing — schema is broken")

    const validatedFields = validateRecordFields(type, args.fields)

    const periodLabel = type.syncHints?.periodLabelField
      ? (validatedFields[type.syncHints.periodLabelField] as string | undefined)
      : undefined
    const businessDate = type.syncHints?.businessDateField
      ? (validatedFields[type.syncHints.businessDateField] as string | undefined)
      : undefined

    const now = Date.now()

    // Idempotent upsert by externalId.
    if (args.externalId) {
      const existing = await ctx.db
        .query("datasetRecords")
        .withIndex("by_dataset_external", (q) =>
          q.eq("datasetId", args.datasetId).eq("externalId", args.externalId),
        )
        .first()
      if (existing) {
        await ctx.db.patch(existing._id, {
          fields: validatedFields,
          periodLabel,
          businessDate,
          updatedAt: now,
        })
        await logAuditEvent(ctx, {
          action: "datasets.record.upserted",
          workspaceId: args.workspaceId,
          actorUserId: membership.userDocId,
          target: { type: "datasetRecords", id: String(existing._id) },
          metadata: { datasetId: String(args.datasetId), created: false },
        })
        return { id: existing._id, created: false }
      }
    }

    // Cap to prevent runaway.
    const count = dataset.recordCount ?? 0
    if (count >= MAX_RECORDS_PER_DATASET) {
      throw new Error(`Dataset has hit the ${MAX_RECORDS_PER_DATASET}-record cap`)
    }

    const id = await ctx.db.insert("datasetRecords", {
      workspaceId: args.workspaceId,
      datasetId: args.datasetId,
      typeId: dataset.typeId,
      externalId: args.externalId,
      periodLabel,
      businessDate,
      fields: validatedFields,
      source: args.source ?? "ui",
      createdAt: now,
      updatedAt: now,
    })

    await ctx.db.patch(args.datasetId, {
      recordCount: count + 1,
      lastRecordAt: now,
      updatedAt: now,
    })

    await logAuditEvent(ctx, {
      action: "datasets.record.upserted",
      workspaceId: args.workspaceId,
      actorUserId: membership.userDocId,
      target: { type: "datasetRecords", id: String(id) },
      metadata: { datasetId: String(args.datasetId), created: true },
    })

    return { id, created: true }
  },
})

export const deleteDatasetRecord = mutation({
  args: { id: v.id("datasetRecords") },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id)
    if (!row) throw new Error("Record not found")
    const membership = await requirePermission(ctx, row.workspaceId, "workspace.manage")
    await ctx.db.delete(args.id)
    const dataset = await ctx.db.get(row.datasetId)
    if (dataset) {
      await ctx.db.patch(row.datasetId, {
        recordCount: Math.max(0, (dataset.recordCount ?? 1) - 1),
        updatedAt: Date.now(),
      })
    }
    await logAuditEvent(ctx, {
      action: "dataset.record.deleted",
      workspaceId: row.workspaceId,
      actorUserId: membership.userDocId,
      target: { type: "datasetRecords", id: String(args.id) },
    })
    return { ok: true }
  },
})

// ─────────────────────────────────────────────────────────────
// Bulk ingest helper (for ETL / sync)
// ─────────────────────────────────────────────────────────────

interface BulkResult {
  inserted: number
  updated: number
  skipped: number
  errors: { externalId?: string; message: string }[]
}

export const bulkUpsertRecords = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    datasetId: v.id("datasets"),
    records: v.array(
      v.object({
        externalId: v.optional(v.string()),
        fields: v.record(v.string(), v.any()),
      }),
    ),
    source: v.optional(
      v.union(v.literal("ui"), v.literal("etl"), v.literal("api"), v.literal("sync")),
    ),
  },
  handler: async (ctx, args): Promise<BulkResult> => {
    const membership = await requireMembership(ctx, args.workspaceId)
    const dataset = await ctx.db.get(args.datasetId)
    if (!dataset || dataset.workspaceId !== args.workspaceId) {
      throw new Error("Dataset not found in this workspace")
    }
    if (dataset.status === "archived") {
      throw new Error("Dataset is archived — writes blocked")
    }
    const type = await ctx.db.get(dataset.typeId)
    if (!type) throw new Error("Dataset type missing — schema is broken")

    if (args.records.length > 500) {
      throw new Error("Max 500 records per bulkUpsert call")
    }

    const now = Date.now()
    const out: BulkResult = { inserted: 0, updated: 0, skipped: 0, errors: [] }
    let countDelta = 0

    for (const rec of args.records) {
      let validatedFields: Record<string, unknown>
      try {
        validatedFields = validateRecordFields(type, rec.fields)
      } catch (err) {
        out.errors.push({
          externalId: rec.externalId,
          message: err instanceof Error ? err.message : "Unknown validation error",
        })
        out.skipped++
        continue
      }
      const periodLabel = type.syncHints?.periodLabelField
        ? (validatedFields[type.syncHints.periodLabelField] as string | undefined)
        : undefined
      const businessDate = type.syncHints?.businessDateField
        ? (validatedFields[type.syncHints.businessDateField] as string | undefined)
        : undefined

      let existing: Doc<"datasetRecords"> | null = null
      if (rec.externalId) {
        existing = await ctx.db
          .query("datasetRecords")
          .withIndex("by_dataset_external", (q) =>
            q.eq("datasetId", args.datasetId).eq("externalId", rec.externalId),
          )
          .first()
      }
      if (existing) {
        await ctx.db.patch(existing._id, {
          fields: validatedFields,
          periodLabel,
          businessDate,
          updatedAt: now,
        })
        out.updated++
      } else {
        await ctx.db.insert("datasetRecords", {
          workspaceId: args.workspaceId,
          datasetId: args.datasetId,
          typeId: dataset.typeId,
          externalId: rec.externalId,
          periodLabel,
          businessDate,
          fields: validatedFields,
          source: args.source ?? "sync",
          createdAt: now,
          updatedAt: now,
        })
        out.inserted++
        countDelta++
      }
    }

    if (countDelta > 0) {
      await ctx.db.patch(args.datasetId, {
        recordCount: (dataset.recordCount ?? 0) + countDelta,
        lastRecordAt: now,
        updatedAt: now,
      })
    }

    await logAuditEvent(ctx, {
      action: "datasets.record.bulkUpserted",
      workspaceId: args.workspaceId,
      actorUserId: membership.userDocId,
      target: { type: "datasets", id: String(args.datasetId) },
      metadata: {
        total: args.records.length,
        inserted: out.inserted,
        updated: out.updated,
        skipped: out.skipped,
        errorCount: out.errors.length,
      },
    })

    return out
  },
})
