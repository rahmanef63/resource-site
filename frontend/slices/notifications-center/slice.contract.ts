/**
 * notifications-center slice contract.
 *
 * Adapter-driven notification inbox (bell + panel). Pure UI — the host
 * supplies the feed via a NotificationsAdapter. No Convex tables, no env,
 * no peers; the bundled in-memory adapter covers demos + offline drafts.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "notifications-center",
  version: "0.2.0",
  category: "ui",
  kind: "ui",
  provides: {
    tools: ["notifications-center.list", "notifications-center.mark_read", "notifications-center.mark_all_read", "notifications-center.dismiss", "notifications-center.clear"],
    components: ["NotificationBell", "NotificationList", "NotificationItem"],
    utils: ["createMemoryNotificationsAdapter", "relativeTime"],
    hooks: ["useNotifications"],
    convex: { tables: [], rbac: [] },
  },
  requires: {
    deps: [{ npm: "lucide-react", range: "^0.400.0" }],
    shadcn: [
      "avatar",
      "badge",
      "button",
      "popover",
      "scroll-area",
      "separator",
      "sheet",
      "tabs",
    ],
    env: [],
    peers: [],
  },
  conflicts: [],
});
