import { v } from "convex/values"
import { mutation, query } from "../../_generated/server"
import { requirePermission, requireMembership } from "../../shared/auth"
import { logAuditEvent } from "../../shared/audit"

const MAX_NAME_LENGTH = 80
const MAX_MAPPINGS_PER_DATASET = 20

export const upsertMapping = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    id: v.optional(v.id("datasetIngestMappings")),
    datasetId: v.id("datasets"),
    name: v.string(),
    description: v.optional(v.string()),
    fieldMap: v.record(v.string(), v.union(v.string(), v.null())),
    sourceSample: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const membership = await requirePermission(ctx, args.workspaceId, "workspace.manage")
    if (!args.name || args.name.length > MAX_NAME_LENGTH) {
      throw new Error("Name must be 1..80 characters")
    }
    const dataset = await ctx.db.get(args.datasetId)
    if (!dataset || dataset.workspaceId !== args.workspaceId) {
      throw new Error("Dataset not found in this workspace")
    }
    const type = await ctx.db.get(dataset.typeId)
    if (!type) throw new Error("Dataset type missing — schema is broken")

    // Validate: every non-null targetKey exists in the type schema, AND
    // every required target field has at least one source mapped to it.
    const targetKeys = new Set(type.fields.map((f) => f.key))
    const mappedTargets = new Set<string>()
    for (const [source, target] of Object.entries(args.fieldMap)) {
      if (target == null) continue
      if (!targetKeys.has(target)) {
        throw new Error(`Target field "${target}" does not exist on dataset type "${type.name}"`)
      }
      if (mappedTargets.has(target)) {
        throw new Error(`Target field "${target}" is mapped from multiple source keys`)
      }
      mappedTargets.add(target)
    }
    const missingRequired = type.fields
      .filter((f) => f.required && !mappedTargets.has(f.key))
      .map((f) => f.key)
    if (missingRequired.length > 0) {
      throw new Error(`Required fields not mapped: ${missingRequired.join(", ")}`)
    }

    const now = Date.now()
    if (args.id) {
      const existing = await ctx.db.get(args.id)
      if (!existing || existing.workspaceId !== args.workspaceId) {
        throw new Error("Mapping not found")
      }
      await ctx.db.patch(args.id, {
        name: args.name,
        description: args.description,
        fieldMap: args.fieldMap,
        sourceSample: args.sourceSample,
        updatedAt: now,
      })
      await logAuditEvent(ctx, {
        action: "dataset.mapping.updated",
        workspaceId: args.workspaceId,
        actorUserId: membership.userDocId,
        target: { type: "datasetIngestMappings", id: String(args.id) },
        metadata: { name: args.name, datasetId: String(args.datasetId) },
      })
      return { id: args.id }
    }

    const count = await ctx.db
      .query("datasetIngestMappings")
      .withIndex("by_dataset", (q) => q.eq("datasetId", args.datasetId))
      .take(MAX_MAPPINGS_PER_DATASET + 1)
    if (count.length >= MAX_MAPPINGS_PER_DATASET) {
      throw new Error(`Max ${MAX_MAPPINGS_PER_DATASET} mappings per dataset`)
    }

    const id = await ctx.db.insert("datasetIngestMappings", {
      workspaceId: args.workspaceId,
      datasetId: args.datasetId,
      name: args.name,
      description: args.description,
      fieldMap: args.fieldMap,
      sourceSample: args.sourceSample,
      createdBy: membership.userDocId,
      createdAt: now,
      updatedAt: now,
    })
    await logAuditEvent(ctx, {
      action: "dataset.mapping.created",
      workspaceId: args.workspaceId,
      actorUserId: membership.userDocId,
      target: { type: "datasetIngestMappings", id: String(id) },
      metadata: { name: args.name, datasetId: String(args.datasetId) },
    })
    return { id }
  },
})

export const deleteMapping = mutation({
  args: { id: v.id("datasetIngestMappings") },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id)
    if (!row) throw new Error("Mapping not found")
    const membership = await requirePermission(ctx, row.workspaceId, "workspace.manage")
    await ctx.db.delete(args.id)
    await logAuditEvent(ctx, {
      action: "dataset.mapping.deleted",
      workspaceId: row.workspaceId,
      actorUserId: membership.userDocId,
      target: { type: "datasetIngestMappings", id: String(args.id) },
    })
    return { ok: true }
  },
})

export const listMappingsForDataset = query({
  args: { datasetId: v.id("datasets") },
  handler: async (ctx, args) => {
    const dataset = await ctx.db.get(args.datasetId)
    if (!dataset) return []
    await requireMembership(ctx, dataset.workspaceId)
    return ctx.db
      .query("datasetIngestMappings")
      .withIndex("by_dataset", (q) => q.eq("datasetId", args.datasetId))
      .order("desc")
      .take(50)
  },
})

export const getMapping = query({
  args: { id: v.id("datasetIngestMappings") },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id)
    if (!row) return null
    await requireMembership(ctx, row.workspaceId)
    return row
  },
})

