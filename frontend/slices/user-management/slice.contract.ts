/**
 * user-management slice contract — members + invites + roles admin (P1–P3).
 *
 * Props-driven + RBAC-agnostic. Peers rbac-roles (roles + permission
 * helpers + catalog) and convex-auth (identity). Full-parity extras (P4)
 * extend this.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "user-management",
  version: "0.6.0",
  category: "auth",
  kind: "full",
  provides: {
    components: ["UserManagementPanel", "MembersPanel", "MembersTable", "MembersToolbar", "MemberRowActions", "RoleChip", "InviteDialog", "PendingInvites", "RolesPanel", "RoleEditor", "RolePermissionGrid", "TeamsPanel", "TeamDetail", "AccessMatrix"],
    hooks: ["useMembersView"],
    utils: ["can", "matchPermission"],
    convex: {
      tables: ["um_members", "um_invites", "um_teams", "um_team_members", "um_tenant_links"],
      rbac: ["members.view", "members.manage", "members.invite", "roles.view", "roles.manage"],
    },
  },
  requires: {
    deps: [
      { npm: "next", range: "^15" },
      { npm: "react", range: "^18" },
    ],
    shadcn: ["avatar", "badge", "button", "checkbox", "dialog", "dropdown-menu", "input", "label", "select", "switch", "table", "tabs", "textarea"],
    env: [],
    peers: [
      { slug: "rbac-roles", range: "^0.2" },
      { slug: "convex-auth", range: "^0.1" },
    ],
  },
  conflicts: [],
});
