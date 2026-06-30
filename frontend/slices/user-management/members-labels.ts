// Members surface copy — interface + defaults. Split out of types.ts so the
// types module stays under the file-size cap. Re-exported from ./types, so
// consumers keep importing { MembersLabels, DEFAULT_MEMBERS_LABELS } from there.

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
  active: string;
  activate: string;
  deactivate: string;
  // Invite flow
  inviteTitle: string;
  inviteDescription: string;
  inviteEmail: string;
  inviteRole: string;
  inviteMessage: string;
  inviteMessagePlaceholder: string;
  inviteSubmit: string;
  inviteSending: string;
  copyLink: string;
  joinLinkHint: string;
  cancel: string;
  pendingTitle: string;
  resend: string;
  cancelInvite: string;
  // Hierarchy propagation (P4b)
  propagate: string;
  propagateHint: string;
  strategySame: string;
  strategyStep: string;
  maxDepth: string;
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
  active: "Active",
  activate: "Activate",
  deactivate: "Deactivate",
  inviteTitle: "Invite a member",
  inviteDescription: "Send an email invite. They'll join with the role you pick.",
  inviteEmail: "Email",
  inviteRole: "Role",
  inviteMessage: "Message (optional)",
  inviteMessagePlaceholder: "Add a short note to the invite…",
  inviteSubmit: "Send invite",
  inviteSending: "Sending…",
  copyLink: "Copy link",
  joinLinkHint: "Share this link so they can set a password and sign in.",
  cancel: "Cancel",
  pendingTitle: "Pending invitations",
  resend: "Resend invite",
  cancelInvite: "Cancel invite",
  propagate: "Also invite to sub-workspaces",
  propagateHint: "Send the invite down the workspace hierarchy.",
  strategySame: "Same role everywhere",
  strategyStep: "Step role down per level",
  maxDepth: "Max depth",
};
