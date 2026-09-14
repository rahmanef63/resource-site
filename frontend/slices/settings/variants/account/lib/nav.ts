import type { ComponentType } from "react";
import { Bell, SlidersHorizontal, TriangleAlert, User } from "lucide-react";
import {
  SETTINGS_SECTION_CORE,
  settingsSectionsToNavCore,
  type SettingsSectionId,
} from "./nav-core";

export type { SettingsSectionId } from "./nav-core";

export type SettingsNavIcon = ComponentType<{ className?: string }>;

export interface SettingsNavSection {
  id: SettingsSectionId;
  label: string;
  icon: SettingsNavIcon;
}

const ICONS: Record<SettingsSectionId, SettingsNavIcon> = {
  profile: User,
  preferences: SlidersHorizontal,
  notifications: Bell,
  "danger-zone": TriangleAlert,
};

/** React icon-enhanced catalog over the shared framework-neutral section order. */
export const SETTINGS_SECTIONS: readonly SettingsNavSection[] = SETTINGS_SECTION_CORE.map(
  (section) => ({ ...section, icon: ICONS[section.id] }),
);

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

export function settingsSectionsToNav(
  onSelect: (id: SettingsSectionId) => void,
  opts: {
    activeId?: SettingsSectionId;
    dockCount?: number;
    sections?: readonly SettingsNavSection[];
    groupLabel?: string;
  } = {},
): SettingsNavGroup[] {
  const sections = opts.sections ?? SETTINGS_SECTIONS;
  const groups = settingsSectionsToNavCore(sections, onSelect, opts);
  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      icon: sections.find((section) => section.id === item.id)?.icon ?? User,
    })),
  }));
}
