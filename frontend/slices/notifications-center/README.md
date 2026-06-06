# notifications-center

Standalone notification inbox — a `Bell` trigger with an unread badge that
opens a panel (popover on desktop, sheet on mobile) listing notifications.
Adapter-driven: **the host supplies the feed.** Pure UI, no backend coupling.

## Surface

| Component | Props | Notes |
|---|---|---|
| `NotificationBell` | `notifications, unreadCount?, now?, surface?, on*` | Ghost icon button + unread badge; opens `NotificationList` in a popover (`surface="popover"`, default) or sheet (`surface="sheet"`). |
| `NotificationList` | `notifications, unreadCount?, now?, maxHeight?, on*` | Header (Mark all read / Clear) + All/Unread tabs + scrollable list. Embeddable standalone (settings page, drawer). |
| `NotificationItem` | `notification, now?, onMarkRead?, onDismiss?` | One row: kind icon (or actor avatar), title/body, relative time, unread dot, hover row actions. |

`useNotifications(adapter)` binds an adapter to React and returns
`{ notifications, unreadCount, markRead, markAllRead, dismiss, clear }`.

## `Notification` shape

```ts
type Notification = {
  id: string;
  title: string;
  body?: string;
  kind: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;            // ISO-8601
  href?: string;
  actor?: { name: string; avatarUrl?: string };
};
```

## Adapter contract

The host implements `NotificationsAdapter` — the slice never invents data:

```ts
type NotificationsAdapter = {
  list(): Notification[];
  markRead(id: string): void;
  markAllRead(): void;
  dismiss(id: string): void;
  clear(): void;
  subscribe(listener: () => void): () => void; // useSyncExternalStore
  getSnapshot(): Notification[];
};
```

Bundled reference store (demos, offline drafts):

```ts
import { createMemoryNotificationsAdapter, useNotifications, NotificationBell } from "@/features/notifications-center";

const adapter = createMemoryNotificationsAdapter(seed);
function Topbar() {
  const n = useNotifications(adapter);
  return <NotificationBell {...n} surface="popover" />;
}
```

## Convex wiring sketch

```ts
// convex/notifications.ts
export const list = query({
  args: { userId: v.id("users") },
  handler: (ctx, { userId }) =>
    ctx.db.query("notifications")
      .withIndex("by_user", q => q.eq("userId", userId))
      .order("desc").take(50),
});
export const markRead   = mutation({ args: { id: v.id("notifications") }, handler: /* authz + patch read:true */ });
export const markAllRead = mutation({ /* authz + patch unread rows */ });
export const dismiss    = mutation({ args: { id: v.id("notifications") }, handler: /* authz + delete */ });
```

```ts
// adapter bound to a live Convex query
function useConvexNotificationsAdapter(): NotificationsAdapter {
  const rows = useQuery(api.notifications.list, { userId }) ?? [];
  // map Convex docs → Notification (createdAt = new Date(_creationTime).toISOString())
  // subscribe/getSnapshot can wrap a ref kept in sync with `rows`,
  // or use createMemoryNotificationsAdapter as a local mirror and reconcile.
  ...
}
```

Convex `_creationTime` is epoch-ms — convert to ISO for `createdAt`. Use a
`by_user` index and `.take(N)`; never bare `.collect()`.

## Dependencies

- npm: `lucide-react`
- shadcn: `avatar`, `badge`, `button`, `popover`, `scroll-area`, `separator`, `sheet`, `tabs`
- env: none · Convex tables: none (host-owned)

## Notes

- Relative time renders via `relativeTime(iso, now?)` — pure + deterministic;
  pass a fixed `now` for stable SSR/snapshot output. The seam exists so the
  preview seeds stay static (no `Date.now()` in module scope).
- Styling uses neutral shadcn tokens with subtle per-kind tinting — works with
  any theme preset.
