import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requirePermission } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"

/**
 * Overview Mutations
 * Allows users to pin/dismiss dashboard widgets
 */

// @dod:skip-audit reason="per-user UI state (dismissed onboarding tips stored on membership.additionalPermissions); not workspace-wide signal worth audit-log inflation"
export const dismissOnboardingTip = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    tipId: v.string(),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_VIEW)

    // Store dismissed tips as workspace membership metadata
    const currentDismissed = (membership.additionalPermissions ?? []).filter(
      (p: string) => p.startsWith("_dismissed_tip:")
    )
    const tipKey = `_dismissed_tip:${args.tipId}`
    if (!currentDismissed.includes(tipKey)) {
      await ctx.db.patch(membership._id, {
        additionalPermissions: [
          ...(membership.additionalPermissions ?? []),
          tipKey,
        ],
      })
    }
  },
})

export const pinWidget = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    widgetId: v.string(),
    pinned: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.ANALYTICS_VIEW)

    await logAuditEvent(ctx, {
      action: args.pinned ? "overview.widget.pinned" : "overview.widget.unpinned",
      workspaceId: args.workspaceId,
      resourceType: "overview",
      resourceId: args.widgetId,
    })
  },
})
