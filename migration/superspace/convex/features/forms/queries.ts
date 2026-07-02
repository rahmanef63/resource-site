import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Queries for forms feature
 */

export const getForms = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const forms = await ctx.db
      .query("forms")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(500)

    return forms
  },
})

export const getFormById = query({
  args: {
    workspaceId: v.id("workspaces"),
    formId: v.id("forms"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const form = await ctx.db.get(args.formId)
    if (!form || form.workspaceId !== args.workspaceId) {
      return null
    }

    return form
  },
})

export const getSubmissions = query({
  args: {
    workspaceId: v.id("workspaces"),
    formId: v.id("forms"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const submissions = await ctx.db
      .query("formSubmissions")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .take(500)

    return submissions
  },
})
