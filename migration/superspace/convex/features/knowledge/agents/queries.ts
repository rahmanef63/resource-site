import { v } from "convex/values"
import { query } from "../../../_generated/server"
import { requireActiveMembership } from "../../../auth/helpers"

/**
 * Agent-facing queries for knowledge
 */

export const summarize = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    return {
      featureSlug: "knowledge",
      message: "Scaffolded agent query. Add real read tools here.",
    }
  },
})
