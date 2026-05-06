export type InvitationDisplayLike = {
  type?: "workspace" | "personal" | string | null;
  inviter?: {
    name?: string | null;
    email?: string | null;
  } | null;
  inviterName?: string | null;
  inviterEmail?: string | null;
  workspace?: {
    name?: string | null;
  } | null;
};

function pickText(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }

  return undefined;
}

export function getInvitationInviterDisplayName(invitation: InvitationDisplayLike) {
  return pickText(
    invitation.inviter?.name,
    invitation.inviterName,
    invitation.inviter?.email,
    invitation.inviterEmail
  ) ?? "Someone";
}

export function getInvitationInviterEmail(invitation: InvitationDisplayLike) {
  return pickText(invitation.inviter?.email, invitation.inviterEmail);
}

export function formatInvitationInviter(invitation: InvitationDisplayLike) {
  const displayName = getInvitationInviterDisplayName(invitation);
  const email = getInvitationInviterEmail(invitation);

  if (!email || email === displayName) {
    return displayName;
  }

  return `${displayName} (${email})`;
}

export function getInvitationNotificationMessage(invitation: InvitationDisplayLike) {
  const inviterDisplayName = getInvitationInviterDisplayName(invitation);

  if (invitation.type === "personal") {
    return `${inviterDisplayName} sent you a contact request`;
  }

  return `${inviterDisplayName} invited you to ${pickText(invitation.workspace?.name) ?? "a workspace"}`;
}
