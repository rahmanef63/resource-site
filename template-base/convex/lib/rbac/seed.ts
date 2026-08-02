/**
 * Seed system roles into a workspace, scoped to a tier preset.
 *
 *   solo         → owner + admin
 *   influencer   → owner + admin + manager
 *   organization → owner + admin + manager + staff + client + guest
 *
 * Call right after a workspace is created. Idempotent — re-running won't
 * duplicate roles (matches by workspace + slug).
 */

import type { MutationCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import {
  RBAC_TIER_PRESETS,
  ROLE_TEMPLATES,
  getRoleTemplatesForTier,
  type RbacTier,
  type RoleTemplate,
} from "./role-templates";

export interface SeededRole {
  slug: RoleTemplate["slug"];
  roleId: Id<"roles">;
  created: boolean;
}

/**
 * Create (or upsert) the tier's system roles in the given workspace.
 * Returns the seeded role IDs keyed by slug so the caller can pick the
 * default (`isDefault: true`) for the owner's membership.
 */
export async function seedWorkspaceRoles(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  tier: RbacTier,
  options: { actorUserId?: Id<"users"> } = {},
): Promise<SeededRole[]> {
  const templates = getRoleTemplatesForTier(tier);
  const seeded: SeededRole[] = [];

  for (const tmpl of templates) {
    const existing = await ctx.db
      .query("roles")
      .withIndex("by_workspace_slug", (q) =>
        q.eq("workspaceId", workspaceId).eq("slug", tmpl.slug),
      )
      .first();

    if (existing) {
      seeded.push({ slug: tmpl.slug, roleId: existing._id, created: false });
      continue;
    }

    const roleId = await ctx.db.insert("roles", {
      name: tmpl.name,
      slug: tmpl.slug,
      description: tmpl.description,
      workspaceId,
      level: tmpl.level,
      permissions: [...tmpl.workspacePermissions],
      color: tmpl.color,
      isDefault: tmpl.isDefault,
      isSystemRole: true,
      isSystem: true,
      createdBy: options.actorUserId ?? undefined,
      updatedBy: options.actorUserId ?? undefined,
    });
    seeded.push({ slug: tmpl.slug, roleId, created: true });
  }

  return seeded;
}

/** Find the seeded `owner` role for a workspace. Useful for binding the creator. */
export async function getOwnerRoleId(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
): Promise<Id<"roles"> | null> {
  const role = await ctx.db
    .query("roles")
    .withIndex("by_workspace_slug", (q) =>
      q.eq("workspaceId", workspaceId).eq("slug", "owner"),
    )
    .first();
  return role?._id ?? null;
}

/** Find the workspace's default role (for invitations). */
export async function getDefaultRoleId(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
): Promise<Id<"roles"> | null> {
  const roles = await ctx.db
    .query("roles")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .collect();
  const def = roles.find((r) => r.isDefault) ?? null;
  return def?._id ?? null;
}

export { RBAC_TIER_PRESETS, ROLE_TEMPLATES };
export type { RbacTier, RoleTemplate };
