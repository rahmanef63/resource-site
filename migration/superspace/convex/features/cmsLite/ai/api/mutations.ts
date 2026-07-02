import { internalMutation, mutation } from "../../../../_generated/server"
import { v } from "convex/values"
import {
  ensureUser,
  requirePermission,
} from "../../../../auth/helpers"
import { logAuditEvent } from "../../../../shared/audit"

const PERMS = {
  MANAGE_AI: "cmsLite.ai.manage",
} as const

const MESSAGE_SNIPPET_MAX = 200

export const upsertSettings = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    enabled: v.boolean(),
    defaultLocale: v.string(),
    rateLimitPerMinute: v.number(),
    rateLimitPerHour: v.number(),
    systemPromptId: v.optional(v.string()),
    systemPromptEn: v.optional(v.string()),
    systemPromptAr: v.optional(v.string()),
    personality: v.string(),
    customPersonality: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_AI)
    const userId = await ensureUser(ctx)

    const now = Date.now()
    const existing = await ctx.db
      .query("cmsLiteAiSettings")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first()

    const payload = {
      enabled: args.enabled,
      defaultLocale: args.defaultLocale,
      rateLimitPerMinute: Math.max(1, Math.min(args.rateLimitPerMinute, 1000)),
      rateLimitPerHour: Math.max(1, Math.min(args.rateLimitPerHour, 100000)),
      systemPromptId: args.systemPromptId,
      systemPromptEn: args.systemPromptEn,
      systemPromptAr: args.systemPromptAr,
      personality: args.personality,
      customPersonality: args.customPersonality,
      updatedBy: userId,
      updatedAt: now,
    }

    let settingsId
    if (existing) {
      await ctx.db.patch(existing._id, payload)
      settingsId = existing._id
    } else {
      settingsId = await ctx.db.insert("cmsLiteAiSettings", {
        workspaceId: args.workspaceId,
        ...payload,
      })
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "cmsLite.ai.settings.updated",
      resourceType: "cmsLiteAiSettings",
      resourceId: settingsId,
      changes: payload,
    })

    return { settingsId }
  },
})

export const createKBDocument = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    content: v.string(),
    fileUrl: v.optional(v.string()),
    category: v.string(),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_AI)
    const userId = await ensureUser(ctx)

    if (!args.title.trim()) throw new Error("Title wajib diisi")
    if (!args.content.trim()) throw new Error("Content wajib diisi")

    const now = Date.now()
    const id = await ctx.db.insert("cmsLiteAiKnowledgeBase", {
      workspaceId: args.workspaceId,
      title: args.title.trim(),
      content: args.content,
      fileUrl: args.fileUrl?.trim() || undefined,
      category: args.category,
      active: args.active ?? true,
      createdBy: userId,
      updatedBy: userId,
      createdAt: now,
      updatedAt: now,
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "cmsLite.ai.kb.created",
      resourceType: "cmsLiteAiKnowledgeBase",
      resourceId: id,
      metadata: { title: args.title, category: args.category },
    })

    return { id }
  },
})

export const updateKBDocument = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    id: v.id("cmsLiteAiKnowledgeBase"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_AI)
    const userId = await ensureUser(ctx)

    const existing = await ctx.db.get(args.id)
    if (!existing || existing.workspaceId !== args.workspaceId) {
      throw new Error("Document tidak ditemukan")
    }

    const patch: Record<string, unknown> = {
      updatedBy: userId,
      updatedAt: Date.now(),
    }
    if (args.title !== undefined) {
      if (!args.title.trim()) throw new Error("Title wajib diisi")
      patch.title = args.title.trim()
    }
    if (args.content !== undefined) {
      if (!args.content.trim()) throw new Error("Content wajib diisi")
      patch.content = args.content
    }
    if (args.fileUrl !== undefined) patch.fileUrl = args.fileUrl.trim() || undefined
    if (args.category !== undefined) patch.category = args.category
    if (args.active !== undefined) patch.active = args.active

    await ctx.db.patch(args.id, patch)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "cmsLite.ai.kb.updated",
      resourceType: "cmsLiteAiKnowledgeBase",
      resourceId: args.id,
      changes: patch,
    })

    return { success: true as const }
  },
})

/**
 * Called by the chat runtime after each request to log usage metrics
 * for the admin Stats/Activity tabs. `messageSnippet` is truncated to
 * MESSAGE_SNIPPET_MAX chars — no full transcript is persisted here to
 * avoid turning this table into a PII sink.
 */
