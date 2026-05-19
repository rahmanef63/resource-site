/**
 * notifications slice contract.
 *
 * Per-page subscription state (localStorage-backed) + `NotifyMePopover` UI.
 * Pure-UI primitive — no convex tables. Lifted from notion-page-clone (Nosion).
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "notifications",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: ["NotifyMePopover"],
    utils: ["SUBSCRIPTION_SCOPE_LABELS"],
    hooks: ["useSubscription"],
    types: ["PageSubscription", "SubscriptionScope"],
  },
  requires: {
    npm: [],
    shadcn: ["button", "popover"],
    env: [],
    peers: [],
    routes: [],
    tables: [],
  },
});
