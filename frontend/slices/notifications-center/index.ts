export { notificationsCenterFeature } from "./config";

export { NotificationBell, type NotificationBellProps } from "./components/NotificationBell";
export { NotificationList, type NotificationListProps } from "./components/NotificationList";
export { NotificationItem, type NotificationItemProps } from "./components/NotificationItem";

export { useNotifications, type UseNotifications } from "./hooks/useNotifications";

export {
  createMemoryNotificationsAdapter,
  type NotificationsAdapter,
} from "./lib/adapter";
export { relativeTime } from "./lib/relativeTime";
export type {
  Notification,
  NotificationKind,
  NotificationActor,
} from "./lib/types";
