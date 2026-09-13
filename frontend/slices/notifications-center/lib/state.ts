import type { NotificationsAdapter } from "./adapter";
import type { Notification } from "./types";

export type NotificationTab = "all" | "unread";

export type NotificationsState = {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clear: () => void;
};

export function sortNotificationsNewestFirst(
  notifications: readonly Notification[],
): Notification[] {
  return [...notifications].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}

export function filterNotifications(
  notifications: readonly Notification[],
  tab: NotificationTab,
): Notification[] {
  const sorted = sortNotificationsNewestFirst(notifications);
  return tab === "unread" ? sorted.filter((notification) => !notification.read) : sorted;
}

export function createNotificationsState(
  adapter: NotificationsAdapter,
  snapshot: readonly Notification[] = adapter.getSnapshot(),
): NotificationsState {
  const notifications = sortNotificationsNewestFirst(snapshot);
  return {
    notifications,
    unreadCount: notifications.reduce(
      (count, notification) => count + (notification.read ? 0 : 1),
      0,
    ),
    markRead: adapter.markRead,
    markAllRead: adapter.markAllRead,
    dismiss: adapter.dismiss,
    clear: adapter.clear,
  };
}
