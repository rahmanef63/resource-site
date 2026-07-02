import { query } from "../../_generated/server"
import { v } from "convex/values"
import { requireActiveMembership } from "../../auth/helpers"

export const getCollections = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    
    return await ctx.db
      .query("cms_collections")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(1000)
  },
})

export const getCollectionBySlug = query({
  args: {
    workspaceId: v.id("workspaces"),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    
    return await ctx.db
      .query("cms_collections")
      .withIndex("by_slug", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("slug", args.slug)
      )
      .first()
  },
})

export const listEntries = query({
  args: {
    workspaceId: v.id("workspaces"),
    collectionId: v.id("cms_collections"),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
    locale: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    
    let query = ctx.db
      .query("cms_entries")
      .withIndex("by_collection", (q) => q.eq("collectionId", args.collectionId))
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status))
    }
    
    if (args.locale) {
      query = query.filter((q) => q.eq(q.field("locale"), args.locale))
    }
    
    const entries = await query.take(5000)
    
    if (args.limit) {
      return entries.slice(0, args.limit)
    }
    
    return entries
  },
})

export const getEntryBySlug = query({
  args: {
    workspaceId: v.id("workspaces"),
    collectionId: v.id("cms_collections"),
    slug: v.string(),
    draft: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    
    const status = args.draft ? "draft" : "published"
    
    return await ctx.db
      .query("cms_entries")
      .withIndex("by_slug", (q) =>
        q.eq("collectionId", args.collectionId).eq("slug", args.slug)
      )
      .filter((q) => q.eq(q.field("status"), status))
      .first()
  },
})

export const getGlobals = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    
    return await ctx.db
      .query("cms_globals")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(1000)
  },
})

export const getGlobalBySlug = query({
  args: {
    workspaceId: v.id("workspaces"),
    slug: v.string(),
    draft: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    
    const global = await ctx.db
      .query("cms_globals")
      .withIndex("by_slug", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("slug", args.slug)
      )
      .first()
    
    if (!global) return null
    
    const status = args.draft ? "draft" : "published"
    
    const data = await ctx.db
      .query("cms_global_data")
      .withIndex("by_globalstatus", (q) =>
        q.eq("globalId", global._id).eq("status", status)
      )
      .first()
    
    return { ...global, data: data?.data }
  },
})

export const getVersions = query({
  args: {
    workspaceId: v.id("workspaces"),
    targetType: v.union(v.literal("entry"), v.literal("global")),
    targetId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    
    const versions = await ctx.db
      .query("cms_versions")
      .withIndex("by_target", (q) =>
        q.eq("targetType", args.targetType).eq("targetId", args.targetId)
      )
      .take(1000)
    
    const sorted = versions.sort((a, b) => b.versionNumber - a.versionNumber)
    
    if (args.limit) {
      return sorted.slice(0, args.limit)
    }
    
    return sorted
  },
})

export const getMediaAssets = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    
    const assets = await ctx.db
      .query("cms_media_assets")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)
    
    if (args.limit) {
      return assets.slice(0, args.limit)
    }
    
    return assets
  },
})
