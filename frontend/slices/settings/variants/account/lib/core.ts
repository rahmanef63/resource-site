import type {
  SettingsPreferences,
  SettingsProfile,
  SettingsValues,
} from "./adapter";

export const SETTINGS_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "id", label: "Bahasa Indonesia" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "ja", label: "日本語" },
] as const;

export const SETTINGS_DENSITIES: readonly SettingsPreferences["density"][] = [
  "comfortable",
  "compact",
];

export const SETTINGS_THEMES: readonly SettingsPreferences["theme"][] = [
  "light",
  "dark",
  "system",
];

/** Merge one partial SettingsValues patch without clobbering sibling sections. */
export function mergeSettingsValues(
  current: SettingsValues,
  patch: Partial<SettingsValues>,
): SettingsValues {
  return {
    profile: { ...current.profile, ...patch.profile },
    preferences: { ...current.preferences, ...patch.preferences },
    notifications: { ...current.notifications, ...patch.notifications },
  };
}

export function settingsProfileInitials(profile: Pick<SettingsProfile, "name">): string {
  return (
    profile.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}
