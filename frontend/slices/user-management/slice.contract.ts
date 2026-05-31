/**
 * user-management slice contract — members + invites surface (P1+P2).
 *
 * Props-driven + RBAC-agnostic. Peers rbac-roles (roles + permission
 * helpers) and convex-auth (identity). Roles admin (P3) extends this.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "user-management",
  version: "0.2.0",
  category: "auth",
  kind: "full",
  provides: {
    components: ["MembersPanel", "MembersTable", "MembersToolbar", "MemberRowActions", "RoleChip", "InviteDialog", "PendingInvites"],
    hooks: ["useMembersView"],
    utils: ["can", "matchPermission"],
    convex: {
      tables: ["um_members", "um_invites"],
      rbac: ["members.view", "members.manage", "members.invite"],
    },
  },
  requires: {
    deps: [
      { npm: "next", range: "^15" },
      { npm: "react", range: "^18" },
    ],
    shadcn: ["avatar", "badge", "button", "dialog", "dropdown-menu", "input", "label", "select", "table", "textarea"],
    env: [],
    peers: [
      { slug: "rbac-roles", range: "^0.2" },
      { slug: "convex-auth", range: "^0.1" },
    ],
  },
  conflicts: [],
});
