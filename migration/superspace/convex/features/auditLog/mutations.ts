import { v } from "convex/values"
import { mutation, type QueryCtx, type MutationCtx } from "../../_generated/server"
import { logAuditEvent } from "../../shared/audit"
import { isPlatformAdmin } from "../../lib/platformAdmin"
import { readIdentityEmail, resolveAuthEmail } from "../../lib/authIdentity"

/**
 * Audit Log Mutations
 * Write operations — archive/delete audit log entries.
 *
 * SECURITY: Audit logs are treated as an immutable compliance record.
 * Deletion and archiving are restricted to platform admins only and
 * are intentionally NOT assignable as workspace role permissions.
 * This prevents any workspace role (including Owner) from suppressing
 * evidence of their own actions.
 */

async function requirePlatformAdminForAuditOps(ctx: QueryCtx | MutationCtx): Promise<void> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error("Authentication required")
  const email = (await resolveAuthEmail(ctx)) ?? ""
  if (!isPlatformAdmin(email)) {
    throw new Error(
      "Audit log deletion is restricted to platform administrators. " +
        "Audit records must remain intact for compliance.",
    )
  }
}

// @dod:skip-permissions reason="platform-admin only via requirePlatformAdminForAuditOps; workspace roles intentionally cannot suppress audit evidence (compliance)"
export const archiveLogs = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    beforeTimestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdminForAuditOps(ctx)

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.lt(q.field("timestamp"), args.beforeTimestamp))
      .take(500)

    await Promise.all(logs.map((log) => ctx.db.delete(log._id)))

    await logAuditEvent(ctx, {
      action: "audit-log.archived",
      workspaceId: args.workspaceId,
      resourceType: "auditLogs",
    })

    return { archived: logs.length }
  },
})

// @dod:skip-permissions reason="platform-admin only via requirePlatformAdminForAuditOps; workspace roles intentionally cannot delete audit records (compliance)"
export const deleteLog = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    logId: v.id("auditLogs"),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdminForAuditOps(ctx)

    const log = await ctx.db.get(args.logId)
    if (!log || log.workspaceId !== args.workspaceId) return

    await ctx.db.delete(args.logId)

    await logAuditEvent(ctx, {
      action: "audit-log.entry.deleted",
      workspaceId: args.workspaceId,
      resourceType: "auditLogs",
      resourceId: args.logId,
    })
  },
})
