import { v } from "convex/values"
import { internalQuery } from "../../_generated/server"

/**
 * Internal-only — returns the FULL admin key. Reachable only by Convex
 * actions running inside the backend; not exposed over HTTP.
 */
export const getDataSourceWithKey = internalQuery({
  args: { id: v.id("workspaceDataSources") },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id)
    if (!row) return null
    return {
      _id: row._id,
      workspaceId: row.workspaceId,
      endpointUrl: row.endpointUrl,
      adminKey: row.adminKey,
      lastTestedAt: row.lastTestedAt ?? null,
    }
  },
})
