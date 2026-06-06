"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */
import * as React from "react";
import type { SlicePreviewModule } from "@/shared/preview/types";
import { createDemoStore } from "@/shared/preview/demo-store";
import { NotificationBell } from "./components/NotificationBell";
import { NotificationList } from "./components/NotificationList";
import { createMemoryNotificationsAdapter } from "./lib/adapter";
import { useNotifications } from "./hooks/useNotifications";
import type { Notification } from "./lib/types";

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

const { useDemoStore } = createDemoStore<Notification[]>({
  slug: "notifications-center",
  seed: SEED,
});

/** Seed a fresh in-memory adapter. The canonical bell feed hydrates from the
 *  demo store (so edits persist across reloads); scenario seeds pass
 *  `persist: false` and use their explicit shape. Each mount owns its adapter
 *  so live mark-read / dismiss / clear work without coupling. */
function useDemoAdapter(seed: Notification[], persist: boolean) {
  const [stored, , { ready }] = useDemoStore();
  const initial = persist && ready ? stored : seed;
  const adapter = React.useMemo(
    () => createMemoryNotificationsAdapter(initial),
    // re-seed once on hydration; scenario seeds are stable refs
    [persist, ready, seed],
  );
  const api = useNotifications(adapter);
  return { ...api, ready: persist ? ready : true };
}

const Bell: SlicePreviewModule["NotificationBell"] = ({ variant }) => {
  const surface = (variant.surface as "popover" | "sheet") ?? "popover";
  const { notifications, unreadCount, markRead, markAllRead, dismiss, clear, ready } =
    useDemoAdapter(SEED, true);
  if (!ready) return null;
  return (
    <div className="flex h-40 items-start justify-end p-4">
      <NotificationBell
        notifications={notifications}
        unreadCount={unreadCount}
        now={NOW}
        surface={surface}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        onDismiss={dismiss}
        onClear={clear}
      />
    </div>
  );
};

const List: SlicePreviewModule["NotificationList"] = ({ variant }) => {
  const scenario = variant.scenario ?? "mixed";
  const seed =
    scenario === "empty"
      ? []
      : scenario === "all-read"
        ? SEED.map((n) => ({ ...n, read: true }))
        : SEED;
  const { notifications, unreadCount, markRead, markAllRead, dismiss, clear } =
    useDemoAdapter(seed, false);
  return (
    <div className="p-4">
      <div className="mx-auto max-w-sm rounded-lg border border-border bg-background">
        <NotificationList
          notifications={notifications}
          unreadCount={unreadCount}
          now={NOW}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          onDismiss={dismiss}
          onClear={clear}
        />
      </div>
    </div>
  );
};

const preview: SlicePreviewModule = { NotificationBell: Bell, NotificationList: List };
export default preview;
