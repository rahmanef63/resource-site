import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

export const listAssets = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("managedAssets")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(500)
    return rows.filter(
      (r) =>
        (!args.status || r.status === args.status) &&
        (!args.category || r.category === args.category),
    )
  },
})

export const getAsset = query({
  args: { workspaceId: v.id("workspaces"), assetId: v.id("managedAssets") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const row = await ctx.db.get(args.assetId)
    if (!row || row.workspaceId !== args.workspaceId) return null
    const transactions = await ctx.db
      .query("assetTransactions")
      .withIndex("by_asset", (q) => q.eq("assetId", args.assetId))
      .order("desc")
      .take(50)
    return { ...row, transactions }
  },
})

export const getSummary = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("managedAssets")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(2000)
    return {
      total: rows.length,
      active: rows.filter((r) => r.status === "active").length,
      maintenance: rows.filter((r) => r.status === "maintenance").length,
      retired: rows.filter((r) => r.status === "retired").length,
      totalCurrentValue: rows.reduce((a, r) => a + (r.currentValue ?? 0), 0),
      totalPurchaseValue: rows.reduce((a, r) => a + (r.purchasePrice ?? 0), 0),
    }
  },
})
