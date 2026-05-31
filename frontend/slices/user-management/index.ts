// user-management — members + invites + roles admin (props-driven,
// RBAC-agnostic). Pair with rbac-roles (roles + resolved permissions +
// permission catalog) and convex-auth (identity). P1–P3 shipped.

export { UserManagementPanel, type UserManagementPanelProps } from "./components/UserManagementPanel";
export { MembersPanel, type MembersPanelProps } from "./components/MembersPanel";
export { MembersTable } from "./components/MembersTable";
export { MembersToolbar } from "./components/MembersToolbar";
export { MemberRowActions } from "./components/MemberRowActions";
export { RoleChip } from "./components/RoleChip";
export { InviteDialog } from "./components/InviteDialog";
export { PendingInvites } from "./components/PendingInvites";
export { RolesPanel, type RolesPanelProps } from "./components/RolesPanel";
export { RoleEditor } from "./components/RoleEditor";
export { RolePermissionGrid } from "./components/RolePermissionGrid";
export { TeamsPanel, type TeamsPanelProps } from "./components/TeamsPanel";
export { TeamDetail } from "./components/TeamDetail";
export { useMembersView, type MembersView, type SortKey } from "./hooks/useMembersView";
export { can, matchPermission } from "./lib/can";
export {
  DEFAULT_MEMBERS_LABELS, DEFAULT_ROLES_LABELS, DEFAULT_TEAMS_LABELS,
  type Member, type MemberStatus, type RoleOption, type MembersLabels,
  type Invite, type InviteInput, type InviteStatus, type InviteStrategy,
  type ManagedRole, type PermissionGroupDef, type PermissionDefLite, type RolesLabels,
  type Team, type TeamsLabels,
} from "./types";
