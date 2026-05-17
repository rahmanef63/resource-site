/**
 * Audit log read helpers — query the activityEvents table.
 *
 * @see ./auditLogger.ts for the writer
 */

import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Query audit logs for an entity. Most recent first.
 */
export async function getAuditHistory(
  ctx: MutationCtx,
  entityId: string,
  limit: number = 100
): Promise<any[]> {
  const logs = await ctx.db
    .query("activityEvents")
    .withIndex("by_entity", (q: any) => q.eq("entityType", "").eq("entityId", entityId))
    .order("desc")
    .take(limit);

  return logs;
}

/**
 * Query audit logs for a workspace. Most recent first.
 */
export async function getWorkspaceAuditLogs(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  limit: number = 100
): Promise<any[]> {
  const logs = await ctx.db
    .query("activityEvents")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
    .order("desc")
    .take(limit);

  return logs;
}

/**
 * Query audit logs for a user. Most recent first.
 */
export async function getUserAuditLogs(
  ctx: MutationCtx,
  userId: Id<"users">,
  limit: number = 100
): Promise<any[]> {
  const logs = await ctx.db
    .query("activityEvents")
    .withIndex("by_actor", (q: any) => q.eq("actorUserId", userId))
    .order("desc")
    .take(limit);

  return logs;
}

/**
 * Query audit logs by action type within a workspace. Most recent first.
 */
export async function getAuditLogsByAction(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  action: string,
  limit: number = 100
): Promise<any[]> {
  const logs = await ctx.db
    .query("activityEvents")
    .filter((q: any) =>
      q.and(
        q.eq(q.field("workspaceId"), workspaceId),
        q.eq(q.field("action"), action)
      )
    )
    .order("desc")
    .take(limit);

  return logs;
}
