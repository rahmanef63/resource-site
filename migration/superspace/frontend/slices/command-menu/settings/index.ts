/**
 * command-menu settings — minimal. Library slice; MRU history persisted
 * in localStorage by the slice itself.
 */

export const DEFAULT_COMMAND_MENU_SETTINGS = {
  hotkeyEnabled: true,
}

export type CommandMenuSettingsSchema = typeof DEFAULT_COMMAND_MENU_SETTINGS

export function CommandMenuSettings() {
  return null
}
