// Agentic tool collection (Tier A* — ADMIN). Read tools are pure (preset
// catalog + permission checkers); grant/revoke forward to a server-gated
// binding (RBAC `roles.manage` enforced in YOUR backend, never here).

import { defineToolCollection, noArgs, obj, str } from "@/shared/agentic";
import { ROLE_PRESETS } from "./roles";
import { PERMISSION_GROUPS } from "./permission-catalog";
import { roleHasPermission } from "./check";
import type { RoleSlug } from "./roles";

export type RbacRolesCtx = {
  /** Server-gated mutations — resolve to a short readback. */
  grant: (roleSlug: string, permission: string) => Promise<string>;
  revoke: (roleSlug: string, permission: string) => Promise<string>;
};

export const rbacRolesTools = defineToolCollection<RbacRolesCtx>({
  namespace: "rbac-roles",
  tools: [
    {
      name: "list_roles",
      description: "List the role presets (slug, name, level, permission count).",
      parameters: noArgs,
      run: () =>
        ROLE_PRESETS.map((r) => `${r.slug} "${r.name}" level=${r.level} perms=${r.permissions.length}${r.isDefault ? " (default)" : ""}`).join("\n"),
    },
    {
      name: "list_permissions",
      description: "List the permission catalog grouped by domain.",
      parameters: noArgs,
      run: () =>
        PERMISSION_GROUPS.map((g) => `${g.group}: ${g.permissions.map((p) => p.key).join(", ")}`).join("\n"),
    },
    {
      name: "check",
      description: "Check whether a role has a permission (wildcard-aware).",
      parameters: obj({ "roleSlug!": str("role slug"), "permission!": str("permission key, e.g. members.manage") }),
      run: (_ctx, a) =>
        `${a.roleSlug}.${a.permission} = ${roleHasPermission(a.roleSlug as RoleSlug, a.permission as string)}`,
    },
    {
      name: "grant",
      description: "Grant a permission to a role (server-gated: roles.manage).",
      parameters: obj({ "roleSlug!": str("role slug"), "permission!": str("permission key") }),
      run: (ctx, a) => ctx.grant(a.roleSlug as string, a.permission as string),
    },
    {
      name: "revoke",
      description: "Revoke a permission from a role (server-gated: roles.manage).",
      parameters: obj({ "roleSlug!": str("role slug"), "permission!": str("permission key") }),
      run: (ctx, a) => ctx.revoke(a.roleSlug as string, a.permission as string),
    },
  ],
});
