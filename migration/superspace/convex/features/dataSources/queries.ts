import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireMembership } from "../../shared/auth"

/**
 * List a workspace's remote data sources. Returns the admin key MASKED
 * (4-char tail only) — never echoes the full secret to the client.
 */
export const listDataSources = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("workspaceDataSources")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(50)
    return rows.map((row) => {
      const tail = row.adminKey.slice(-4)
      return {
        _id: row._id,
        workspaceId: row.workspaceId,
        type: row.type,
        name: row.name,
        endpointUrl: row.endpointUrl,
        keyTail: `••••${tail}`,
        status: row.status,
        lastError: row.lastError ?? null,
        lastTestedAt: row.lastTestedAt ?? null,
        lastSyncAt: row.lastSyncAt ?? null,
        lastSyncRows: row.lastSyncRows ?? null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }
    })
  },
})
