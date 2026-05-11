/**
 * RBAC Permission Helpers — @convex-dev/auth aware.
 *
 * Permission strings: "feature.action" (e.g. "database.create").
 * Wildcards supported: "*", "<feature>.*".
 *
 * Hierarchy (high → low):
 *   1. Platform admin  (env PLATFORM_ADMIN_EMAILS)        → wildcard *
 *   2. Workspace owner (workspaces.createdBy / .userId)   → wildcard *
 *   3. Role permissions on workspaceMemberships.roleId
 *   4. additionalPermissions on the membership row
 *
 * Use at the top of every mutation/query that touches workspace data.
 *
 * @example
 *   export const createDatabase = mutation({
 *     args: { workspaceId: v.id("workspaces"), name: v.string() },
 *     handler: async (ctx, args) => {
 *       await requirePermission(ctx, args.workspaceId, "database.create");
 *       // ...
 *     },
 *   });
 */

import type { MutationCtx, QueryCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { isPlatformAdmin } from "./platform-admin";

export type Permission = string;

/** Match a permission against a list of granted patterns (with wildcards). */
function matchPermission(granted: readonly string[], wanted: Permission): boolean {
  return granted.some((p) => {
    if (p === wanted) return true;
    if (p === "*") return true;
    if (p.endsWith(".*") && wanted.startsWith(p.slice(0, -2) + ".")) return true;
    return false;
  });
}

/** Non-throwing permission check. */
export async function checkPermission(
  ctx: MutationCtx | QueryCtx,
  workspaceId: Id<"workspaces">,
  permission: Permission,
): Promise<boolean> {
  try {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const user = await ctx.db.get(userId);
    if (!user) return false;

    // Platform admin bypass — env-listed emails get everything.
    if (isPlatformAdmin(user.email ?? null)) return true;

    const workspace = await ctx.db.get(workspaceId);
    if (!workspace) return false;

    // Workspace owner bypass. Templates may use either `userId` (notion port)
    // or `createdBy` (superspace port) — check both.
    const ownerId = (workspace as any).userId ?? (workspace as any).createdBy;
    if (ownerId === userId) return true;

    const membership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", userId).eq("workspaceId", workspaceId),
      )
      .first();
    if (!membership) return false;

    // Membership-level additional perms (overrides on top of role).
    if (matchPermission(membership.additionalPermissions ?? [], permission)) {
      return true;
    }

    const role = await ctx.db.get(membership.roleId);
    if (!role || !Array.isArray(role.permissions)) return false;

    return matchPermission(role.permissions, permission);
  } catch (err) {
    console.error("[rbac] checkPermission failed:", err);
    return false;
  }
}

/** Throwing variant — use as the first line of mutations/queries. */
export async function requirePermission(
  ctx: MutationCtx | QueryCtx,
  workspaceId: Id<"workspaces">,
  permission: Permission,
): Promise<void> {
  const ok = await checkPermission(ctx, workspaceId, permission);
  if (!ok) {
    throw new Error(
      `Permission denied: missing '${permission}' in workspace ${workspaceId}`,
    );
  }
}

/** True for owner/admin slugs or any role holding `*`. */
export async function isWorkspaceAdmin(
  ctx: MutationCtx | QueryCtx,
  workspaceId: Id<"workspaces">,
): Promise<boolean> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;

  const user = await ctx.db.get(userId);
  if (isPlatformAdmin(user?.email ?? null)) return true;

  const membership = await ctx.db
    .query("workspaceMemberships")
    .withIndex("by_user_workspace", (q) =>
      q.eq("userId", userId).eq("workspaceId", workspaceId),
    )
    .first();
  if (!membership) return false;

  const role = await ctx.db.get(membership.roleId);
  if (!role) return false;

  return (
    role.slug === "owner" ||
    role.slug === "admin" ||
    (Array.isArray(role.permissions) && role.permissions.includes("*"))
  );
}

/** True if the authed user owns the workspace row. */
export async function isWorkspaceOwner(
  ctx: MutationCtx | QueryCtx,
  workspaceId: Id<"workspaces">,
): Promise<boolean> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;

  const workspace = await ctx.db.get(workspaceId);
  if (!workspace) return false;

  const ownerId = (workspace as any).userId ?? (workspace as any).createdBy;
  return ownerId === userId;
}

/** Flat list of permissions granted to the current user in a workspace. */
export async function getUserPermissions(
  ctx: MutationCtx | QueryCtx,
  workspaceId: Id<"workspaces">,
): Promise<Permission[]> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return [];

  const user = await ctx.db.get(userId);
  if (isPlatformAdmin(user?.email ?? null)) return ["*"];

  const membership = await ctx.db
    .query("workspaceMemberships")
    .withIndex("by_user_workspace", (q) =>
      q.eq("userId", userId).eq("workspaceId", workspaceId),
    )
    .first();
  if (!membership) return [];

  const role = await ctx.db.get(membership.roleId);
  const rolePerms = (role?.permissions ?? []) as Permission[];
  const extra = (membership.additionalPermissions ?? []) as Permission[];
  return [...new Set([...rolePerms, ...extra])];
}

/**
 * Legacy grouped constants. Prefer importing PERMS from "./perms" — that's
 * the single source of truth. Kept here so older imports still resolve.
 */
export const PERMISSIONS = {
  DATABASE: {
    CREATE: "database.create",
    READ: "database.read",
    UPDATE: "database.update",
    DELETE: "database.delete",
    MANAGE: "database.manage",
  },
  DOCUMENTS: {
    CREATE: "documents.create",
    READ: "documents.read",
    UPDATE: "documents.update",
    DELETE: "documents.delete",
    PUBLISH: "documents.publish",
  },
  CHAT: {
    CREATE: "chat.create",
    READ: "chat.read",
    DELETE: "chat.delete",
    MANAGE: "chat.manage",
  },
  WORKSPACE: {
    READ: "workspace.read",
    UPDATE: "workspace.update",
    DELETE: "workspace.delete",
    MANAGE_MEMBERS: "workspace.manage_members",
    MANAGE_ROLES: "workspace.manage_roles",
    MANAGE: "workspace.manage",
  },
  ADMIN: "*",
} as const;
