// user-management queries. Reuses rbac-roles' permission resolver.

import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getActorPermissions } from "../rbac-roles/lib/permissions";

/** List a tenant's members, enriched with profile fields from `users`.
 *  Soft-denies to [] without members.view. Inactive members hidden unless
 *  `includeInactive`. */
export const listMembers = query({
  args: {
    tenantId: v.union(v.string(), v.null()),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, { tenantId, includeInactive }) => {
    const perms = await getActorPermissions(ctx, tenantId);
    const canView = perms.some(
      (p) => p === "*" || p === "members.*" || p === "members.view" || p === "members.manage",
    );
    if (!canView) return [];

    const rows = await ctx.db
      .query("um_members")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .take(1000);
    const visible = includeInactive ? rows : rows.filter((m) => m.status !== "inactive");

    return await Promise.all(
      visible.map(async (m) => {
        const user = (await ctx.db.get(m.userId as never)) as
          | { name?: string; email?: string; image?: string; avatarUrl?: string }
          | null;
        return {
          userId: m.userId,
          name: user?.name,
          email: user?.email,
          avatarUrl: user?.avatarUrl ?? user?.image,
          roleSlug: m.roleSlug,
          status: m.status,
          joinedAt: m.joinedAt,
          additionalPermissions: m.additionalPermissions ?? [],
        };
      }),
    );
  },
});

/** List a tenant's invitations (pending by default). Soft-denies to []
 *  without members.invite / members.manage. */
export const listInvites = query({
  args: {
    tenantId: v.union(v.string(), v.null()),
    status: v.optional(v.union(
      v.literal("pending"), v.literal("accepted"), v.literal("declined"), v.literal("expired"),
    )),
  },
  handler: async (ctx, { tenantId, status }) => {
    const perms = await getActorPermissions(ctx, tenantId);
    const canView = perms.some(
      (p) => p === "*" || p === "members.*" || p === "members.invite" || p === "members.manage",
    );
    if (!canView) return [];
    const wanted = status ?? "pending";
    const rows = await ctx.db
      .query("um_invites")
      .withIndex("by_tenant_status", (q) => q.eq("tenantId", tenantId).eq("status", wanted))
      .take(500);
    return rows.map((i) => ({
      id: i._id,
      email: i.email,
      roleSlug: i.roleSlug,
      status: i.status,
      createdAt: i.createdAt,
      expiresAt: i.expiresAt,
    }));
  },
});
