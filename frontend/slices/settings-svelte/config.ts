export type SettingsSvelteFeature = {
  slug: "settings";
  title: string;
  category: "ui";
  variants: readonly ["account", "appearance"];
};

export const settingsSvelteFeature: SettingsSvelteFeature = {
  slug: "settings",
  title: "Settings — account + appearance shells",
  category: "ui",
  variants: ["account", "appearance"],
};
