// user-management mutations. All gated on `members.manage` via rbac-roles.
// removeMember soft-deletes (status -> inactive), matching superspace.

import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { requirePermission } from "../rbac-roles/lib/permissions";

const tenantArg = v.union(v.string(), v.null());

async function findMember(
  ctx: { db: { query: (t: string) => { withIndex: (i: string, f: (q: never) => unknown) => { first: () => Promise<unknown> } } } },
  tenantId: string | null,
  userId: string,
) {
  return await ctx.db
    .query("um_members")
    .withIndex("by_tenant_user", (q: never) =>
      (q as { eq: (f: string, v: unknown) => { eq: (f: string, v: unknown) => unknown } })
        .eq("tenantId", tenantId).eq("userId", userId))
    .first();
}

/** Add or reactivate a member with a role. */
export const addMember = mutation({
  args: { tenantId: tenantArg, userId: v.string(), roleSlug: v.string() },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.tenantId, "members.manage");
    const existing = await findMember(ctx, args.tenantId, args.userId) as { _id: string } | null;
    if (existing) {
      await ctx.db.patch(existing._id as never, { roleSlug: args.roleSlug, status: "active" });
      return existing._id;
    }
    return await ctx.db.insert("um_members", {
      tenantId: args.tenantId, userId: args.userId, roleSlug: args.roleSlug,
      status: "active", additionalPermissions: [], joinedAt: Date.now(),
    });
  },
});

/** Change a member's role. */
export const updateMemberRole = mutation({
  args: { tenantId: tenantArg, userId: v.string(), roleSlug: v.string() },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.tenantId, "members.manage");
    const m = await findMember(ctx, args.tenantId, args.userId) as { _id: string } | null;
    if (!m) throw new Error("Member not found");
    await ctx.db.patch(m._id as never, { roleSlug: args.roleSlug });
    return { ok: true };
  },
});

/** Soft-remove a member (status -> inactive). */
export const removeMember = mutation({
  args: { tenantId: tenantArg, userId: v.string() },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.tenantId, "members.manage");
    const m = await findMember(ctx, args.tenantId, args.userId) as { _id: string } | null;
    if (!m) return { ok: false };
    await ctx.db.patch(m._id as never, { status: "inactive" });
    return { ok: true };
  },
});
