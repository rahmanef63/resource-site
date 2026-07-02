import { v } from "convex/values"
import { query } from "../../_generated/server"
import { ensureUser, requirePermission } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"

/**
 * Return the configured external data source for `(workspaceId, featureId)`
 * or `null` if no source set. Caller must hold `externalData.view`.
 */
export const getSource = query({
  args: {
    workspaceId: v.id("workspaces"),
    featureId: v.string(),
  },
  handler: async (ctx, args) => {
    await ensureUser(ctx)
    await requirePermission(ctx, args.workspaceId, PERMS.EXTERNAL_DATA_VIEW)
    const doc = await ctx.db
      .query("externalDataSources")
      .withIndex("by_workspace_feature", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("featureId", args.featureId),
      )
      .first()
    return doc
  },
})

export const listSources = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await ensureUser(ctx)
    await requirePermission(ctx, args.workspaceId, PERMS.EXTERNAL_DATA_VIEW)
    return await ctx.db
      .query("externalDataSources")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(200)
  },
})
