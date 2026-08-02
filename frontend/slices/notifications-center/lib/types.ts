/** notifications-center — public data shape.
 *
 *  A `Notification` is host-supplied (Convex row, websocket push, in-memory
 *  seed). The slice never invents data; it renders whatever the adapter feeds.
 *  All times are ISO-8601 strings so the feed is serialisable + SSR-safe. */

export type NotificationKind = "info" | "success" | "warning" | "error";

export type NotificationActor = {
  name: string;
  avatarUrl?: string;
};

export type Notification = {
  id: string;
  title: string;
  body?: string;
  kind: NotificationKind;
  read: boolean;
  /** ISO-8601 timestamp (e.g. "2026-06-01T09:30:00.000Z"). */
  createdAt: string;
  /** Optional deep-link target rendered as a SmartLink/anchor by the host. */
  href?: string;
  actor?: NotificationActor;
};
