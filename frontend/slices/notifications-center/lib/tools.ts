// Agentic tool collection. Ctx = the live useNotifications() result — the
// agent acts through the exact adapter-backed API the bell/list UI uses.

import { defineToolCollection, noArgs, obj, str } from "@/shared/agentic";
import type { UseNotifications } from "../hooks/useNotifications";

export type NotificationsCenterCtx = UseNotifications;

export const notificationsCenterTools = defineToolCollection<NotificationsCenterCtx>({
  namespace: "notifications-center",
  instructions: "Notification inbox. list before acting; mark_read/dismiss are per-item; mark_all_read and clear are bulk, and clear is irreversible.",
  describe: (ctx) => `${ctx.notifications.length} notification(s), ${ctx.unreadCount} unread`,
  tools: [
    {
      name: "list",
      description: "List notifications (id, kind, message, read state).",
      parameters: noArgs,
      run: (ctx) =>
        ctx.notifications.map((n) => `${n.id} [${n.kind}]${n.read ? "" : " •unread"} ${n.title}${n.body ? ` — ${n.body}` : ""}`).join("\n") || "no notifications",
    },
    {
      name: "mark_read",
      description: "Mark one notification read.",
      parameters: obj({ "id!": str("notification id") }),
      run: (ctx, a) => {
        ctx.markRead(a.id as string);
        return `read: ${a.id}`;
      },
    },
    {
      name: "mark_all_read",
      description: "Mark every notification read.",
      parameters: noArgs,
      run: (ctx) => {
        ctx.markAllRead();
        return "all read";
      },
    },
    {
      name: "dismiss",
      description: "Dismiss one notification.",
      parameters: obj({ "id!": str("notification id") }),
      run: (ctx, a) => {
        ctx.dismiss(a.id as string);
        return `dismissed: ${a.id}`;
      },
    },
    {
      name: "clear",
      description: "Clear all notifications.",
      parameters: noArgs,
      run: (ctx) => {
        ctx.clear();
        return "cleared";
      },
    },
  ],
});
