import type { ComponentType } from "react";
import { User, SlidersHorizontal, Bell, TriangleAlert } from "lucide-react";

export type SettingsSectionId =
  | "profile"
  | "preferences"
  | "notifications"
  | "danger-zone";

export type SettingsNavIcon = ComponentType<{ className?: string }>;

export interface SettingsNavSection {
  id: SettingsSectionId;
  label: string;
  icon: SettingsNavIcon;
}

/** The fixed section catalog — also drives the built-in rail. */
export const SETTINGS_SECTIONS: readonly SettingsNavSection[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "danger-zone", label: "Danger zone", icon: TriangleAlert },
];

export interface SettingsNavItem {
  id: string;
  label: string;
  icon: SettingsNavIcon;
  onSelect: () => void;
  dock?: boolean;
  active?: boolean;
}

export interface SettingsNavGroup {
  id: string;
  label: string;
  items: SettingsNavItem[];
}

/**
 * Map the settings sections onto nav groups, shaped for the `dashboard-shell`
 * slice's `nav` prop (structural — no import between slices). Use it with
 * `<SettingsShell nav={false}>` so the sections drive the ONE app sidebar
 * instead of adding a second rail next to it.
 *
 * Settings has no group axis (unlike the admin console's 26 sections), so this
 * always returns exactly one group. `dockCount` sections (in catalog order) are
 * flagged for the mobile dock, and `activeId` marks the current one (button
 * items have no href to match on); omit it to leave `active` unset.
 */
export function settingsSectionsToNav(
  onSelect: (id: SettingsSectionId) => void,
  opts: {
    activeId?: SettingsSectionId;
    dockCount?: number;
    sections?: readonly SettingsNavSection[];
    groupLabel?: string;
  } = {},
): SettingsNavGroup[] {
  const {
    activeId,
    // 3, not 4: dashboard-shell appends a "Menu" button, and 5 labels in one
    // max-w-md dock row truncate hard at 360px.
    dockCount = 3,
    sections = SETTINGS_SECTIONS,
    groupLabel = "Settings",
  } = opts;

  const items: SettingsNavItem[] = sections.map((s, i) => ({
    id: s.id,
    label: s.label,
    icon: s.icon,
    onSelect: () => onSelect(s.id),
    dock: i < dockCount,
    active: activeId === undefined ? undefined : s.id === activeId,
  }));

  return [{ id: "settings", label: groupLabel, items }];
}
