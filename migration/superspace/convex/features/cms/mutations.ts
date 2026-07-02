import { mutation } from "../../_generated/server"
import { v } from "convex/values"
import { requirePermission, ensureUser } from "../../auth/helpers"
import { PERMISSIONS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"
import { nextCounterValue } from "../../shared/counters"


export const createCollection = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    slug: v.string(),
    label: v.string(),
    fields: v.array(v.record(v.string(), v.any())),
    access: v.optional(v.record(v.string(), v.any())),
    draftsEnabled: v.optional(v.boolean()),
    versionsMaxPerDoc: v.optional(v.number()),
    localization: v.optional(v.object({
      enabled: v.boolean(),
      locales: v.array(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    await requirePermission(
      ctx,
      args.workspaceId,
      PERMISSIONS.SCHEMAS_CREATE
    )

    const existing = await ctx.db
      .query("cms_collections")
      .withIndex("by_slug", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("slug", args.slug)
      )
      .first()

    if (existing) {
      throw new Error(`Collection with slug "${args.slug}" already exists`)
    }

    const now = Date.now()
    const id = await ctx.db.insert("cms_collections", {
      workspaceId: args.workspaceId,
      slug: args.slug,
      label: args.label,
      fields: args.fields,
      access: args.access,
      draftsEnabled: args.draftsEnabled ?? true,
      versionsMaxPerDoc: args.versionsMaxPerDoc,
      localization: args.localization,
      isActive: true,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "cms_collection.created",
      resourceType: "cms_collection",
      resourceId: id,
      metadata: { slug: args.slug, label: args.label },
    })
    
    return id
  },
})

export const updateCollection = mutation({
  args: {
    id: v.id("cms_collections"),
    workspaceId: v.id("workspaces"),
    label: v.optional(v.string()),
    fields: v.optional(v.array(v.record(v.string(), v.any()))),
    access: v.optional(v.record(v.string(), v.any())),
    draftsEnabled: v.optional(v.boolean()),
    versionsMaxPerDoc: v.optional(v.number()),
    localization: v.optional(v.object({
      enabled: v.boolean(),
      locales: v.array(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    await requirePermission(
      ctx,
      args.workspaceId,
      PERMISSIONS.SCHEMAS_UPDATE
    
    )
    
    const { id, workspaceId, ...updates } = args
    
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })
    
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "cms_collection.updated",
      resourceType: "cms_collection",
      resourceId: id,
    })
    
    return id
  },
})

export const deleteCollection = mutation({
  args: {
    id: v.id("cms_collections"),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    await requirePermission(
      ctx,
      args.workspaceId,
      PERMISSIONS.SCHEMAS_DELETE
    
    )
    
    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    })
    
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "cms_collection.deleted",
      resourceType: "cms_collection",
      resourceId: args.id,
    })
    
    return args.id
  },
})

export const createEntry = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    collectionId: v.id("cms_collections"),
    slug: v.optional(v.string()),
    data: v.any(),
    draft: v.optional(v.boolean()),
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    await requirePermission(
      ctx,
      args.workspaceId,
      PERMISSIONS.DOCUMENTS_CREATE
    
    )
    
    if (args.slug) {
      const existing = await ctx.db
        .query("cms_entries")
        .withIndex("by_slug", (q) =>
          q.eq("collectionId", args.collectionId).eq("slug", args.slug)
        )
        .first()
      
      if (existing) {
        throw new Error(`Entry with slug "${args.slug}" already exists`)
      }
    }
    
    const now = Date.now()
    const status = args.draft ? "draft" : "published"
    
    const id = await ctx.db.insert("cms_entries", {
      workspaceId: args.workspaceId,
      collectionId: args.collectionId,
      slug: args.slug,
      data: args.data,
      status: status,
      publishedAt: status === "published" ? now : undefined,
      locale: args.locale,
      createdBy: userId,
      updatedBy: userId,
      createdAt: now,
      updatedAt: now,
    })
    
    const collection = await ctx.db.get(args.collectionId)
    if (collection?.versionsMaxPerDoc !== 0) {
      await ctx.db.insert("cms_versions", {
        workspaceId: args.workspaceId,
        targetType: "entry",
        targetId: id,
        versionNumber: 1,
        snapshot: args.data,
        isDraft: status === "draft",
        createdBy: userId,
        createdAt: now,
      })
    }
    
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "cms_entry.created",
      resourceType: "cms_entry",
      resourceId: id,
      metadata: { collectionId: args.collectionId, slug: args.slug },
    })
    
    return id
  },
})

