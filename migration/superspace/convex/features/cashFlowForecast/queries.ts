import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

export const listForecasts = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
    horizonDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("cashFlowForecasts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(200)
    return rows.filter(
      (r) =>
        (!args.status || r.status === args.status) &&
        (args.horizonDays === undefined || r.horizonDays === args.horizonDays),
    )
  },
})

export const getForecast = query({
  args: { workspaceId: v.id("workspaces"), forecastId: v.id("cashFlowForecasts") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const row = await ctx.db.get(args.forecastId)
    if (!row || row.workspaceId !== args.workspaceId) return null
    const items = await ctx.db
      .query("cashFlowLineItems")
      .withIndex("by_forecast", (q) => q.eq("forecastId", args.forecastId))
      .take(1000)
    return { ...row, items }
  },
})

export const getLatestPublished = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("cashFlowForecasts")
      .withIndex("by_workspace_status", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("status", "published"),
      )
      .order("desc")
      .take(1)
    return rows[0] ?? null
  },
})
