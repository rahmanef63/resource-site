import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

export const listRequests = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("pettyCashRequests")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(500)
    return args.status ? rows.filter((r) => r.status === args.status) : rows
  },
})

export const getRequest = query({
  args: { workspaceId: v.id("workspaces"), requestId: v.id("pettyCashRequests") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const row = await ctx.db.get(args.requestId)
    if (!row || row.workspaceId !== args.workspaceId) return null
    return row
  },
})

export const getSummary = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const requests = await ctx.db
      .query("pettyCashRequests")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(2000)
    const by = (s: string) => requests.filter((r) => r.status === s)
    const sum = (rs: typeof requests) => rs.reduce((a, r) => a + (r.amount ?? 0), 0)
    return {
      pending: by("pending").length,
      approved: by("approved").length,
      disbursed: by("disbursed").length,
      closed: by("closed").length,
      rejected: by("rejected").length,
      outstandingAmount: sum(by("approved")) + sum(by("disbursed")),
      totalClosedAmount: sum(by("closed")),
    }
  },
})
