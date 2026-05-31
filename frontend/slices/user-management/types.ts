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
