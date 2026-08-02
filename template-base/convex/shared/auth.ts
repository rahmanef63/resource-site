/**
 * Workspace membership + RBAC helpers — backed by @convex-dev/auth.
 * Original superspace version used auth externalId lookup; this version
 * uses getAuthUserId() so users.* is the @convex-dev/auth users table.
 */

import type {
  ActionCtx,
  MutationCtx,
  QueryCtx,
} from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { isPlatformAdmin } from "../lib/platformAdmin";

export type ActionCtxWithDb = ActionCtx & { db: MutationCtx["db"] };
export type AnyConvexCtx = QueryCtx | MutationCtx | ActionCtxWithDb;

type DatabaseLike = MutationCtx["db"];

const dbFromCtx = (ctx: AnyConvexCtx): DatabaseLike => {
  if ("db" in ctx) {
    return (ctx as any).db as DatabaseLike;
  }
  throw new Error("Database access unavailable in this context");
};

export async function getCurrentUser(
  ctx: AnyConvexCtx,
): Promise<Doc<"users"> | null> {
  const userId = await getAuthUserId(ctx as any);
  if (!userId) return null;
  const db = dbFromCtx(ctx);
  return db.get(userId);
}

/**
 * Compat shim for legacy clerk-style external-id lookup. Superspace called
 * this with `identity.subject` (a clerk user id). In the kitab the auth
 * subject IS the @convex-dev/auth user doc _id, so we resolve via direct
 * `db.get` — the externalId argument is treated as Id<"users">.
 *
 * Existing call sites (e.g. convex/shared/favorites) keep working without
 * edits; on re-merge to superspace, swap this back to the real implementation.
 */
export async function getUserByExternalId(
  ctx: AnyConvexCtx,
  externalId: string,
): Promise<Doc<"users"> | null> {
  if (!externalId) return null;
  const db = dbFromCtx(ctx);
  try {
    return await db.get(externalId as Id<"users">);
  } catch {
    return null;
  }
}

export type MembershipInfo = {
  userId: string;
  userDocId: Id<"users">;
  workspaceId: Id<"workspaces">;
  roleLevel: number;
  permissions: string[];
};

export async function getMembership(
  ctx: AnyConvexCtx,
  workspaceId: Id<"workspaces"> | string,
): Promise<MembershipInfo | null> {
  const userId = await getAuthUserId(ctx as any);
  if (!userId) return null;

  const db = dbFromCtx(ctx);
  const user = await db.get(userId);
  if (!user) return null;
  const email = (user as any).email ?? null;

  const normalizedWorkspaceId =
    typeof workspaceId === "string"
      ? (db as any).normalizeId?.("workspaces", workspaceId) ?? null
      : workspaceId;
  if (!normalizedWorkspaceId) return null;
  const workspaceIdDoc = normalizedWorkspaceId as Id<"workspaces">;

  // Platform admin shortcut (highest priority)
  if (isPlatformAdmin(email)) {
    return {
      userId: String(userId),
      userDocId: userId,
      workspaceId: workspaceIdDoc,
      roleLevel: 0,
      permissions: ["*"],
    };
  }

  const membership = await db
    .query("workspaceMemberships")
    .withIndex("by_user_workspace", (q) =>
      q.eq("userId", userId).eq("workspaceId", workspaceIdDoc),
    )
    .unique();
  if (!membership) return null;

  const role = await db.get(membership.roleId);
  if (!role) {
    throw new Error(`Invalid role for membership ${membership._id}`);
  }
  if (role.level == null) {
    throw new Error(`Role ${role._id} missing level`);
  }

  const permissions = Array.from(
    new Set([...role.permissions, ...membership.additionalPermissions]),
  );

  return {
    userId: String(userId),
    userDocId: userId,
    workspaceId: workspaceIdDoc,
    roleLevel: membership.roleLevel ?? role.level,
    permissions,
  };
}

export async function requireMembership(
  ctx: AnyConvexCtx,
  workspaceId: Id<"workspaces"> | string,
): Promise<MembershipInfo> {
  const m = await getMembership(ctx, workspaceId);
  if (!m) throw new Error("Workspace membership required");
  return m;
}

export async function requirePermission(
  ctx: AnyConvexCtx,
  workspaceId: Id<"workspaces"> | string,
  permission: string,
): Promise<MembershipInfo> {
  const m = await requireMembership(ctx, workspaceId);
  if (m.permissions.includes("*")) return m;
  if (!m.permissions.includes(permission)) {
    throw new Error(`Missing required permission: ${permission}`);
  }
  return m;
}

export async function hasPermission(
  ctx: AnyConvexCtx,
  workspaceId: Id<"workspaces"> | string,
  permission: string,
): Promise<boolean> {
  const m = await getMembership(ctx, workspaceId);
  if (!m) return false;
  if (m.permissions.includes("*")) return true;
  return m.permissions.includes(permission);
}
