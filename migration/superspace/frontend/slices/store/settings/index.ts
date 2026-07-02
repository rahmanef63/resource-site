/**
 * Store settings — minimal. Store is a composition host for the
 * workspace-store + menu (menus) tabs; child slices own their real
 * settings surfaces. This stub satisfies the mandatory settings folder.
 */

export const DEFAULT_STORE_SETTINGS = {
  defaultTab: "workspace" as const,
}

export type StoreSettingsSchema = typeof DEFAULT_STORE_SETTINGS

export function StoreSettings() {
  return null
}
