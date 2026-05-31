/**
 * user-management slice contract — members surface (P1).
 *
 * Props-driven + RBAC-agnostic. Peers rbac-roles (roles + permission
 * helpers) and convex-auth (identity). Invites (P2) + roles admin (P3)
 * extend this.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "user-management",
  version: "0.1.0",
  category: "auth",
  kind: "full",
  provides: {
    components: ["MembersPanel", "MembersTable", "MembersToolbar", "MemberRowActions", "RoleChip"],
    hooks: ["useMembersView"],
    utils: ["can", "matchPermission"],
    convex: {
      tables: ["um_members"],
      rbac: ["members.view", "members.manage", "members.invite"],
    },
  },
  requires: {
    deps: [
      { npm: "next", range: "^15" },
      { npm: "react", range: "^18" },
    ],
    shadcn: ["avatar", "badge", "button", "dropdown-menu", "input", "select", "table"],
    env: [],
    peers: [
      { slug: "rbac-roles", range: "^0.2" },
      { slug: "convex-auth", range: "^0.1" },
    ],
  },
  conflicts: [],
});
