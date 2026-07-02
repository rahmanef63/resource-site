import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

export const listReports = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
    severity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("damageReports")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(500)
    return rows.filter(
      (r) =>
        (!args.status || r.status === args.status) &&
        (!args.severity || r.severity === args.severity),
    )
  },
})

export const getReport = query({
  args: { workspaceId: v.id("workspaces"), reportId: v.id("damageReports") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const row = await ctx.db.get(args.reportId)
    if (!row || row.workspaceId !== args.workspaceId) return null
    return row
  },
})

export const getSummary = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("damageReports")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(2000)
    const open = rows.filter((r) => r.status !== "resolved" && r.status !== "written-off")
    return {
      open: open.length,
      critical: open.filter((r) => r.severity === "critical").length,
      totalCost: rows.reduce((a, r) => a + (r.actualCost ?? 0), 0),
      total: rows.length,
    }
  },
})
