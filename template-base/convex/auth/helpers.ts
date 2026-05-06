/**
 * Studio extraction stubs (resources/ project, single-tenant).
 *
 * SuperSpace ships a 6-tier RBAC. Resources/ is a workshop project for one
 * builder, so we replace the helpers with single-tenant passthroughs.
 *
 * `ensureUser` / `getExistingUserId` still require auth (so signed-out callers
 * are rejected). `requirePermission` / `requireActiveMembership` are no-ops —
 * any signed-in user can do anything.
 *
 * TODO: re-add real RBAC checks when Studio re-merges to SuperSpace.
 * Original helpers live at: superspace/convex/auth/helpers.ts.
 */

import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "../_generated/dataModel";

export async function getExistingUserId(ctx: any): Promise<Id<"users"> | null> {
  const userId = await getAuthUserId(ctx);
  if (userId && typeof userId !== "string") return userId as Id<"users">;
  return null;
}

export async function ensureUser(ctx: any): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId && typeof userId !== "string") return userId as Id<"users">;
  throw new Error("Not authenticated");
}

export async function requireActiveMembership(
  _ctx: any,
  _workspaceId: Id<"workspaces">,
  _opts?: { allowCreatorFallback?: boolean },
): Promise<{ membership: any | null; role: any | null }> {
  // TODO: re-add real check on re-merge.
  return { membership: null, role: null };
}

export async function requirePermission(
  _ctx: any,
  _workspaceId: Id<"workspaces">,
  _perm: string,
  _opts?: { allowCreatorFallback?: boolean },
): Promise<{ membership: any | null; role: any | null }> {
  // TODO: re-add real check on re-merge.
  return { membership: null, role: null };
}

export async function canPermission(
  _ctx: any,
  _workspaceId: Id<"workspaces">,
  _perm: string,
  _opts?: { allowCreatorFallback?: boolean },
): Promise<boolean> {
  // TODO: re-add real check on re-merge.
  return true;
}
