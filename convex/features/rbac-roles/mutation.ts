// rbac-roles mutations. All gated on `roles.manage`. System (preset) roles
// are immutable. Keep SYSTEM_ROLES in sync with the frontend ROLE_PRESETS
// (frontend/slices/rbac-roles/lib/roles.ts) — convex can't import it.

import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { requirePermission } from "./lib/permissions";

const SYSTEM_ROLES = [
  { slug: "owner", name: "Owner", level: 0, color: "#7c3aed", isDefault: false, permissions: ["*"], description: "Full control of the workspace." },
  { slug: "admin", name: "Admin", level: 10, color: "#2563eb", isDefault: false, permissions: ["workspace.view", "workspace.manage", "members.*", "roles.*", "invitations.manage", "content.*", "database.*", "documents.*", "comments.*", "billing.*", "analytics.view", "settings.manage", "audit.view"], description: "Manage members, roles, content, billing and settings." },
  { slug: "manager", name: "Manager", level: 30, color: "#0891b2", isDefault: false, permissions: ["workspace.view", "members.view", "content.view", "content.create", "content.edit", "database.view", "database.create", "database.edit", "documents.*", "comments.manage", "analytics.view"], description: "Lead content + documents; view members and analytics." },
  { slug: "staff", name: "Staff", level: 50, color: "#16a34a", isDefault: false, permissions: ["workspace.view", "members.view", "content.view", "content.create", "content.edit", "database.view", "documents.view", "documents.create", "documents.edit", "comments.view", "comments.create"], description: "Create + edit content and documents; comment." },
  { slug: "client", name: "Client", level: 70, color: "#d97706", isDefault: true, permissions: ["workspace.view", "content.view", "documents.view", "comments.view", "comments.create"], description: "View shared content and documents; leave comments." },
  { slug: "guest", name: "Guest", level: 90, color: "#6b7280", isDefault: false, permissions: ["workspace.view", "content.view"], description: "Read-only access to shared content." },
];

const tenantArg = v.union(v.string(), v.null());

async function findRole(ctx: { db: { query: (t: string) => { withIndex: (i: string, f: (q: never) => unknown) => { first: () => Promise<unknown> } } } }, tenantId: string | null, slug: string) {
  return await ctx.db
    .query("rbac_roles")
    .withIndex("by_tenant_slug", (q: never) =>
      (q as { eq: (f: string, v: unknown) => { eq: (f: string, v: unknown) => unknown } })
        .eq("tenantId", tenantId).eq("slug", slug))
    .first();
}

/** Idempotently seed the 6 system roles for a tenant. */
export const seedSystemRoles = mutation({
  args: { tenantId: tenantArg },
  handler: async (ctx, { tenantId }) => {
    await requirePermission(ctx, tenantId, "roles.manage");
    const now = Date.now();
    for (const r of SYSTEM_ROLES) {
      if (await findRole(ctx, tenantId, r.slug)) continue;
      await ctx.db.insert("rbac_roles", { tenantId, ...r, isSystem: true, createdAt: now, updatedAt: now });
    }
    return { ok: true };
  },
});

/** Create or update a custom role. System roles are immutable. */
export const upsertRole = mutation({
  args: {
    tenantId: tenantArg,
    slug: v.string(),
    name: v.string(),
    permissions: v.array(v.string()),
    color: v.optional(v.string()),
    level: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.tenantId, "roles.manage");
    const existing = await findRole(ctx, args.tenantId, args.slug) as { _id: string; isSystem?: boolean; level?: number } | null;
    const now = Date.now();
    if (existing) {
      if (existing.isSystem) throw new Error("System roles cannot be edited.");
      await ctx.db.patch(existing._id as never, {
        name: args.name, permissions: args.permissions, color: args.color,
        level: args.level ?? existing.level ?? 50, description: args.description, updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("rbac_roles", {
      tenantId: args.tenantId, slug: args.slug, name: args.name, permissions: args.permissions,
      color: args.color, level: args.level ?? 50, isSystem: false, isDefault: false,
      description: args.description, createdAt: now, updatedAt: now,
    });
  },
});

/** Delete a custom role. System roles cannot be removed. */
export const removeRole = mutation({
  args: { tenantId: tenantArg, slug: v.string() },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.tenantId, "roles.manage");
    const role = await findRole(ctx, args.tenantId, args.slug) as { _id: string; isSystem?: boolean } | null;
    if (!role) return { ok: false };
    if (role.isSystem) throw new Error("System roles cannot be removed.");
    await ctx.db.delete(role._id as never);
    return { ok: true };
  },
});
