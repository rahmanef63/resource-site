export { default as SettingsShell } from "./components/SettingsShell.svelte";
export { default as ProfileSection } from "./components/sections/ProfileSection.svelte";
export { default as PreferencesSection } from "./components/sections/PreferencesSection.svelte";
export { default as NotificationsSection } from "./components/sections/NotificationsSection.svelte";
export { default as DangerZone } from "./components/sections/DangerZone.svelte";
export {
  createMemoryAdapter,
  DEFAULT_SETTINGS,
  type SettingsAdapter,
  type SettingsValues,
  type SettingsProfile,
  type SettingsPreferences,
  type SettingsNotifications,
  type ThemePref,
  type DensityPref,
} from "@/features/settings/variants/account/lib/adapter";
export {
  mergeSettingsValues,
  settingsProfileInitials,
  SETTINGS_DENSITIES,
  SETTINGS_LANGUAGES,
  SETTINGS_THEMES,
} from "@/features/settings/variants/account/lib/core";
export {
  SETTINGS_SECTION_CORE,
  settingsSectionsToNavCore,
  type SettingsSectionId,
} from "@/features/settings/variants/account/lib/nav-core";
export { settingsPageTools, type SettingsPageCtx } from "@/features/settings/variants/account/lib/tools";
