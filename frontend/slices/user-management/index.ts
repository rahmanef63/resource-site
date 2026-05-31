// user-management — members + invites surface (props-driven, RBAC-agnostic).
// Pair with rbac-roles (provides roles + resolved permissions) and
// convex-auth (user identity). P1 Members + P2 Invites shipped; roles
// admin (P3) lands next.

export { MembersPanel, type MembersPanelProps } from "./components/MembersPanel";
export { MembersTable } from "./components/MembersTable";
export { MembersToolbar } from "./components/MembersToolbar";
export { MemberRowActions } from "./components/MemberRowActions";
export { RoleChip } from "./components/RoleChip";
export { InviteDialog } from "./components/InviteDialog";
export { PendingInvites } from "./components/PendingInvites";
export { useMembersView, type MembersView, type SortKey } from "./hooks/useMembersView";
export { can, matchPermission } from "./lib/can";
export {
  DEFAULT_MEMBERS_LABELS,
  type Member, type MemberStatus, type RoleOption, type MembersLabels,
  type Invite, type InviteInput, type InviteStatus,
} from "./types";