export const updateEntry = mutation({
  args: {
    id: v.id("cms_entries"),
    workspaceId: v.id("workspaces"),
    data: v.any(),
    draft: v.optional(v.boolean()),
    changeSummary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    await requirePermission(
      ctx,
      args.workspaceId,
      PERMISSIONS.DOCUMENTS_UPDATE
    
    )
    
    const entry = await ctx.db.get(args.id)
    if (!entry) {
      throw new Error("Entry not found")
    }
    
    const now = Date.now()
    const status = args.draft ? "draft" : entry.status
    
    await ctx.db.patch(args.id, {
      data: args.data,
      status: status,
      updatedBy: userId,
      updatedAt: now,
    })
    
    const collection = await ctx.db.get(entry.collectionId)
    if (collection?.versionsMaxPerDoc !== 0) {
      const versions = await ctx.db
        .query("cms_versions")
        .withIndex("by_target", (q) =>
          q.eq("targetType", "entry").eq("targetId", args.id)
        )
        .take(10000)
      
      // Monotonic per-(workspace, entry) version number. The old
      // `versions.length + 1` reused a number once pruning capped the array,
      // producing duplicate versionNumbers (see convex/shared/counters.ts).
      // Seed the counter from the current max version so createEntry's version 1
      // and any pre-existing docs don't collide on the first update after deploy.
      const versionNumber = await nextCounterValue(
        ctx,
        args.workspaceId,
        `cms_version:${args.id}`,
        {
          seed: async () =>
            versions.reduce((max, v) => Math.max(max, v.versionNumber), 0),
        },
      )

      await ctx.db.insert("cms_versions", {
        workspaceId: args.workspaceId,
        targetType: "entry",
        targetId: args.id,
        versionNumber,
        snapshot: args.data,
        isDraft: status === "draft",
        changeSummary: args.changeSummary,
        createdBy: userId,
        createdAt: now,
      })
      
      if (
        collection?.versionsMaxPerDoc &&
        versions.length >= collection.versionsMaxPerDoc
      ) {
        const oldestVersion = versions.sort((a, b) => a.versionNumber - b.versionNumber)[0]
        await ctx.db.delete(oldestVersion._id)
      }
    }
    
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "cms_entry.updated",
      resourceType: "cms_entry",
      resourceId: args.id,
    })
    
    return args.id
  },
})

export const publishEntry = mutation({
  args: {
    id: v.id("cms_entries"),
    workspaceId: v.id("workspaces"),
    scheduledAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    await requirePermission(
      ctx,
      args.workspaceId,
      PERMISSIONS.DOCUMENTS_PUBLISH
    
    )
    
    if (args.scheduledAt) {
      await ctx.db.insert("cms_schedules", {
        workspaceId: args.workspaceId,
        targetType: "entry",
        targetId: args.id,
        action: "publish",
        scheduledAt: args.scheduledAt,
        status: "pending",
        createdBy: userId,
        createdAt: Date.now(),
      })
      
      return args.id
    }
    
    const now = Date.now()
    await ctx.db.patch(args.id, {
      status: "published",
      publishedAt: now,
      updatedBy: userId,
      updatedAt: now,
    })
    
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "cms_entry.published",
      resourceType: "cms_entry",
      resourceId: args.id,
    })
    
    return args.id
  },
})

export const unpublishEntry = mutation({
  args: {
    id: v.id("cms_entries"),
    workspaceId: v.id("workspaces"),
    scheduledAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    await requirePermission(
      ctx,
      args.workspaceId,
      PERMISSIONS.DOCUMENTS_PUBLISH
    
    )
    
    if (args.scheduledAt) {
      await ctx.db.insert("cms_schedules", {
        workspaceId: args.workspaceId,
        targetType: "entry",
        targetId: args.id,
        action: "unpublish",
        scheduledAt: args.scheduledAt,
        status: "pending",
        createdBy: userId,
        createdAt: Date.now(),
      })
      
      return args.id
    }
    
    const now = Date.now()
    await ctx.db.patch(args.id, {
      status: "draft",
      updatedBy: userId,
      updatedAt: now,
    })
    
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "cms_entry.unpublished",
      resourceType: "cms_entry",
      resourceId: args.id,
    })
    
    return args.id
  },
})

