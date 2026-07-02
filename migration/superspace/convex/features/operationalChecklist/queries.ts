import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

export const listTemplates = query({
  args: { workspaceId: v.id("workspaces"), scope: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("checklistTemplates")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(200)
    return args.scope ? rows.filter((r) => r.scope === args.scope) : rows
  },
})

export const getTemplate = query({
  args: { workspaceId: v.id("workspaces"), templateId: v.id("checklistTemplates") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const row = await ctx.db.get(args.templateId)
    if (!row || row.workspaceId !== args.workspaceId) return null
    return row
  },
})

export const listRuns = query({
  args: {
    workspaceId: v.id("workspaces"),
    templateId: v.optional(v.id("checklistTemplates")),
    runDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const rows = await ctx.db
      .query("checklistRuns")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(500)
    return rows.filter(
      (r) =>
        (!args.templateId || r.templateId === args.templateId) &&
        (!args.runDate || r.runDate === args.runDate),
    )
  },
})

export const getRun = query({
  args: { workspaceId: v.id("workspaces"), runId: v.id("checklistRuns") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const row = await ctx.db.get(args.runId)
    if (!row || row.workspaceId !== args.workspaceId) return null
    return row
  },
})
