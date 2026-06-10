// Slice config (rr: frontend.configExport = "shellSettingsConfig").
export type ShellSettingsConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "ui";
};

export const shellSettingsConfig: ShellSettingsConfig = {
  slug: "shell-settings",
  title: "Shell Settings — settings-app UI primitives",
  category: "ui",
};

export default shellSettingsConfig;
