/**
 * Rate-limit settings — minimal. Backend-only infra slice with no persisted
 * server settings; exposes defaults for Settings UI parity.
 */

export const DEFAULT_RATE_LIMIT_SETTINGS = {
  defaultLimit: 60,
  defaultWindowMs: 60_000,
} as const

export type RateLimitSettingsSchema = typeof DEFAULT_RATE_LIMIT_SETTINGS

export function RateLimitSettings() {
  return null
}
