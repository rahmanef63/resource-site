import { v } from "convex/values"
import { mutation, internalMutation, internalQuery, query } from "../../_generated/server"
import { requirePermission, requireMembership } from "../../shared/auth"
import { logAuditEvent } from "../../shared/audit"

const MAX_NAME_LENGTH = 80
const MAX_KEYS_PER_WORKSPACE = 20

/**
 * Internal — called by createIngressKey action after generating the raw
 * key + hash in the Node runtime. Persists the hash only.
 */
export const persistIngressKey = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    keyPrefix: v.string(),
    keyHash: v.string(),
    scopeAllDatasets: v.boolean(),
    scopeDatasetIds: v.array(v.id("datasets")),
  },
  handler: async (ctx, args) => {
    const membership = await requirePermission(ctx, args.workspaceId, "workspace.manage")
    if (!args.name || args.name.length > MAX_NAME_LENGTH) {
      throw new Error("Name must be 1..80 characters")
    }
    const existing = await ctx.db
      .query("workspaceIngressKeys")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(MAX_KEYS_PER_WORKSPACE + 1)
    const active = existing.filter((k) => !k.revokedAt)
    if (active.length >= MAX_KEYS_PER_WORKSPACE) {
      throw new Error(`Max ${MAX_KEYS_PER_WORKSPACE} active ingress keys per workspace`)
    }

    // Validate every scoped dataset belongs to this workspace.
    if (!args.scopeAllDatasets) {
      if (args.scopeDatasetIds.length === 0) {
        throw new Error("Scope: select at least one dataset OR enable all-datasets scope")
      }
      for (const dsId of args.scopeDatasetIds) {
        const ds = await ctx.db.get(dsId)
        if (!ds || ds.workspaceId !== args.workspaceId) {
          throw new Error(`Dataset ${dsId} not in this workspace`)
        }
      }
    }

    const now = Date.now()
    const id = await ctx.db.insert("workspaceIngressKeys", {
      workspaceId: args.workspaceId,
      name: args.name,
      keyPrefix: args.keyPrefix,
      keyHash: args.keyHash,
      scopeAllDatasets: args.scopeAllDatasets,
      scopeDatasetIds: args.scopeDatasetIds,
      useCount: 0,
      createdBy: membership.userDocId,
      createdAt: now,
      updatedAt: now,
    })

    await logAuditEvent(ctx, {
      action: "dataset.ingressKey.created",
      workspaceId: args.workspaceId,
      actorUserId: membership.userDocId,
      target: { type: "workspaceIngressKeys", id: String(id) },
      metadata: { name: args.name, scopeAllDatasets: args.scopeAllDatasets },
    })
    return id
  },
})

export const revokeIngressKey = mutation({
  args: { id: v.id("workspaceIngressKeys") },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id)
    if (!row) throw new Error("Key not found")
    const membership = await requirePermission(ctx, row.workspaceId, "workspace.manage")
    if (row.revokedAt) return { ok: true, alreadyRevoked: true }
    await ctx.db.patch(args.id, { revokedAt: Date.now(), updatedAt: Date.now() })
    await logAuditEvent(ctx, {
      action: "dataset.ingressKey.revoked",
      workspaceId: row.workspaceId,
      actorUserId: membership.userDocId,
      target: { type: "workspaceIngressKeys", id: String(args.id) },
      metadata: { name: row.name },
    })
    return { ok: true, alreadyRevoked: false }
  },
})

export const listIngressKeys = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("workspaceIngressKeys")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(50)
    return rows.map((row) => ({
      _id: row._id,
      name: row.name,
      keyPrefix: row.keyPrefix,
      scopeAllDatasets: row.scopeAllDatasets,
      scopeDatasetIds: row.scopeDatasetIds,
      revokedAt: row.revokedAt ?? null,
      lastUsedAt: row.lastUsedAt ?? null,
      lastUsedIp: row.lastUsedIp ?? null,
      useCount: row.useCount ?? 0,
      createdAt: row.createdAt,
    }))
  },
})

/**
 * Internal-only — used by the HTTP ingress route. Looks up key by prefix,
 * verifies the SHA-256 hash, checks scope + revocation.
 */
export const verifyIngressKey = internalQuery({
  args: {
    keyPrefix: v.string(),
    keyHash: v.string(),
    datasetId: v.id("datasets"),
  },
  handler: async (ctx, args) => {
    const dataset = await ctx.db.get(args.datasetId)
    if (!dataset) return null

    const candidates = await ctx.db
      .query("workspaceIngressKeys")
      .withIndex("by_prefix", (q) => q.eq("keyPrefix", args.keyPrefix))
      .take(5)

    for (const c of candidates) {
      if (c.keyHash !== args.keyHash) continue
      if (c.revokedAt) return null
      if (c.workspaceId !== dataset.workspaceId) return null
      if (!c.scopeAllDatasets && !c.scopeDatasetIds.includes(args.datasetId)) return null
      return {
        keyId: c._id,
        workspaceId: c.workspaceId,
        datasetId: args.datasetId,
      }
    }
    return null
  },
})

/**
 * Internal-only — records that an ingress key was used. Called from
 * the HTTP route post-write.
 */
export const recordIngressUse = internalMutation({
  args: {
    id: v.id("workspaceIngressKeys"),
    ip: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id)
    if (!row) return
    await ctx.db.patch(args.id, {
      lastUsedAt: Date.now(),
      lastUsedIp: args.ip,
      useCount: (row.useCount ?? 0) + 1,
      updatedAt: Date.now(),
    })
  },
})
