import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { ensureUser, requirePermission } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAudit } from "../../lib/audit/logger"

const kindValidator = v.union(
  v.literal("iframe"),
  v.literal("sheets"),
  v.literal("rest"),
  v.literal("rss"),
)

const optionalString = v.optional(v.string())

export const setSource = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    featureId: v.string(),
    kind: kindValidator,
    label: optionalString,
    iframeUrl: optionalString,
    iframeHeightClass: optionalString,
    iframeSandbox: optionalString,
    sheetId: optionalString,
    sheetTab: optionalString,
    sheetRange: optionalString,
    restUrl: optionalString,
    restHeaders: optionalString,
    restJsonPath: optionalString,
    rssUrl: optionalString,
    rssLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    await requirePermission(ctx, args.workspaceId, PERMS.EXTERNAL_DATA_MANAGE)

    if (args.featureId.length === 0 || args.featureId.length > 80) {
      throw new Error("featureId must be 1..80 chars")
    }
    validateForKind(args)

    const now = Date.now()
    const existing = await ctx.db
      .query("externalDataSources")
      .withIndex("by_workspace_feature", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("featureId", args.featureId),
      )
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        kind: args.kind,
        label: args.label,
        iframeUrl: args.iframeUrl,
        iframeHeightClass: args.iframeHeightClass,
        iframeSandbox: args.iframeSandbox,
        sheetId: args.sheetId,
        sheetTab: args.sheetTab,
        sheetRange: args.sheetRange,
        restUrl: args.restUrl,
        restHeaders: args.restHeaders,
        restJsonPath: args.restJsonPath,
        rssUrl: args.rssUrl,
        rssLimit: args.rssLimit,
        updatedAt: now,
        updatedBy: userId,
      })
      await logAudit(ctx, {
        action: "externalData.source.updated",
        entityType: "externalDataSources",
        entityId: existing._id,
        workspaceId: args.workspaceId,
        userId: String(userId),
        metadata: { featureId: args.featureId, kind: args.kind },
      })
      return existing._id
    }

    const id = await ctx.db.insert("externalDataSources", {
      workspaceId: args.workspaceId,
      featureId: args.featureId,
      kind: args.kind,
      label: args.label,
      iframeUrl: args.iframeUrl,
      iframeHeightClass: args.iframeHeightClass,
      iframeSandbox: args.iframeSandbox,
      sheetId: args.sheetId,
      sheetTab: args.sheetTab,
      sheetRange: args.sheetRange,
      restUrl: args.restUrl,
      restHeaders: args.restHeaders,
      restJsonPath: args.restJsonPath,
      rssUrl: args.rssUrl,
      rssLimit: args.rssLimit,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
    })
    await logAudit(ctx, {
      action: "externalData.source.created",
      entityType: "externalDataSources",
      entityId: id,
      workspaceId: args.workspaceId,
      userId: String(userId),
      metadata: { featureId: args.featureId, kind: args.kind },
    })
    return id
  },
})

export const removeSource = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    featureId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    await requirePermission(ctx, args.workspaceId, PERMS.EXTERNAL_DATA_MANAGE)

    const existing = await ctx.db
      .query("externalDataSources")
      .withIndex("by_workspace_feature", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("featureId", args.featureId),
      )
      .first()
    if (!existing) return { ok: true, removed: false }

    await ctx.db.delete(existing._id)
    await logAudit(ctx, {
      action: "externalData.source.removed",
      entityType: "externalDataSources",
      entityId: existing._id,
      workspaceId: args.workspaceId,
      userId: String(userId),
      metadata: { featureId: args.featureId, kind: existing.kind },
    })
    return { ok: true, removed: true }
  },
})

function validateForKind(args: {
  kind: "iframe" | "sheets" | "rest" | "rss"
  iframeUrl?: string
  sheetId?: string
  restUrl?: string
  rssUrl?: string
}) {
  if (args.kind === "iframe" && !isHttpUrl(args.iframeUrl)) {
    throw new Error("iframe kind requires a valid https:// iframeUrl")
  }
  if (args.kind === "sheets" && !args.sheetId) {
    throw new Error("sheets kind requires sheetId")
  }
  if (args.kind === "rest" && !isHttpUrl(args.restUrl)) {
    throw new Error("rest kind requires a valid https:// restUrl")
  }
  if (args.kind === "rss" && !isHttpUrl(args.rssUrl)) {
    throw new Error("rss kind requires a valid https:// rssUrl")
  }
}

function isHttpUrl(value?: string): boolean {
  if (!value) return false
  try {
    const u = new URL(value)
    return u.protocol === "https:" || u.protocol === "http:"
  } catch {
    return false
  }
}
