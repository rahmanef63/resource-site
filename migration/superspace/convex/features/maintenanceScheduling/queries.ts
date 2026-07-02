import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

export const listTasks = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("maintenanceTasks")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(500)
    return args.status ? rows.filter((r) => r.status === args.status) : rows
  },
})

export const getTask = query({
  args: { workspaceId: v.id("workspaces"), taskId: v.id("maintenanceTasks") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const row = await ctx.db.get(args.taskId)
    if (!row || row.workspaceId !== args.workspaceId) return null
    return row
  },
})

export const getDueSoon = query({
  args: { workspaceId: v.id("workspaces"), withinDays: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const cutoff = Date.now() + (args.withinDays ?? 7) * 86_400_000
    const rows = await ctx.db
      .query("maintenanceTasks")
      .withIndex("by_workspace_due", (q) => q.eq("workspaceId", args.workspaceId))
      .take(500)
    return rows.filter(
      (r) => r.nextDueAt <= cutoff && r.status !== "completed" && r.status !== "skipped",
    )
  },
})

export const getSummary = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("maintenanceTasks")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(2000)
    const now = Date.now()
    return {
      total: rows.length,
      scheduled: rows.filter((r) => r.status === "scheduled").length,
      inProgress: rows.filter((r) => r.status === "in_progress").length,
      overdue: rows.filter((r) => r.nextDueAt < now && r.status !== "completed").length,
      totalCost: rows.reduce((a, r) => a + (r.actualCost ?? 0), 0),
    }
  },
})
