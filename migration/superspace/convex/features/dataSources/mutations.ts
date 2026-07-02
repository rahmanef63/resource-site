import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requirePermission } from "../../shared/auth"
import { logAuditEvent } from "../../shared/audit"

const MAX_NAME_LENGTH = 80
const MAX_SOURCES_PER_WORKSPACE = 10

/**
 * Reject URLs that point at localhost, loopback, RFC1918, link-local,
 * or non-HTTPS schemes. Defense against SSRF + accidental misconfig.
 */
function validateEndpointUrl(raw: string): string {
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    throw new Error("Invalid endpoint URL")
  }
  if (parsed.protocol !== "https:") {
    throw new Error("Endpoint URL must use https://")
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
    throw new Error("Endpoint URL points to a private/internal host — not allowed")
  }
  return parsed.origin + parsed.pathname.replace(/\/$/, "")
}

function validateAdminKey(key: string): void {
  if (typeof key !== "string" || key.length < 16) {
    throw new Error("Admin key must be at least 16 characters")
  }
  if (key.length > 4096) {
    throw new Error("Admin key too long (max 4096 chars)")
  }
}

export const upsertConvexDataSource = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    id: v.optional(v.id("workspaceDataSources")),
    name: v.string(),
    endpointUrl: v.string(),
    /** Required for create; omit on update to keep stored key. */
    adminKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const membership = await requirePermission(ctx, args.workspaceId, "workspace.manage")
    if (!args.name || args.name.length > MAX_NAME_LENGTH) {
      throw new Error("Name must be 1..80 characters")
    }
    const normalizedUrl = validateEndpointUrl(args.endpointUrl)
    if (args.adminKey) {
      validateAdminKey(args.adminKey)
    }

    const now = Date.now()
    let resultId

    if (args.id) {
      const existing = await ctx.db.get(args.id)
      if (!existing || existing.workspaceId !== args.workspaceId) {
        throw new Error("Data source not found")
      }
      const patch: {
        name: string
        endpointUrl: string
        status: "untested"
        lastError: undefined
        updatedAt: number
        adminKey?: string
      } = {
        name: args.name,
        endpointUrl: normalizedUrl,
        status: "untested",
        lastError: undefined,
        updatedAt: now,
      }
      if (args.adminKey) patch.adminKey = args.adminKey
      await ctx.db.patch(args.id, patch)
      resultId = args.id
      await logAuditEvent(ctx, {
        action: "workspace.dataSource.updated",
        workspaceId: args.workspaceId,
        actorUserId: membership.userDocId,
        target: { type: "workspaceDataSources", id: String(args.id) },
        metadata: { name: args.name, endpointUrl: normalizedUrl, keyRotated: Boolean(args.adminKey) },
      })
    } else {
      if (!args.adminKey) {
        throw new Error("Admin key is required for new connections")
      }
      const existing = await ctx.db
        .query("workspaceDataSources")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .take(MAX_SOURCES_PER_WORKSPACE + 1)
      if (existing.length >= MAX_SOURCES_PER_WORKSPACE) {
        throw new Error(`Max ${MAX_SOURCES_PER_WORKSPACE} data sources per workspace`)
      }
      resultId = await ctx.db.insert("workspaceDataSources", {
        workspaceId: args.workspaceId,
        type: "convex_source",
        name: args.name,
        endpointUrl: normalizedUrl,
        adminKey: args.adminKey,
        status: "untested",
        createdBy: membership.userDocId,
        createdAt: now,
        updatedAt: now,
      })
      await logAuditEvent(ctx, {
        action: "workspace.dataSource.created",
        workspaceId: args.workspaceId,
        actorUserId: membership.userDocId,
        target: { type: "workspaceDataSources", id: String(resultId) },
        metadata: { name: args.name, endpointUrl: normalizedUrl },
      })
    }

    return { id: resultId }
  },
})

export const deleteDataSource = mutation({
  args: {
    id: v.id("workspaceDataSources"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing) throw new Error("Data source not found")
    const membership = await requirePermission(ctx, existing.workspaceId, "workspace.manage")
    await ctx.db.delete(args.id)
    await logAuditEvent(ctx, {
      action: "workspace.dataSource.deleted",
      workspaceId: existing.workspaceId,
      actorUserId: membership.userDocId,
      target: { type: "workspaceDataSources", id: String(args.id) },
      metadata: { name: existing.name, endpointUrl: existing.endpointUrl },
    })
    return { ok: true }
  },
})

export const setDataSourceStatus = mutation({
  args: {
    id: v.id("workspaceDataSources"),
    status: v.union(
      v.literal("untested"),
      v.literal("connected"),
      v.literal("error"),
      v.literal("disabled"),
    ),
    lastError: v.optional(v.string()),
    lastTestedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing) throw new Error("Data source not found")
    const membership = await requirePermission(ctx, existing.workspaceId, "workspace.manage")
    await ctx.db.patch(args.id, {
      status: args.status,
      lastError: args.lastError,
      lastTestedAt: args.lastTestedAt ?? Date.now(),
      updatedAt: Date.now(),
    })
    await logAuditEvent(ctx, {
      action: "workspace.dataSource.statusChanged",
      workspaceId: existing.workspaceId,
      actorUserId: membership.userDocId,
      target: { type: "workspaceDataSources", id: String(args.id) },
      metadata: { status: args.status, error: args.lastError },
    })
    return { ok: true }
  },
})
