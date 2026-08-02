"use client";

import * as React from "react";
import {
  NotificationBell,
  NotificationList,
  createMemoryNotificationsAdapter,
  useNotifications,
  type Notification,
} from "@/features/notifications-center";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";

const NOW = "2026-06-06T12:00:00.000Z";

const SEED: Notification[] = [
  { id: "1", title: "Rahman commented on your PR", body: "Looks good — ship it after the lint fix.", kind: "info", read: false, createdAt: "2026-06-06T11:58:00.000Z", actor: { name: "Rahman" } },
  { id: "2", title: "Deploy succeeded", body: "resources @ main built in 42s.", kind: "success", read: false, createdAt: "2026-06-06T11:30:00.000Z" },
  { id: "3", title: "Storage at 82%", body: "Consider pruning old preview chunks.", kind: "warning", read: false, createdAt: "2026-06-06T09:15:00.000Z" },
  { id: "4", title: "Webhook delivery failed", body: "Dokploy returned 502 — retrying.", kind: "error", read: false, createdAt: "2026-06-05T18:40:00.000Z" },
  { id: "5", title: "Aria invited you to a workspace", kind: "info", read: true, createdAt: "2026-06-05T08:00:00.000Z", actor: { name: "Aria" } },
  { id: "6", title: "Slice published", body: "feature-grid 0.1.0 is live in the catalog.", kind: "success", read: true, createdAt: "2026-06-04T16:20:00.000Z" },
  { id: "7", title: "New sign-in from Chrome", body: "Linux · Jakarta.", kind: "info", read: true, createdAt: "2026-06-03T22:05:00.000Z" },
  { id: "8", title: "Plan limit reached", body: "Upgrade to lift the 70-slice cap.", kind: "warning", read: true, createdAt: "2026-06-01T10:00:00.000Z" },
];

export default function Page() {
  const adapter = React.useMemo(() => createMemoryNotificationsAdapter(SEED), []);
  const n = useNotifications(adapter);

  return (
    <SlicePreviewLayout title="Notifications Center" kind="ui" maxWidth="6xl">
      <PreviewSection title="In a topbar" hint='surface="popover"'>
        <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5">
          <span className="text-sm font-semibold">Acme Console</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{n.unreadCount} unread</span>
            <NotificationBell
              notifications={n.notifications}
              unreadCount={n.unreadCount}
              now={NOW}
              surface="popover"
              onMarkRead={n.markRead}
              onMarkAllRead={n.markAllRead}
              onDismiss={n.dismiss}
              onClear={n.clear}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          The bell, list, and embedded panel below share one in-memory adapter —
          mark-read / dismiss / clear stay in sync across all three.
        </p>
      </PreviewSection>

      <PreviewSection title="Embedded panel" hint="<NotificationList /> standalone">
        <div className="max-w-sm rounded-lg border border-border bg-background">
          <NotificationList
            notifications={n.notifications}
            unreadCount={n.unreadCount}
            now={NOW}
            onMarkRead={n.markRead}
            onMarkAllRead={n.markAllRead}
            onDismiss={n.dismiss}
            onClear={n.clear}
          />
        </div>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
