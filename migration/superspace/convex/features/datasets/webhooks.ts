import { v } from "convex/values"
import { mutation, query, internalMutation } from "../../_generated/server"
import { requirePermission, requireMembership } from "../../shared/auth"
import { logAuditEvent } from "../../shared/audit"

const ALLOWED_EVENTS = new Set([
  "dataset.record.created",
  "dataset.record.updated",
  "dataset.record.deleted",
  "dataset.sync.completed",
])

const MAX_WEBHOOKS_PER_WORKSPACE = 20

function validateUrl(raw: string): string {
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    throw new Error("Invalid webhook URL")
  }
  if (parsed.protocol !== "https:") {
    throw new Error("Webhook URL must be https://")
  }
  const host = parsed.hostname.toLowerCase()
  if (
    host === "localhost" ||
    host === "0.0.0.0" ||
    host.startsWith("127.") ||
    host.startsWith("169.254.") ||
    host.startsWith("10.") ||
    host.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    throw new Error("Webhook URL points at a private/internal host")
  }
  return parsed.origin + parsed.pathname.replace(/\/$/, "")
}

export const createWebhook = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    url: v.string(),
    secret: v.string(),
    events: v.array(v.string()),
    datasetId: v.optional(v.id("datasets")),
  },
  handler: async (ctx, args) => {
    const membership = await requirePermission(ctx, args.workspaceId, "workspace.manage")
    if (!args.name || args.name.length > 80) throw new Error("Name 1..80 chars")
    if (args.secret.length < 16 || args.secret.length > 256) {
      throw new Error("Secret must be 16..256 chars")
    }
    const url = validateUrl(args.url)
    for (const ev of args.events) {
      if (!ALLOWED_EVENTS.has(ev)) throw new Error(`Unknown event: ${ev}`)
    }
    if (args.events.length === 0) throw new Error("At least one event required")
    if (args.datasetId) {
      const ds = await ctx.db.get(args.datasetId)
      if (!ds || ds.workspaceId !== args.workspaceId) {
        throw new Error("Dataset not in this workspace")
      }
    }

    const existing = await ctx.db
      .query("workspaceOutgoingWebhooks")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(MAX_WEBHOOKS_PER_WORKSPACE + 1)
    if (existing.length >= MAX_WEBHOOKS_PER_WORKSPACE) {
      throw new Error(`Max ${MAX_WEBHOOKS_PER_WORKSPACE} webhooks per workspace`)
    }

    const now = Date.now()
    const id = await ctx.db.insert("workspaceOutgoingWebhooks", {
      workspaceId: args.workspaceId,
      name: args.name,
      url,
      secret: args.secret,
      events: args.events,
      datasetId: args.datasetId,
      active: true,
      totalSent: 0,
      totalFailures: 0,
      createdBy: membership.userDocId,
      createdAt: now,
      updatedAt: now,
    })
    await logAuditEvent(ctx, {
      action: "dataset.webhook.created",
      workspaceId: args.workspaceId,
      actorUserId: membership.userDocId,
      target: { type: "workspaceOutgoingWebhooks", id: String(id) },
      metadata: { name: args.name, url, events: args.events },
    })
    return { id }
  },
})

export const setWebhookActive = mutation({
  args: {
    id: v.id("workspaceOutgoingWebhooks"),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id)
    if (!row) throw new Error("Webhook not found")
    const membership = await requirePermission(ctx, row.workspaceId, "workspace.manage")
    await ctx.db.patch(args.id, { active: args.active, updatedAt: Date.now() })
    await logAuditEvent(ctx, {
      action: args.active ? "dataset.webhook.enabled" : "dataset.webhook.disabled",
      workspaceId: row.workspaceId,
      actorUserId: membership.userDocId,
      target: { type: "workspaceOutgoingWebhooks", id: String(args.id) },
    })
    return { ok: true }
  },
})

export const deleteWebhook = mutation({
  args: { id: v.id("workspaceOutgoingWebhooks") },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id)
    if (!row) throw new Error("Webhook not found")
    const membership = await requirePermission(ctx, row.workspaceId, "workspace.manage")
    await ctx.db.delete(args.id)
    await logAuditEvent(ctx, {
      action: "dataset.webhook.deleted",
      workspaceId: row.workspaceId,
      actorUserId: membership.userDocId,
      target: { type: "workspaceOutgoingWebhooks", id: String(args.id) },
      metadata: { name: row.name, url: row.url },
    })
    return { ok: true }
  },
})

export const listWebhooks = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("workspaceOutgoingWebhooks")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(50)
    return rows.map((row) => ({
      _id: row._id,
      name: row.name,
      url: row.url,
      events: row.events,
      datasetId: row.datasetId ?? null,
      active: row.active,
      lastSentAt: row.lastSentAt ?? null,
      lastStatus: row.lastStatus ?? null,
      lastError: row.lastError ?? null,
      totalSent: row.totalSent ?? 0,
      totalFailures: row.totalFailures ?? 0,
      createdAt: row.createdAt,
      // Never echo secret.
    }))
  },
})

export const listDeliveries = query({
  args: { webhookId: v.id("workspaceOutgoingWebhooks") },
  handler: async (ctx, args) => {
    const wh = await ctx.db.get(args.webhookId)
    if (!wh) return []
    await requireMembership(ctx, wh.workspaceId)
    return ctx.db
      .query("workspaceWebhookDeliveries")
      .withIndex("by_webhook", (q) => q.eq("webhookId", args.webhookId))
      .order("desc")
      .take(20)
  },
})

/**
 * Internal — used by dispatch action to read the secret & URL.
 */
export const getWebhookWithSecret = internalMutation({
  args: { id: v.id("workspaceOutgoingWebhooks") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id)
  },
})

export const recordDelivery = internalMutation({
  args: {
    webhookId: v.id("workspaceOutgoingWebhooks"),
    workspaceId: v.id("workspaces"),
    event: v.string(),
    payload: v.string(),
    httpStatus: v.optional(v.number()),
    httpError: v.optional(v.string()),
    durationMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    await ctx.db.insert("workspaceWebhookDeliveries", {
      webhookId: args.webhookId,
      workspaceId: args.workspaceId,
      event: args.event,
      payload: args.payload,
      httpStatus: args.httpStatus,
      httpError: args.httpError,
      durationMs: args.durationMs,
      createdAt: now,
    })
    const wh = await ctx.db.get(args.webhookId)
    if (!wh) return
    const ok = args.httpStatus !== undefined && args.httpStatus >= 200 && args.httpStatus < 300
    await ctx.db.patch(args.webhookId, {
      lastSentAt: now,
      lastStatus: args.httpStatus,
      lastError: args.httpError,
      totalSent: (wh.totalSent ?? 0) + 1,
      totalFailures: (wh.totalFailures ?? 0) + (ok ? 0 : 1),
      updatedAt: now,
    })
  },
})
