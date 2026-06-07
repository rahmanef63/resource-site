// user-management mutations — members, invites, teams. All gated via
// rbac-roles' requirePermission. removeMember soft-deletes (status ->
// inactive). (convex/** is excluded from the root tsc, so these run
// against the consumer's generated schema — kept untyped here.)

import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "../../_generated/server";
import { requirePermission } from "../rbac_roles/lib/permissions";

const tenantArg = v.union(v.string(), v.null());
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function newToken() {
  return crypto.randomUUID().replace(/-/g, "") + Date.now().toString(36);
}

async function findMember(ctx, tenantId, userId) {
  return await ctx.db
    .query("um_members")
    .withIndex("by_tenant_user", (q) => q.eq("tenantId", tenantId).eq("userId", userId))
    .first();
}

// ---- Members (members.manage) ----

export const addMember = mutation({
  args: { tenantId: tenantArg, userId: v.string(), roleSlug: v.string() },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.tenantId, "members.manage");
    const existing = await findMember(ctx, args.tenantId, args.userId);
    if (existing) {
      await ctx.db.patch(existing._id, { roleSlug: args.roleSlug, status: "active" });
      return existing._id;
    }
    return await ctx.db.insert("um_members", {
      tenantId: args.tenantId, userId: args.userId, roleSlug: args.roleSlug,
      status: "active", additionalPermissions: [], joinedAt: Date.now(),
    });
  },
});

export const updateMemberRole = mutation({
  args: { tenantId: tenantArg, userId: v.string(), roleSlug: v.string() },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.tenantId, "members.manage");
    const m = await findMember(ctx, args.tenantId, args.userId);
    if (!m) throw new Error("Member not found");
    await ctx.db.patch(m._id, { roleSlug: args.roleSlug });
    return { ok: true };
  },
});

export const removeMember = mutation({
  args: { tenantId: tenantArg, userId: v.string() },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.tenantId, "members.manage");
    const m = await findMember(ctx, args.tenantId, args.userId);
    if (!m) return { ok: false };
    await ctx.db.patch(m._id, { status: "inactive" });
    return { ok: true };
  },
});

// ---- Invitations (members.invite) ----

async function pendingInviteFor(ctx, tenantId, email) {
  const rows = await ctx.db
    .query("um_invites")
    .withIndex("by_tenant_status", (q) => q.eq("tenantId", tenantId).eq("status", "pending"))
    .take(500);
  return rows.find((r) => r.email === email) ?? null;
}

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
      tenantId: args.tenantId, inviterId: (await getAuthUserId(ctx)) ?? "system",
      email, roleSlug: args.roleSlug, status: "pending", message: args.message,
      token, createdAt: now, expiresAt: now + INVITE_TTL_MS,
    });
    return { inviteId, token };
  },
});

export const cancelInvite = mutation({
  args: { tenantId: tenantArg, inviteId: v.id("um_invites") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.tenantId, "members.invite");
    if (!(await ctx.db.get(args.inviteId))) return { ok: false };
    await ctx.db.delete(args.inviteId);
    return { ok: true };
  },
});

export const resendInvite = mutation({
  args: { tenantId: tenantArg, inviteId: v.id("um_invites") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.tenantId, "members.invite");
    if (!(await ctx.db.get(args.inviteId))) throw new Error("Invite not found");
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
    const inv = await ctx.db.query("um_invites").withIndex("by_token", (q) => q.eq("token", token)).first();
    if (!inv || inv.status !== "pending") throw new Error("Invite is no longer valid.");
    if (inv.expiresAt < Date.now()) {
      await ctx.db.patch(inv._id, { status: "expired" });
      throw new Error("Invite has expired.");
    }
    const existing = await findMember(ctx, inv.tenantId, userId);
    const now = Date.now();
    let memberId;
    if (existing) {
      await ctx.db.patch(existing._id, { roleSlug: inv.roleSlug, status: "active" });
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

// ---- Teams (members.manage) ----

export const createTeam = mutation({
  args: { tenantId: tenantArg, name: v.string(), description: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.tenantId, "members.manage");
    return await ctx.db.insert("um_teams", {
      tenantId: args.tenantId, name: args.name.trim(), description: args.description,
      createdBy: (await getAuthUserId(ctx)) ?? undefined, createdAt: Date.now(),
    });
  },
});

export const removeTeam = mutation({
  args: { tenantId: tenantArg, teamId: v.id("um_teams") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.tenantId, "members.manage");
    const tm = await ctx.db.query("um_team_members").withIndex("by_team", (q) => q.eq("teamId", args.teamId)).take(1000);
    for (const m of tm) await ctx.db.delete(m._id);
    await ctx.db.delete(args.teamId);
    return { ok: true };
  },
});

export const addTeamMember = mutation({
  args: { tenantId: tenantArg, teamId: v.id("um_teams"), userId: v.string() },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.tenantId, "members.manage");
    const existing = await ctx.db.query("um_team_members")
      .withIndex("by_team_user", (q) => q.eq("teamId", args.teamId).eq("userId", args.userId)).first();
    if (existing) return existing._id;
    return await ctx.db.insert("um_team_members", { teamId: args.teamId, userId: args.userId, addedAt: Date.now() });
  },
});

export const removeTeamMember = mutation({
  args: { tenantId: tenantArg, teamId: v.id("um_teams"), userId: v.string() },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.tenantId, "members.manage");
    const m = await ctx.db.query("um_team_members")
      .withIndex("by_team_user", (q) => q.eq("teamId", args.teamId).eq("userId", args.userId)).first();
    if (m) await ctx.db.delete(m._id);
    return { ok: true };
  },
});
