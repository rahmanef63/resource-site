// user-management mutations. All gated on `members.manage` via rbac-roles.
// removeMember soft-deletes (status -> inactive), matching superspace.

import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "../../_generated/server";
import { requirePermission } from "../rbac-roles/lib/permissions";

const tenantArg = v.union(v.string(), v.null());
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function newToken(): string {
  return crypto.randomUUID().replace(/-/g, "") + Date.now().toString(36);
}

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

// ---- Invitations (members.invite) ----

async function pendingInviteFor(ctx: any, tenantId: string | null, email: string) {
  const rows = await ctx.db
    .query("um_invites")
    .withIndex("by_tenant_status", (q: any) => q.eq("tenantId", tenantId).eq("status", "pending"))
    .take(500);
  return rows.find((r: any) => r.email === email) ?? null;
}

/** Send an email invite (7-day token). Rejects a duplicate pending invite. */
export const sendInvite = mutation({
  args: { tenantId: tenantArg, email: v.string(), roleSlug: v.string(), message: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.tenantId, "members.invite");
    const email = args.email.trim().toLowerCase();
    if (await pendingInviteFor(ctx, args.tenantId, email)) {
      throw new Error("An invite is already pending for this email.");
    }
    const now = Date.now();
    const token = newToken();
    const inviteId = await ctx.db.insert("um_invites", {
      tenantId: args.tenantId,
      inviterId: (await getAuthUserId(ctx)) ?? "system",
      email,
      roleSlug: args.roleSlug,
      status: "pending",
      message: args.message,
      token,
      createdAt: now,
      expiresAt: now + INVITE_TTL_MS,
    });
    return { inviteId, token };
  },
});

/** Cancel (delete) a pending invite. */
export const cancelInvite = mutation({
  args: { tenantId: tenantArg, inviteId: v.id("um_invites") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.tenantId, "members.invite");
    const inv = await ctx.db.get(args.inviteId);
    if (!inv) return { ok: false };
    await ctx.db.delete(args.inviteId);
    return { ok: true };
  },
});

/** Regenerate the token + extend expiry on an existing invite. */
export const resendInvite = mutation({
  args: { tenantId: tenantArg, inviteId: v.id("um_invites") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.tenantId, "members.invite");
    const inv = await ctx.db.get(args.inviteId);
    if (!inv) throw new Error("Invite not found");
    const token = newToken();
    await ctx.db.patch(args.inviteId, { token, status: "pending", expiresAt: Date.now() + INVITE_TTL_MS });
    return { token };
  },
});

/** Accept an invite by token — creates/reactivates the membership for the
 *  signed-in user. Public (gated by the token, not a permission). */
export const acceptInvite = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in to accept the invite.");
    const inv = await ctx.db
      .query("um_invites")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    if (!inv || inv.status !== "pending") throw new Error("Invite is no longer valid.");
    if (inv.expiresAt < Date.now()) {
      await ctx.db.patch(inv._id, { status: "expired" });
      throw new Error("Invite has expired.");
    }
    const existing = await findMember(ctx, inv.tenantId, userId) as { _id: string } | null;
    const now = Date.now();
    let memberId;
    if (existing) {
      await ctx.db.patch(existing._id as never, { roleSlug: inv.roleSlug, status: "active" });
      memberId = existing._id;
    } else {
      memberId = await ctx.db.insert("um_members", {
        tenantId: inv.tenantId, userId, roleSlug: inv.roleSlug, status: "active",
        additionalPermissions: [], joinedAt: now, invitedBy: inv.inviterId,
      });
    }
    await ctx.db.patch(inv._id, { status: "accepted", acceptedAt: now });
    return { memberId };
  },
});
