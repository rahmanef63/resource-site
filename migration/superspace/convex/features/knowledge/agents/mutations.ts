import { v } from "convex/values"
import { mutation } from "../../../_generated/server"
import { requirePermission } from "../../../auth/helpers"
import { PERMS } from "../../../workspace/permissions"

/**
 * Agent-facing mutations for knowledge
 */

// @dod:skip-audit reason=noop-placeholder
export const noop = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE)
    return { ok: true }
  },
})
