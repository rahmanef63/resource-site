// Public types for the user-management slice. Self-contained — the slice
// is RBAC-agnostic: you pass it `roles` (options) + `currentPerms` (the
// actor's resolved permission strings). Wire those from the rbac-roles
// slice at the app/consumer level.

export type MemberStatus = "active" | "inactive" | "pending";

export interface Member {
  userId: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  roleSlug: string;
  status: MemberStatus;
  joinedAt?: number;
  additionalPermissions?: string[];
}

/** A role the dropdown / filter / badge can show. Map these from
 *  rbac-roles' ROLE_PRESETS or your `listRoles` query. */
export interface RoleOption {
  slug: string;
  name: string;
  color?: string;
}

export interface MembersLabels {
  searchPlaceholder: string;
  allRoles: string;
  invite: string;
  empty: string;
  loading: string;
  columnsMember: string;
  columnsRole: string;
  columnsJoined: string;
  remove: string;
  pending: string;
  inactive: string;
}

export const DEFAULT_MEMBERS_LABELS: MembersLabels = {
  searchPlaceholder: "Search name or email…",
  allRoles: "All roles",
  invite: "Invite",
  empty: "No members match.",
  loading: "Loading members…",
  columnsMember: "Member",
  columnsRole: "Role",
  columnsJoined: "Joined",
  remove: "Remove from workspace",
  pending: "Pending",
  inactive: "Inactive",
};
