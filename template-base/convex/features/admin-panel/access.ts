/**
 * Admin access query — single backend resolver for "can this user see /admin?".
 * Mirrors the resolution order in hooks/useAdminAccess.ts.
 */

import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { isPlatformAdmin } from "../../lib/rbac/platform-admin";
import { getUserPermissions } from "../../lib/rbac/permissions";

const ADMIN_TOKEN = "PLATFORM_ADMIN";

export const getMyAdminAccess = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { level: "denied", permissions: [], email: null };
    }

    const user = await ctx.db.get(userId);

    if (isPlatformAdmin(user?.email ?? null)) {
      return {
        level: "platform_admin",
        permissions: ["*"],
        email: user?.email ?? null,
      };
    }

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      return { level: "denied", permissions: [], email: user?.email ?? null };
    }

    const ownerId =
      (workspace as any).userId ?? (workspace as any).createdBy ?? null;
    if (ownerId === userId) {
      return {
        level: "workspace_owner",
        permissions: ["*"],
        email: user?.email ?? null,
      };
    }

    const membership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", userId).eq("workspaceId", args.workspaceId),
      )
      .first();
    if (!membership) {
      return { level: "denied", permissions: [], email: user?.email ?? null };
    }

    const role = await ctx.db.get(membership.roleId);
    const rolePerms = (role?.permissions ?? []) as string[];
    const extra = (membership.additionalPermissions ?? []) as string[];
    const permissions = [...new Set([...rolePerms, ...extra])];

    if (role?.slug === "owner" || role?.slug === "admin" || rolePerms.includes("*")) {
      return { level: "workspace_admin", permissions, email: user?.email ?? null };
    }

    if (extra.includes(ADMIN_TOKEN) || extra.includes("*")) {
      return { level: "delegated_admin", permissions, email: user?.email ?? null };
    }

    return { level: "denied", permissions, email: user?.email ?? null };
  },
});

/** Re-exported for ad-hoc use elsewhere on the backend. */
export { getUserPermissions };
