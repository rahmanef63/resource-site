import { defineFeature } from "@/frontend/shared/lib/features/defineFeature"

/**
 * rate-limit slice — Convex-backed per-key request counter.
 * Backend-only (no route, no UI surface). Replaces single-replica in-memory
 * Map so multi-replica Next deployments share buckets.
 * Lifted from rr `rate-limit@0.1.0` (2026-05-27).
 *
 * Use: `await ctx.runMutation(internal.features.rateLimit.mutations.consume, { key, limit, windowMs })`
 */
export default defineFeature({
  id: "rate-limit",
  name: "Rate Limit",
  description:
    "Convex-backed per-key request counter. Atomic check-and-increment; expired rows pruned by 5-min cron. Backend-only — no UI.",

  ui: {
    icon: "Timer",
    path: "/dashboard/rate-limit",
    component: "RateLimit",
    category: "administration",
    order: 999,
  },

  technical: {
    featureType: "optional",
    hasUI: false,
    hasConvex: true,
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

  tags: ["infra", "rate-limit", "convex", "backend", "throttle"],

  permissions: [],
})
