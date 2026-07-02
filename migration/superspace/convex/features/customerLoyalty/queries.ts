import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

export const listMembers = query({
  args: { workspaceId: v.id("workspaces"), tier: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("loyaltyMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)
    return args.tier ? rows.filter((r) => r.tier === args.tier) : rows
  },
})

export const getMember = query({
  args: { workspaceId: v.id("workspaces"), memberId: v.id("loyaltyMembers") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const row = await ctx.db.get(args.memberId)
    if (!row || row.workspaceId !== args.workspaceId) return null
    const transactions = await ctx.db
      .query("loyaltyTransactions")
      .withIndex("by_member", (q) => q.eq("memberId", args.memberId))
      .order("desc")
      .take(50)
    return { ...row, transactions }
  },
})

export const listTiers = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    return await ctx.db
      .query("loyaltyTiers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)
  },
})

export const getSummary = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const members = await ctx.db
      .query("loyaltyMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(5000)
    return {
      memberCount: members.length,
      totalPointsOutstanding: members.reduce((a, m) => a + m.pointsBalance, 0),
      totalEarnedLifetime: members.reduce((a, m) => a + m.totalEarned, 0),
      totalRedeemedLifetime: members.reduce((a, m) => a + m.totalRedeemed, 0),
    }
  },
})
