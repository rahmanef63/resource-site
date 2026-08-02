"use client";

import { useSyncExternalStore } from "react";
import type { NotificationsAdapter } from "../lib/adapter";
import type { Notification } from "../lib/types";

export type UseNotifications = {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clear: () => void;
};

/** Bind a host-supplied adapter store to React. Re-renders on every adapter
 *  mutation via useSyncExternalStore; mutators delegate straight through. */
export function useNotifications(adapter: NotificationsAdapter): UseNotifications {
  const notifications = useSyncExternalStore(
    adapter.subscribe,
    adapter.getSnapshot,
    adapter.getSnapshot,
  );

  return {
    notifications,
    unreadCount: notifications.reduce((n, x) => (x.read ? n : n + 1), 0),
    markRead: adapter.markRead,
    markAllRead: adapter.markAllRead,
    dismiss: adapter.dismiss,
    clear: adapter.clear,
  };
}
