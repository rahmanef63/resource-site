import { getInvitationNotificationMessage } from "@/frontend/shared/lib/invitations/display";

export const SYSTEM_NOTIFICATION_TYPES = [
  "mention",
  "task",
  "document",
  "project",
  "comment",
  "system",
] as const;

export type SystemNotificationType = (typeof SYSTEM_NOTIFICATION_TYPES)[number];
export type NotificationInboxTab = "all" | "invitation" | SystemNotificationType;

export type NotificationInboxItem = {
  _id: string;
  source: "system" | "invitation";
  type: "invitation" | SystemNotificationType;
  title: string;
  message: string;
  detail?: string;
  isRead: boolean;
  _creationTime: number;
  actionUrl?: string;
  actor?: {
    name?: string | null;
    email?: string | null;
  } | null;
};

export function isSystemNotificationType(value: string): value is SystemNotificationType {
  return SYSTEM_NOTIFICATION_TYPES.includes(value as SystemNotificationType);
}

export function buildNotificationInbox(
  systemNotifications: any[] = [],
  invitations: any[] = []
): NotificationInboxItem[] {
  const systemItems: NotificationInboxItem[] = systemNotifications.map((notification) => ({
    ...notification,
    source: "system",
  }));

  const invitationItems: NotificationInboxItem[] = invitations.map((invitation) => ({
    _id: `invitation:${String(invitation._id)}`,
    source: "invitation",
    type: "invitation",
    title: invitation.type === "personal" ? "New Contact Invitation" : "New Workspace Invitation",
    message: getInvitationNotificationMessage(invitation),
    detail: invitation.message ?? undefined,
    isRead: false,
    _creationTime: invitation._creationTime,
    actionUrl: "/dashboard/user-management#pending-invitations",
  }));

  return [...systemItems, ...invitationItems].sort((a, b) => b._creationTime - a._creationTime);
}

export function filterNotificationInbox(
  items: NotificationInboxItem[],
  activeTab: NotificationInboxTab
) {
  if (activeTab === "all") {
    return items;
  }

  return items.filter((item) => item.type === activeTab);
}

export function getNotificationInboxUnreadCount(
  unreadSystemCount: number | undefined,
  invitations: any[] | undefined
) {
  return (unreadSystemCount ?? 0) + (invitations?.length ?? 0);
}