export const logAiEvent = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.optional(v.id("users")),
    externalUserId: v.optional(v.string()),
    locale: v.string(),
    messageLength: v.number(),
    responseLength: v.number(),
    referencesCount: v.number(),
    rateLimited: v.boolean(),
    messageSnippet: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const snippet = args.messageSnippet?.slice(0, MESSAGE_SNIPPET_MAX)
    const id = await ctx.db.insert("cmsLiteAiActivity", {
      workspaceId: args.workspaceId,
      userId: args.userId,
      externalUserId: args.externalUserId,
      locale: args.locale,
      messageLength: Math.max(0, Math.floor(args.messageLength)),
      responseLength: Math.max(0, Math.floor(args.responseLength)),
      referencesCount: Math.max(0, Math.floor(args.referencesCount)),
      rateLimited: args.rateLimited,
      messageSnippet: snippet,
      createdAt: Date.now(),
    })
    return { id }
  },
})

/**
 * Cron-called: prune cmsLiteAiActivity + cmsLiteAiErrors rows older than
 * the retention window. Invoked daily from convex/crons.ts.
 */
export const pruneAiLogs = internalMutation({
  args: { retentionMs: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - (args.retentionMs ?? 30 * 24 * 60 * 60 * 1000)
    const stale = await ctx.db
      .query("cmsLiteAiActivity")
      .withIndex("by_workspace_createdAt")
      .filter((q) => q.lt(q.field("createdAt"), cutoff))
      .take(5000)
    for (const row of stale) {
      await ctx.db.delete(row._id)
    }
    const staleErrors = await ctx.db
      .query("cmsLiteAiErrors")
      .withIndex("by_workspace_createdAt")
      .filter((q) => q.lt(q.field("createdAt"), cutoff))
      .take(5000)
    for (const row of staleErrors) {
      await ctx.db.delete(row._id)
    }
    return { activityPruned: stale.length, errorsPruned: staleErrors.length }
  },
})

export const logAiError = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    errorType: v.string(),
    errorMessage: v.string(),
    userMessage: v.string(),
    locale: v.string(),
    context: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("cmsLiteAiErrors", {
      workspaceId: args.workspaceId,
      errorType: args.errorType,
      errorMessage: args.errorMessage,
      userMessage: args.userMessage.slice(0, MESSAGE_SNIPPET_MAX),
      locale: args.locale,
      context: args.context,
      createdAt: Date.now(),
    })
    return { id }
  },
})

// Per-client rate limits for the public chat logger. Anonymous visitors
// can only submit this many log entries per window — prevents a single
// storefront host from flooding its own cmsLiteAiActivity / cmsLiteAiErrors
// tables before the daily prune cron runs.
const PUBLIC_LOG_MAX_PER_MINUTE = 30
const PUBLIC_LOG_MAX_PER_HOUR = 500
const MS_PER_MINUTE = 60 * 1000
const MS_PER_HOUR = 60 * MS_PER_MINUTE

async function isPublicLogRateLimited(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  table: "cmsLiteAiActivity" | "cmsLiteAiErrors",
  workspaceId: unknown,
  externalUserId: string | undefined,
): Promise<boolean> {
  const now = Date.now()
  // Scan only the last hour for the workspace. Index is
  // by_workspace_createdAt on both tables.
  const recent = await ctx.db
    .query(table)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .withIndex("by_workspace_createdAt", (q: any) =>
      q.eq("workspaceId", workspaceId).gte("createdAt", now - MS_PER_HOUR),
    )
    .take(PUBLIC_LOG_MAX_PER_HOUR + 1)
  if (recent.length >= PUBLIC_LOG_MAX_PER_HOUR) return true
  if (!externalUserId) return false
  const lastMinuteFromSameClient = recent.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r: any) =>
      r.externalUserId === externalUserId && r.createdAt >= now - MS_PER_MINUTE,
  ).length
  return lastMinuteFromSameClient >= PUBLIC_LOG_MAX_PER_MINUTE
}

/**
 * Public endpoint the storefront Chatbot calls after each exchange.
 * No auth — storefront visitors are anonymous. Workspace is resolved
 * from `host` via the same logic as other public queries. Rate-limit
 * check is gated by settings.enabled; if AI is off for this workspace,
 * the log is skipped silently. A per-(workspace, externalUserId)
 * rate limit also drops writes beyond PUBLIC_LOG_MAX_PER_MINUTE / HOUR.
 */
