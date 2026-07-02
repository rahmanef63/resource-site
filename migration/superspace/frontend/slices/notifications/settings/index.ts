/**
 * Notifications settings — minimal. Pure-client library slice with no
 * persisted server settings; exposes defaults for the Settings UI parity.
 */

export const DEFAULT_NOTIFICATIONS_SETTINGS = {
  defaultScopes: ["page"] as const,
}

export type NotificationsSettingsSchema = typeof DEFAULT_NOTIFICATIONS_SETTINGS

export function NotificationsSettings() {
  return null
}
