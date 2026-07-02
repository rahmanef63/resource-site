import { query } from "../../../_generated/server"
import { v } from "convex/values"

/**
 * Agent-facing query for rate-limit — placeholder for agent surface parity.
 * Backend-only infra slice; no AI-actionable read tools yet.
 */
export const summarize = query({
  args: {
    key: v.optional(v.string()),
  },
  handler: async (_ctx, _args) => {
    return {
      featureSlug: "rate-limit",
      message: "Backend rate-limit slice. No AI read tools.",
    }
  },
})