// @dod:skip-permissions reason="anonymous public storefront endpoint — host-resolved workspace, rate-limited; no Clerk identity to gate on"
// @dod:skip-audit reason="self-logging telemetry — writes are themselves the audit trail (chatActivity table); auditing the audit-writer is recursive noise"
export const logPublicChatActivity = mutation({
  args: {
    host: v.string(),
    locale: v.string(),
    messageLength: v.number(),
    responseLength: v.number(),
    referencesCount: v.number(),
    rateLimited: v.boolean(),
    messageSnippet: v.optional(v.string()),
    /** Stable anonymous client id (from localStorage, set by the chatbot). */
    externalUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const normalizedHost = args.host
      .toLowerCase()
      .trim()
      .replace(/:\d+$/, "")
    const byCustom = await ctx.db
      .query("cms_lite_website_settings")
      .withIndex("by_custom_domain", (q) => q.eq("customDomain", normalizedHost))
      .first()
    const bySubdomain =
      byCustom ??
      (await ctx.db
        .query("cms_lite_website_settings")
        .withIndex("by_subdomain", (q) =>
          q.eq("subdomain", normalizedHost.split(".")[0] ?? normalizedHost),
        )
        .first())
    if (!bySubdomain) return { logged: false as const }

    const workspaceId = bySubdomain.workspaceId
    const settings = await ctx.db
      .query("cmsLiteAiSettings")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .first()
    if (settings && !settings.enabled) {
      return { logged: false as const }
    }

    if (
      await isPublicLogRateLimited(
        ctx,
        "cmsLiteAiActivity",
        workspaceId,
        args.externalUserId,
      )
    ) {
      return { logged: false as const, rateLimited: true as const }
    }

    const snippet = args.messageSnippet?.slice(0, MESSAGE_SNIPPET_MAX)
    const id = await ctx.db.insert("cmsLiteAiActivity", {
      workspaceId,
      externalUserId: args.externalUserId,
      locale: args.locale,
      messageLength: Math.max(0, Math.floor(args.messageLength)),
      responseLength: Math.max(0, Math.floor(args.responseLength)),
      referencesCount: Math.max(0, Math.floor(args.referencesCount)),
      rateLimited: args.rateLimited,
      messageSnippet: snippet,
      createdAt: Date.now(),
    })
    return { logged: true as const, activityId: id }
  },
})

/**
 * Public endpoint for chat errors — mirror of logPublicChatActivity.
 * Useful when the chat runtime can't even form a reply (provider down,
 * rate-limited pre-call, validation fail).
 */
// @dod:skip-permissions reason="anonymous public storefront endpoint — paired with logPublicChatActivity; no Clerk identity to gate on"
// @dod:skip-audit reason="self-logging telemetry — writes are themselves the audit trail (chatError table); auditing the audit-writer is recursive noise"
export const logPublicChatError = mutation({
  args: {
    host: v.string(),
    errorType: v.string(),
    errorMessage: v.string(),
    userMessage: v.string(),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedHost = args.host
      .toLowerCase()
      .trim()
      .replace(/:\d+$/, "")
    const hit =
      (await ctx.db
        .query("cms_lite_website_settings")
        .withIndex("by_custom_domain", (q) => q.eq("customDomain", normalizedHost))
        .first()) ??
      (await ctx.db
        .query("cms_lite_website_settings")
        .withIndex("by_subdomain", (q) =>
          q.eq("subdomain", normalizedHost.split(".")[0] ?? normalizedHost),
        )
        .first())
    if (!hit) return { logged: false as const }

    if (
      await isPublicLogRateLimited(
        ctx,
        "cmsLiteAiErrors",
        hit.workspaceId,
        undefined,
      )
    ) {
      return { logged: false as const, rateLimited: true as const }
    }

    const id = await ctx.db.insert("cmsLiteAiErrors", {
      workspaceId: hit.workspaceId,
      errorType: args.errorType,
      errorMessage: args.errorMessage.slice(0, 500),
      userMessage: args.userMessage.slice(0, MESSAGE_SNIPPET_MAX),
      locale: args.locale,
      createdAt: Date.now(),
    })
    return { logged: true as const, errorId: id }
  },
})

export const deleteKBDocument = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    id: v.id("cmsLiteAiKnowledgeBase"),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_AI)
    const userId = await ensureUser(ctx)

    const existing = await ctx.db.get(args.id)
    if (!existing || existing.workspaceId !== args.workspaceId) {
      throw new Error("Document tidak ditemukan")
    }

    await ctx.db.delete(args.id)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "cmsLite.ai.kb.deleted",
      resourceType: "cmsLiteAiKnowledgeBase",
      resourceId: args.id,
      metadata: { title: existing.title, category: existing.category },
    })

    return { success: true as const }
  },
})
