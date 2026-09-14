export type SettingsSectionId =
  | "profile"
  | "preferences"
  | "notifications"
  | "danger-zone";

export type SettingsSectionCore = {
  id: SettingsSectionId;
  label: string;
};

export const SETTINGS_SECTION_CORE: readonly SettingsSectionCore[] = [
  { id: "profile", label: "Profile" },
  { id: "preferences", label: "Preferences" },
  { id: "notifications", label: "Notifications" },
  { id: "danger-zone", label: "Danger zone" },
];

export type SettingsNavItemCore = {
  id: string;
  label: string;
  onSelect: () => void;
  dock?: boolean;
  active?: boolean;
};

export type SettingsNavGroupCore<TItem extends SettingsNavItemCore = SettingsNavItemCore> = {
  id: string;
  label: string;
  items: TItem[];
};

/** Framework-neutral structural navigation builder used by React and Svelte hosts. */
export function settingsSectionsToNavCore<TSection extends SettingsSectionCore>(
  sections: readonly TSection[],
  onSelect: (id: SettingsSectionId) => void,
  opts: {
    activeId?: SettingsSectionId;
    dockCount?: number;
    groupLabel?: string;
  } = {},
): SettingsNavGroupCore[] {
  const { activeId, dockCount = 3, groupLabel = "Settings" } = opts;
  return [
    {
      id: "settings",
      label: groupLabel,
      items: sections.map((section, index) => ({
        id: section.id,
        label: section.label,
        onSelect: () => onSelect(section.id),
        dock: index < dockCount,
        active: activeId === undefined ? undefined : section.id === activeId,
      })),
    },
  ];
}
