import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

export const listClosings = query({
  args: {
    workspaceId: v.id("workspaces"),
    branchId: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("dailyClosings")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(200)
    return rows.filter(
      (r) =>
        (!args.branchId || r.branchId === args.branchId) &&
        (!args.status || r.status === args.status),
    )
  },
})

export const getClosingByDate = query({
  args: {
    workspaceId: v.id("workspaces"),
    businessDate: v.string(),
    branchId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("dailyClosings")
      .withIndex("by_workspace_date", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("businessDate", args.businessDate),
      )
      .take(1000)
    return args.branchId ? rows.find((r) => r.branchId === args.branchId) ?? null : rows[0] ?? null
  },
})

export const listItems = query({
  args: { workspaceId: v.id("workspaces"), closingId: v.id("dailyClosings") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    return await ctx.db
      .query("dailyClosingItems")
      .withIndex("by_closing", (q) => q.eq("closingId", args.closingId))
      .take(1000)
  },
})

export const getSummary = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("dailyClosings")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(30)
    const sum = rows.reduce(
      (acc, r) => {
        acc.totalSales += r.totalSales ?? 0
        acc.totalVariance += r.difference ?? 0
        return acc
      },
      { totalSales: 0, totalVariance: 0 },
    )
    return {
      last30Days: rows.length,
      openCount: rows.filter((r) => r.status === "open" || r.status === "recorded").length,
      totalSales: sum.totalSales,
      totalVariance: sum.totalVariance,
    }
  },
})
