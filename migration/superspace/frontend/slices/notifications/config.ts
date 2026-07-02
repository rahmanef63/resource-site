import { defineFeature } from "@/frontend/shared/lib/features/defineFeature"

/**
 * Notifications slice — pure-client `NotifyMePopover` + `useSubscription` hook,
 * localStorage-backed per-page subscription state. Consumed by other slices
 * (Knowledge, Communications, future Pages) — no top-level route, no Convex.
 * Lifted from rr `notifications@0.1.0` (2026-05-27).
 */
export default defineFeature({
  id: "notifications",
  name: "Notifications",
  description:
    "Per-page Notify Me popover with localStorage-backed subscription state. UI primitive consumed by other slices — not a top-level route.",

  ui: {
    icon: "Bell",
    path: "/dashboard/notifications",
    component: "NotifyMePopover",
    category: "communication",
    order: 999,
  },

  technical: {
    featureType: "optional",
    hasUI: true,
    hasConvex: false,
    hasTests: true,
    version: "0.1.0",
  },

  status: {
    state: "stable",
    isReady: true,
  },

  bundles: {
    core: [],
    recommended: [],
    optional: ["custom"],
  },

  tags: ["notifications", "ui", "popover", "library"],

  permissions: [],
})
