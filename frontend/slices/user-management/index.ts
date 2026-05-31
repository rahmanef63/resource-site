// user-management — members surface (props-driven, RBAC-agnostic).
// Pair with rbac-roles (provides roles + resolved permissions) and
// convex-auth (user identity). P1 ships Members; invites (P2) + roles
// admin (P3) land next.

export { MembersPanel, type MembersPanelProps } from "./components/MembersPanel";
export { MembersTable } from "./components/MembersTable";
export { MembersToolbar } from "./components/MembersToolbar";
export { MemberRowActions } from "./components/MemberRowActions";
export { RoleChip } from "./components/RoleChip";
export { useMembersView, type MembersView, type SortKey } from "./hooks/useMembersView";
export { can, matchPermission } from "./lib/can";
export {
  DEFAULT_MEMBERS_LABELS,
  type Member, type MemberStatus, type RoleOption, type MembersLabels,
} from "./types";
