/**
 * rbac-roles slice contract — the RBAC engine.
 *
 * Roles + permissions + check helpers + props-driven UI primitives. The
 * members / invites / roles-admin surface lives in the `user-management`
 * slice, which peers this one.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "rbac-roles",
  version: "0.2.0",
  category: "auth",
  kind: "full",
  provides: {
    components: ["PermissionGate", "RoleBadge", "PermissionMatrix"],
    hooks: ["usePermissions"],
    utils: [
      "PERMS", "matchPermission", "ROLE_PRESETS", "ROLE_MAP",
      "resolvePermissions", "hasPermission", "roleHasPermission",
      "roleLevel", "isAtLeast", "PERMISSION_GROUPS",
    ],
    convex: {
      tables: ["rbac_roles"],
      rbac: ["roles.view", "roles.manage"],
    },
  },
  requires: {
    deps: [
      { npm: "next", range: "^15" },
      { npm: "react", range: "^18" },
    ],
    shadcn: ["badge", "checkbox", "label"],
    env: [],
    peers: [{ slug: "convex-auth", range: "^0.1" }],
  },
  conflicts: [],
});
