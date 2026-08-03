export {
  SettingsShell,
  type SettingsShellProps,
  type SettingsSectionId,
} from "./components/SettingsShell";
export { ProfileSection, type ProfileSectionProps } from "./components/sections/ProfileSection";
export {
  PreferencesSection,
  type PreferencesSectionProps,
} from "./components/sections/PreferencesSection";
export {
  NotificationsSection,
  type NotificationsSectionProps,
} from "./components/sections/NotificationsSection";
export { DangerZone, type DangerZoneProps } from "./components/sections/DangerZone";
export { useSettings, type UseSettingsResult } from "./hooks/useSettings";
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
} from "./lib/adapter";
export { settingsPageTools, type SettingsPageCtx } from "./lib/tools";
export {
  settingsSectionsToNav,
  SETTINGS_SECTIONS,
  type SettingsNavSection,
  type SettingsNavItem,
  type SettingsNavGroup,
  type SettingsNavIcon,
} from "./lib/nav";
