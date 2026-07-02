import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

export const listThresholds = query({
  args: { workspaceId: v.id("workspaces"), kpiKey: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("kpiThresholds")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(500)
    return args.kpiKey ? rows.filter((r) => r.kpiKey === args.kpiKey) : rows
  },
})

export const listAlerts = query({
  args: {
    workspaceId: v.id("workspaces"),
    resolved: v.optional(v.boolean()),
    severity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("kpiAlerts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(500)
    return rows.filter(
      (r) =>
        (args.resolved === undefined || r.resolved === args.resolved) &&
        (!args.severity || r.severity === args.severity),
    )
  },
})

export const getSummary = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const alerts = await ctx.db
      .query("kpiAlerts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)
    const open = alerts.filter((a) => !a.resolved)
    return {
      activeThresholds: (
        await ctx.db
          .query("kpiThresholds")
          .withIndex("by_workspace_active", (q) =>
            q.eq("workspaceId", args.workspaceId).eq("isActive", true),
          )
          .take(1000)
      ).length,
      openAlerts: open.length,
      criticalAlerts: open.filter((a) => a.severity === "critical").length,
      totalAlerts: alerts.length,
    }
  },
})
