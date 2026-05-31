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

export type InviteStatus = "pending" | "accepted" | "declined" | "expired";

export interface Invite {
  id: string;
  email: string;
  roleSlug: string;
  status: InviteStatus;
  createdAt?: number;
  expiresAt?: number;
}

export interface InviteInput {
  email: string;
  roleSlug: string;
  message?: string;
}

/** A role with its full permission set — for the roles admin (RolesPanel).
 *  Map from rbac-roles' `listRoles` query or ROLE_PRESETS. */
export interface ManagedRole {
  slug: string;
  name: string;
  color?: string;
  level?: number;
  description?: string;
  permissions: string[];
  isSystem?: boolean;
  isDefault?: boolean;
}

/** Grouped permission catalog injected into the roles editor (the slice
 *  doesn't import rbac-roles' PERMISSION_GROUPS — pass it at the app level). */
export interface PermissionDefLite { key: string; label: string }
export interface PermissionGroupDef { group: string; permissions: PermissionDefLite[] }

export interface RolesLabels {
  title: string;
  newRole: string;
  permissions: string;
  roleName: string;
  roleNamePlaceholder: string;
  roleDescription: string;
  roleDescriptionPlaceholder: string;
  save: string;
  saving: string;
  delete: string;
  systemRole: string;
  emptyEditor: string;
}

export const DEFAULT_ROLES_LABELS: RolesLabels = {
  title: "Roles",
  newRole: "New role",
  permissions: "Permissions",
  roleName: "Name",
  roleNamePlaceholder: "e.g. Editor",
  roleDescription: "Description",
  roleDescriptionPlaceholder: "What can this role do?",
  save: "Save role",
  saving: "Saving…",
  delete: "Delete",
  systemRole: "System role — permissions are fixed and can't be edited.",
  emptyEditor: "Select a role to view its permissions, or create a new one.",
};

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
  // Invite flow
  inviteTitle: string;
  inviteDescription: string;
  inviteEmail: string;
  inviteRole: string;
  inviteMessage: string;
  inviteMessagePlaceholder: string;
  inviteSubmit: string;
  inviteSending: string;
  cancel: string;
  pendingTitle: string;
  resend: string;
  cancelInvite: string;
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
  inviteTitle: "Invite a member",
  inviteDescription: "Send an email invite. They'll join with the role you pick.",
  inviteEmail: "Email",
  inviteRole: "Role",
  inviteMessage: "Message (optional)",
  inviteMessagePlaceholder: "Add a short note to the invite…",
  inviteSubmit: "Send invite",
  inviteSending: "Sending…",
  cancel: "Cancel",
  pendingTitle: "Pending invitations",
  resend: "Resend invite",
  cancelInvite: "Cancel invite",
};
