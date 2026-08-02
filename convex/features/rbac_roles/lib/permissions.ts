// Convex-side RBAC helpers. Resolve the authed user's permissions for a
// tenant from `um_members` (user-management slice) + `rbac_roles`, with a
// PLATFORM_ADMIN_EMAILS superadmin bypass. Mirrors the frontend engine's
// `matchPermission` logic.
//
// Gate every privileged query/mutation with `requirePermission`.

import { getAuthUserId } from "@convex-dev/auth/server";
import type { QueryCtx, MutationCtx } from "../../../_generated/server";

type Ctx = QueryCtx | MutationCtx;

function matchPermission(granted: string, wanted: string): boolean {
  if (granted === "*") return true;
  if (granted === wanted) return true;
  if (granted.endsWith(".*")) return wanted.startsWith(granted.slice(0, -1));
  return false;
}

async function isPlatformAdmin(ctx: Ctx, userId: string): Promise<boolean> {
  const emails = (process.env.PLATFORM_ADMIN_EMAILS ?? "")
    .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!emails.length) return false;
  const user = await ctx.db.get(userId as never);
  const email = (user as { email?: string } | null)?.email?.toLowerCase();
  return !!email && emails.includes(email);
}

/** Resolve the current actor's effective permissions for a tenant. */
export async function getActorPermissions(ctx: Ctx, tenantId: string | null): Promise<string[]> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return [];
  if (await isPlatformAdmin(ctx, userId)) return ["*"];

  const member = await ctx.db
    .query("um_members")
    .withIndex("by_tenant_user", (q: never) =>
      (q as { eq: (f: string, v: unknown) => { eq: (f: string, v: unknown) => unknown } })
        .eq("tenantId", tenantId).eq("userId", userId))
    .first();
  if (!member || (member as { status?: string }).status !== "active") return [];

  const additional: string[] = (member as { additionalPermissions?: string[] }).additionalPermissions ?? [];
  const roleSlug = (member as { roleSlug?: string }).roleSlug;
  const role = await ctx.db
    .query("rbac_roles")
    .withIndex("by_tenant_slug", (q: never) =>
      (q as { eq: (f: string, v: unknown) => { eq: (f: string, v: unknown) => unknown } })
        .eq("tenantId", tenantId).eq("slug", roleSlug))
    .first();
  const rolePerms: string[] = (role as { permissions?: string[] } | null)?.permissions ?? [];
  return [...new Set([...rolePerms, ...additional])];
}

export async function checkPermission(ctx: Ctx, tenantId: string | null, permission: string): Promise<boolean> {
  const perms = await getActorPermissions(ctx, tenantId);
  return perms.some((p) => matchPermission(p, permission));
}

export async function requirePermission(ctx: Ctx, tenantId: string | null, permission: string): Promise<void> {
  if (!(await checkPermission(ctx, tenantId, permission))) {
    throw new Error(`Forbidden: missing permission '${permission}'`);
  }
}
