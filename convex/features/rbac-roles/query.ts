// rbac-roles queries.

import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getActorPermissions } from "./lib/permissions";

/** List a tenant's roles. Visible to anyone who can view or manage roles;
 *  returns [] (soft-deny) otherwise. */
export const listRoles = query({
  args: { tenantId: v.union(v.string(), v.null()) },
  handler: async (ctx, { tenantId }) => {
    const perms = await getActorPermissions(ctx, tenantId);
    const canView = perms.some(
      (p) => p === "*" || p === "roles.*" || p === "roles.view" || p === "roles.manage",
    );
    if (!canView) return [];
    return await ctx.db
      .query("rbac_roles")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .take(200);
  },
});
