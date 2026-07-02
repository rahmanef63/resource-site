/**
 * rate-limit slice — Convex-backed per-key request counter.
 * Public surface: `RateLimitResult` type + stub `RateLimit` component
 * (backend-only; registry expects a component handle). The `consume`
 * mutation lives on the Convex side and consumers wrap it server-side.
 */

import * as React from "react"

export type RateLimitResult = {
  ok: boolean
  remaining: number
  resetAt: number
}

export function RateLimit() {
  return React.createElement(
    "div",
    { className: "p-8 text-sm text-muted-foreground" },
    "Rate Limit is a backend-only slice — no UI surface.",
  )
}
