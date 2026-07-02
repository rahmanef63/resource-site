import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

export const listTransfers = query({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("ownerTransfers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(500)
    return rows.filter(
      (r) => (!args.type || r.type === args.type) && (!args.status || r.status === args.status),
    )
  },
})

export const getTransfer = query({
  args: { workspaceId: v.id("workspaces"), transferId: v.id("ownerTransfers") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const row = await ctx.db.get(args.transferId)
    if (!row || row.workspaceId !== args.workspaceId) return null
    return row
  },
})

export const getSummary = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("ownerTransfers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(2000)
    const sum = (type: string) =>
      rows.filter((r) => r.type === type).reduce((a, r) => a + r.amount, 0)
    return {
      totalWithdraw: sum("withdraw"),
      totalInject: sum("inject"),
      totalLoan: sum("loan"),
      totalRepayment: sum("repayment"),
      netOwnerPosition: sum("inject") + sum("repayment") - sum("withdraw") - sum("loan"),
      count: rows.length,
    }
  },
})