/**
 * Auto-suggest mapping by case-insensitive substring match between
 * source keys and target field keys/labels. Used by the connect-data
 * dialog before the user (optionally) refines.
 */
export const suggestMapping = query({
  args: {
    datasetId: v.id("datasets"),
    sourceSample: v.string(),
  },
  handler: async (ctx, args) => {
    const dataset = await ctx.db.get(args.datasetId)
    if (!dataset) throw new Error("Dataset not found")
    await requireMembership(ctx, dataset.workspaceId)
    const type = await ctx.db.get(dataset.typeId)
    if (!type) throw new Error("Dataset type missing")

    let sourceObj: Record<string, unknown> = {}
    try {
      const parsed = JSON.parse(args.sourceSample)
      if (Array.isArray(parsed)) {
        sourceObj = (parsed[0] ?? {}) as Record<string, unknown>
      } else if (parsed && typeof parsed === "object") {
        sourceObj = parsed as Record<string, unknown>
      }
    } catch {
      throw new Error("Sample is not valid JSON")
    }

    const sourceKeys = Object.keys(sourceObj)
    const suggestion: Record<string, string | null> = {}
    const usedTargets = new Set<string>()

    for (const src of sourceKeys) {
      const norm = src.toLowerCase().replace(/[_-]/g, "")
      let best: { key: string; score: number } | null = null
      for (const def of type.fields) {
        if (usedTargets.has(def.key)) continue
        const a = def.key.toLowerCase().replace(/[_-]/g, "")
        const b = def.label.toLowerCase().replace(/\s/g, "")
        const score = a === norm ? 100 : b === norm ? 95 : a.includes(norm) || norm.includes(a) ? 60 : b.includes(norm) || norm.includes(b) ? 50 : 0
        if (score > (best?.score ?? 0)) {
          best = { key: def.key, score }
        }
      }
      if (best && best.score >= 50) {
        suggestion[src] = best.key
        usedTargets.add(best.key)
      } else {
        suggestion[src] = null
      }
    }

    const requiredKeys = type.fields.filter((f) => f.required).map((f) => f.key)
    return {
      suggestion,
      schema: {
        fields: type.fields.map((f) => ({
          key: f.key,
          label: f.label,
          type: f.type,
          required: f.required ?? false,
        })),
      },
      requiredKeys,
      missingRequired: requiredKeys.filter((k) => !usedTargets.has(k)),
    }
  },
})

/**
 * Dry-run preview — apply a mapping (or just raw) to a source sample and
 * return how the records would land. Does NOT write.
 */
export const previewMapping = query({
  args: {
    datasetId: v.id("datasets"),
    fieldMap: v.optional(v.record(v.string(), v.union(v.string(), v.null()))),
    sourceSample: v.string(),
  },
  handler: async (ctx, args) => {
    const dataset = await ctx.db.get(args.datasetId)
    if (!dataset) throw new Error("Dataset not found")
    await requireMembership(ctx, dataset.workspaceId)
    const type = await ctx.db.get(dataset.typeId)
    if (!type) throw new Error("Dataset type missing")

    let rows: Record<string, unknown>[] = []
    try {
      const parsed = JSON.parse(args.sourceSample)
      if (Array.isArray(parsed)) rows = parsed as Record<string, unknown>[]
      else if (parsed && typeof parsed === "object") rows = [parsed as Record<string, unknown>]
    } catch {
      return { ok: false, error: "Sample is not valid JSON", previews: [] }
    }

    const map = args.fieldMap ?? null
    const previews = rows.slice(0, 20).map((raw, idx) => {
      const mapped: Record<string, unknown> = {}
      if (map) {
        for (const [src, tgt] of Object.entries(map)) {
          if (!tgt) continue
          if (src in raw) mapped[tgt] = raw[src]
        }
      } else {
        Object.assign(mapped, raw)
      }
      // Validation pass.
      const errors: string[] = []
      const out: Record<string, unknown> = {}
      for (const def of type.fields) {
        const v = mapped[def.key]
        if (v === undefined || v === null || v === "") {
          if (def.required) errors.push(`Missing required ${def.key}`)
          continue
        }
        switch (def.type) {
          case "string":
          case "date":
            if (typeof v !== "string") errors.push(`${def.key} must be string`)
            else out[def.key] = v
            break
          case "number":
          case "currency":
            if (typeof v !== "number" || !Number.isFinite(v)) {
              errors.push(`${def.key} must be a finite number`)
            } else {
              out[def.key] = v
            }
            break
          case "boolean":
            if (typeof v !== "boolean") errors.push(`${def.key} must be boolean`)
            else out[def.key] = v
            break
          case "enum":
            if (typeof v !== "string" || !def.enumValues?.includes(v)) {
              errors.push(`${def.key} not in ${def.enumValues?.join("|")}`)
            } else {
              out[def.key] = v
            }
            break
          case "json":
            out[def.key] = v
            break
        }
      }
      return {
        index: idx,
        source: raw,
        mapped: out,
        errors,
        wouldInsert: errors.length === 0,
      }
    })

    return {
      ok: true,
      previews,
      totalParsed: rows.length,
      previewLimit: 20,
    }
  },
})
