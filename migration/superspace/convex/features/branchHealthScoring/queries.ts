import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

export const listSnapshots = query({
  args: { workspaceId: v.id("workspaces"), branchId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("branchHealthSnapshots")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(500)
    return args.branchId ? rows.filter((r) => r.branchId === args.branchId) : rows
  },
})

export const getLatestPerBranch = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("branchHealthSnapshots")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(1000)
    const latestByBranch: Record<string, (typeof rows)[number]> = {}
    for (const r of rows) {
      if (!latestByBranch[r.branchId] || latestByBranch[r.branchId].capturedAt < r.capturedAt) {
        latestByBranch[r.branchId] = r
      }
    }
    return Object.values(latestByBranch)
  },
})

export const getBranchHistory = query({
  args: { workspaceId: v.id("workspaces"), branchId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("branchHealthSnapshots")
      .withIndex("by_workspace_branch", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("branchId", args.branchId),
      )
      .order("desc")
      .take(args.limit ?? 30)
    return rows
  },
})