export const revertEntryToVersion = mutation({
  args: {
    versionId: v.id("cms_versions"),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    await requirePermission(
      ctx,
      args.workspaceId,
      PERMISSIONS.DOCUMENTS_UPDATE
    
    )
    
    const version = await ctx.db.get(args.versionId)
    if (!version || version.targetType !== "entry") {
      throw new Error("Version not found")
    }
    
    const entryId = version.targetId as any
    const entry = await ctx.db.get(entryId)
    if (!entry) {
      throw new Error("Entry not found")
    }
    
    const now = Date.now()
    await ctx.db.patch(entryId, {
      data: version.snapshot,
      updatedBy: userId,
      updatedAt: now,
    })
    
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "cms_entry.reverted",
      resourceType: "cms_entry",
      resourceId: entryId,
      metadata: { versionId: args.versionId, versionNumber: version.versionNumber },
    })
    
    return entryId
  },
})

export const createGlobal = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    slug: v.string(),
    label: v.string(),
    fields: v.array(v.record(v.string(), v.any())),
    access: v.optional(v.record(v.string(), v.any())),
    draftsEnabled: v.optional(v.boolean()),
    localization: v.optional(v.object({
      enabled: v.boolean(),
      locales: v.array(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    await requirePermission(
      ctx,
      args.workspaceId,
      PERMISSIONS.SCHEMAS_CREATE
    
    )
    
    const existing = await ctx.db
      .query("cms_globals")
      .withIndex("by_slug", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("slug", args.slug)
      )
      .first()
    
    if (existing) {
      throw new Error(`Global with slug "${args.slug}" already exists`)
    }
    
    const now = Date.now()
    const id = await ctx.db.insert("cms_globals", {
      workspaceId: args.workspaceId,
      slug: args.slug,
      label: args.label,
      fields: args.fields,
      access: args.access,
      draftsEnabled: args.draftsEnabled ?? true,
      localization: args.localization,
      isActive: true,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })
    
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "cms_global.created",
      resourceType: "cms_global",
      resourceId: id,
      metadata: { slug: args.slug, label: args.label },
    })
    
    return id
  },
})

export const saveGlobal = mutation({
  args: {
    globalId: v.id("cms_globals"),
    workspaceId: v.id("workspaces"),
    data: v.any(),
    draft: v.optional(v.boolean()),
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    await requirePermission(
      ctx,
      args.workspaceId,
      PERMISSIONS.DOCUMENTS_UPDATE
    
    )
    
    const now = Date.now()
    const status = args.draft ? "draft" : "published"
    
    const existing = await ctx.db
      .query("cms_global_data")
      .withIndex("by_globalstatus", (q) =>
        q.eq("globalId", args.globalId).eq("status", status)
      )
      .first()
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        data: args.data,
        updatedBy: userId,
        updatedAt: now,
      })
    } else {
      await ctx.db.insert("cms_global_data", {
        workspaceId: args.workspaceId,
        globalId: args.globalId,
        data: args.data,
        status: status,
        publishedAt: status === "published" ? now : undefined,
        locale: args.locale,
        updatedBy: userId,
        createdAt: now,
        updatedAt: now,
      })
    }
    
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "cms_global.saved",
      resourceType: "cms_global",
      resourceId: args.globalId,
    })
    
    return args.globalId
  },
})

export const uploadMedia = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    filename: v.string(),
    originalFilename: v.string(),
    mimeType: v.string(),
    size: v.number(),
    storage: v.string(),
    url: v.string(),
    metadata: v.optional(v.any()),
    alt: v.optional(v.string()),
    focalPoint: v.optional(v.object({
      x: v.number(),
      y: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    await requirePermission(
      ctx,
      args.workspaceId,
      PERMISSIONS.ASSETS_UPLOAD
    
    )
    
    const now = Date.now()
    const id = await ctx.db.insert("cms_media_assets", {
      workspaceId: args.workspaceId,
      filename: args.filename,
      originalFilename: args.originalFilename,
      mimeType: args.mimeType,
      size: args.size,
      storage: args.storage,
      url: args.url,
      metadata: args.metadata,
      alt: args.alt,
      focalPoint: args.focalPoint,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })
    
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "cms_media_asset.uploaded",
      resourceType: "cms_media_asset",
      resourceId: id,
      metadata: { filename: args.filename, size: args.size },
    })
    
    return id
  },
})

