// Tenant-hierarchy queries (P4b). The tree is stored as generic parent→
// child edges in `um_tenant_links`; rr doesn't own the tenant entities.

import { v } from "convex/values";
import { query } from "../../../_generated/server";
import { getActorPermissions } from "../../rbac_roles/lib/permissions";

const tenantArg = v.union(v.string(), v.null());

async function canViewMembers(ctx, tenantId) {
  const perms = await getActorPermissions(ctx, tenantId);
  return perms.some((p) => p === "*" || p === "members.*" || p === "members.view" || p === "members.manage");
}

/** BFS over the link table → descendant tenants with their depth (cycle
 *  safe, depth-capped). Exported for the propagating-invite mutation. */
export async function collectDescendants(ctx, rootTenantId, maxDepth) {
  const out = [];
  const seen = new Set([rootTenantId]);
  let frontier = [{ id: rootTenantId, depth: 0 }];
  while (frontier.length) {
    const next = [];
    for (const node of frontier) {
      if (node.depth >= maxDepth) continue;
      const links = await ctx.db
        .query("um_tenant_links")
        .withIndex("by_parent", (q) => q.eq("parentTenantId", node.id))
        .take(500);
      for (const l of links) {
        if (seen.has(l.childTenantId)) continue;
        seen.add(l.childTenantId);
        const child = { id: l.childTenantId, depth: node.depth + 1 };
        out.push(child);
        next.push(child);
      }
    }
    frontier = next;
  }
  return out;
}

/** Direct child tenant ids of a parent. Soft-denies without members.view. */
export const listChildTenants = query({
  args: { parentTenantId: tenantArg },
  handler: async (ctx, { parentTenantId }) => {
    if (!(await canViewMembers(ctx, parentTenantId))) return [];
    const links = await ctx.db
      .query("um_tenant_links")
      .withIndex("by_parent", (q) => q.eq("parentTenantId", parentTenantId))
      .take(500);
    return links.map((l) => l.childTenantId);
  },
});

/** All descendant tenants (with depth) under a root. */
export const getDescendantTenants = query({
  args: { rootTenantId: tenantArg, maxDepth: v.optional(v.number()) },
  handler: async (ctx, { rootTenantId, maxDepth }) => {
    if (!(await canViewMembers(ctx, rootTenantId))) return [];
    return await collectDescendants(ctx, rootTenantId, maxDepth ?? 10);
  },
});

/** Cross-tenant access matrix (P4c): users × tenants → roleSlug, across a
 *  root + its descendants. Soft-denies (empty) without members.view on the
 *  root. The cell key mirrors the frontend `tenantKey` (null → "__root__"). */
export const getAccessMatrix = query({
  args: { rootTenantId: tenantArg, maxDepth: v.optional(v.number()) },
  handler: async (ctx, { rootTenantId, maxDepth }) => {
    if (!(await canViewMembers(ctx, rootTenantId))) return { tenants: [], users: [], cells: {} };
    const tenants = [{ id: rootTenantId, depth: 0 }, ...(await collectDescendants(ctx, rootTenantId, maxDepth ?? 10))];
    const cells = {};
    const userIds = new Set();
    for (const t of tenants) {
      const members = await ctx.db
        .query("um_members")
        .withIndex("by_tenant", (q) => q.eq("tenantId", t.id))
        .take(1000);
      for (const m of members) {
        if (m.status !== "active") continue;
        userIds.add(m.userId);
        (cells[m.userId] ??= {})[t.id ?? "__root__"] = m.roleSlug;
      }
    }
    const users = await Promise.all(
      [...userIds].map(async (uid) => {
        const u = await ctx.db.get(uid);
        return { userId: uid, name: u?.name, email: u?.email, avatarUrl: u?.avatarUrl ?? u?.image };
      }),
    );
    return { tenants, users, cells };
  },
});
