// Tenant-hierarchy mutations (P4b): link/unlink tenants + propagating
// invites. Gated via rbac-roles. The tree is generic edges in
// `um_tenant_links`; rr never owns the tenant entities themselves.

import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "../../../_generated/server";
import { requirePermission } from "../../rbac_roles/lib/permissions";
import { collectDescendants } from "./query";

const tenantArg = v.union(v.string(), v.null());
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function newToken() {
  return crypto.randomUUID().replace(/-/g, "") + Date.now().toString(36);
}

/** Add a parent→child tenant edge. Gated members.manage on the parent. */
export const linkTenant = mutation({
  args: { parentTenantId: tenantArg, childTenantId: v.string() },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.parentTenantId, "members.manage");
    const existing = await ctx.db
      .query("um_tenant_links")
      .withIndex("by_parent", (q) => q.eq("parentTenantId", args.parentTenantId))
      .take(500);
    if (existing.some((l) => l.childTenantId === args.childTenantId)) return { ok: true };
    await ctx.db.insert("um_tenant_links", {
      parentTenantId: args.parentTenantId, childTenantId: args.childTenantId,
      linkedBy: (await getAuthUserId(ctx)) ?? undefined, linkedAt: Date.now(),
    });
    return { ok: true };
  },
});

export const unlinkTenant = mutation({
  args: { parentTenantId: tenantArg, childTenantId: v.string() },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.parentTenantId, "members.manage");
    const links = await ctx.db
      .query("um_tenant_links")
      .withIndex("by_parent", (q) => q.eq("parentTenantId", args.parentTenantId))
      .take(500);
    for (const l of links) if (l.childTenantId === args.childTenantId) await ctx.db.delete(l._id);
    return { ok: true };
  },
});

async function roleLadder(ctx, tenantId) {
  const roles = await ctx.db
    .query("rbac_roles")
    .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
    .take(50);
  return roles.sort((a, b) => (a.level ?? 99) - (b.level ?? 99)).map((r) => r.slug);
}
async function pendingInviteFor(ctx, tenantId, email) {
  const rows = await ctx.db
    .query("um_invites")
    .withIndex("by_tenant_status", (q) => q.eq("tenantId", tenantId).eq("status", "pending"))
    .take(500);
  return rows.some((r) => r.email === email);
}

/** Invite an email to a root tenant + its descendants. `same` keeps the
 *  role everywhere; `decreasing` steps one role down the rbac_roles
 *  level-ladder per depth. Skips tenants with a pending invite. Gated
 *  members.invite on the root. */
export const sendHierarchyInvite = mutation({
  args: {
    rootTenantId: tenantArg,
    email: v.string(),
    roleSlug: v.string(),
    strategy: v.union(v.literal("same"), v.literal("decreasing")),
    maxDepth: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.rootTenantId, "members.invite");
    const email = args.email.trim().toLowerCase();
    const inviterId = (await getAuthUserId(ctx)) ?? "system";
    const targets = [{ id: args.rootTenantId, depth: 0 }, ...(await collectDescendants(ctx, args.rootTenantId, args.maxDepth ?? 10))];
    const ladder = args.strategy === "decreasing" ? await roleLadder(ctx, args.rootTenantId) : [];
    const baseIdx = ladder.indexOf(args.roleSlug);
    const now = Date.now();
    let invited = 0;
    for (const t of targets) {
      if (await pendingInviteFor(ctx, t.id, email)) continue;
      const role = (args.strategy === "decreasing" && ladder.length && baseIdx >= 0)
        ? ladder[Math.min(baseIdx + t.depth, ladder.length - 1)]
        : args.roleSlug;
      await ctx.db.insert("um_invites", {
        tenantId: t.id, inviterId, email, roleSlug: role, status: "pending",
        token: newToken(), createdAt: now, expiresAt: now + INVITE_TTL_MS,
      });
      invited++;
    }
    return { invited };
  },
});
