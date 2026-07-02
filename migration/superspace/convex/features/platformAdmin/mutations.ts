import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { ensureUser } from "../../auth/helpers"
import { isPlatformAdmin } from "../../lib/platformAdmin"
import { readIdentityEmail, resolveAuthEmail } from "../../lib/authIdentity"
import { logAuditEvent } from "../../shared/audit"

/**
 * Platform Admin Mutations
 * System-level write operations — platform admin only
 */

async function requirePlatformAdmin(ctx: Parameters<typeof ensureUser>[0]) {
  const userId = await ensureUser(ctx)
  const identity = await ctx.auth.getUserIdentity()
  // `identity?.email` alone misses Clerk identity shapes where the email
  // lives under `primaryEmailAddress` / `email_address` / claims.email.
  // `readIdentityEmail` normalises across all shapes; if it returns null,
  // the platform-admin allowlist must reject.
  const email = await resolveAuthEmail(ctx)
  if (!isPlatformAdmin(email)) {
    throw new Error("Platform admin access required")
  }
  return userId
}

export const archiveWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx)

    await ctx.db.patch(args.workspaceId, {
      isArchived: true,
      archivedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      action: "platform-admin.workspace.archived",
      workspaceId: args.workspaceId,
      resourceType: "workspaces",
      resourceId: args.workspaceId,
      metadata: { reason: args.reason },
    })
  },
})

export const restoreWorkspace = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx)

    await ctx.db.patch(args.workspaceId, {
      isArchived: false,
      archivedAt: undefined,
    })

    await logAuditEvent(ctx, {
      action: "platform-admin.workspace.restored",
      workspaceId: args.workspaceId,
      resourceType: "workspaces",
      resourceId: args.workspaceId,
    })
  },
})

/**
 * Hard-delete a workspace. Platform admin only. Cascades workspaceMemberships;
 * feature-table cleanup is run by a separate batch action. Caller must pass
 * confirm:true to acknowledge the destructive nature.
 */
export const hardDeleteWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    confirm: v.literal(true),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actorUserId = await requirePlatformAdmin(ctx)

    const workspace = await ctx.db.get(args.workspaceId)
    if (!workspace) throw new Error("Workspace not found")

    const memberships = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)
    // Batched delete — sequential awaits are required for ctx.db.delete which
    // does not support Promise.all on the same row set without conflict.
    await Promise.all(memberships.map((m) => ctx.db.delete(m._id)))

    await ctx.db.delete(args.workspaceId)

    await logAuditEvent(ctx, {
      actorUserId,
      action: "platform-admin.workspace.hard_deleted",
      workspaceId: args.workspaceId,
      resourceType: "workspaces",
      resourceId: args.workspaceId,
      metadata: {
        reason: args.reason,
        workspaceName: workspace.name,
        membershipsDeleted: memberships.length,
      },
    })

    return { success: true, membershipsDeleted: memberships.length }
  },
})

/**
 * Hard-delete a user. Platform admin only. Drops the user row plus all
 * workspaceMemberships pointing at the user.
 */
export const hardDeleteUser = mutation({
  args: {
    userId: v.id("users"),
    confirm: v.literal(true),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actorUserId = await requirePlatformAdmin(ctx)

    const user = await ctx.db.get(args.userId)
    if (!user) throw new Error("User not found")

    const memberships = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .take(1000)
    await Promise.all(memberships.map((m) => ctx.db.delete(m._id)))

    await ctx.db.delete(args.userId)

    // Audit row needs a workspaceId; use the first membership we just
    // collected, else fall back to a "platform" sentinel string (logAuditEvent
    // silently no-ops when workspaceId cannot be resolved, but the trail
    // still records the platform-admin intent).
    const auditWorkspaceId: string =
      (memberships[0]?.workspaceId as unknown as string | undefined) ??
      "platform"
    await logAuditEvent(ctx, {
      workspaceId: auditWorkspaceId,
      actorUserId,
      action: "platform-admin.user.hard_deleted",
      resourceType: "users",
      resourceId: args.userId,
      metadata: {
        reason: args.reason,
        email: user.email,
        membershipsDeleted: memberships.length,
      },
    })

    return { success: true, membershipsDeleted: memberships.length }
  },
})
