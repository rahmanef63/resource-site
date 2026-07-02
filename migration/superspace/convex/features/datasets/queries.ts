import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireMembership } from "../../shared/auth"

export const listDatasetTypes = query({
  args: {
    workspaceId: v.id("workspaces"),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.workspaceId)
    if (args.category) {
      const cat = args.category
      return ctx.db
        .query("datasetTypes")
        .withIndex("by_workspace_category", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("category", cat),
        )
        .order("desc")
        .take(200)
    }
    return ctx.db
      .query("datasetTypes")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(200)
  },
})

export const getDatasetType = query({
  args: { id: v.id("datasetTypes") },
  handler: async (ctx, args) => {
    const type = await ctx.db.get(args.id)
    if (!type) return null
    await requireMembership(ctx, type.workspaceId)
    return type
  },
})

export const getDatasetTypeBySlug = query({
  args: {
    workspaceId: v.id("workspaces"),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.workspaceId)
    return ctx.db
      .query("datasetTypes")
      .withIndex("by_workspace_slug", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("slug", args.slug),
      )
      .first()
  },
})

export const listDatasets = query({
  args: {
    workspaceId: v.id("workspaces"),
    typeId: v.optional(v.id("datasetTypes")),
  },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.workspaceId)
    if (args.typeId) {
      const typeId = args.typeId
      return ctx.db
        .query("datasets")
        .withIndex("by_workspace_type", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("typeId", typeId),
        )
        .order("desc")
        .take(200)
    }
    return ctx.db
      .query("datasets")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(200)
  },
})

export const getDataset = query({
  args: { id: v.id("datasets") },
  handler: async (ctx, args) => {
    const dataset = await ctx.db.get(args.id)
    if (!dataset) return null
    await requireMembership(ctx, dataset.workspaceId)
    return dataset
  },
})

export const listDatasetRecords = query({
  args: {
    datasetId: v.id("datasets"),
    fromDate: v.optional(v.string()),
    toDate: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const dataset = await ctx.db.get(args.datasetId)
    if (!dataset) return []
    await requireMembership(ctx, dataset.workspaceId)
    const limit = Math.min(args.limit ?? 200, 500)
    const fromDate = args.fromDate
    const toDate = args.toDate

    const rows = await ctx.db
      .query("datasetRecords")
      .withIndex("by_dataset_date", (q) => {
        const base = q.eq("datasetId", args.datasetId)
        return fromDate ? base.gte("businessDate", fromDate) : base
      })
      .order("desc")
      .take(limit)
    return toDate ? rows.filter((r) => (r.businessDate ?? "") <= toDate) : rows
  },
})

export const getRecordByExternalId = query({
  args: {
    datasetId: v.id("datasets"),
    externalId: v.string(),
  },
  handler: async (ctx, args) => {
    const dataset = await ctx.db.get(args.datasetId)
    if (!dataset) return null
    await requireMembership(ctx, dataset.workspaceId)
    return ctx.db
      .query("datasetRecords")
      .withIndex("by_dataset_external", (q) =>
        q.eq("datasetId", args.datasetId).eq("externalId", args.externalId),
      )
      .first()
  },
})
