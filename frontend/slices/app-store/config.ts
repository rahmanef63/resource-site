// Slice config (rr: frontend.configExport = "appStoreConfig").
export type AppStoreConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "os";
  /** localStorage keys for the app registry + disabled sets. */
  registryKey: string;
  disabledKey: string;
};

export const appStoreConfig: AppStoreConfig = {
  slug: "app-store",
  title: "App Store — install, create + toggle apps",
  category: "os",
  registryKey: "app-store:apps",
  disabledKey: "app-store:disabled",
};

export default appStoreConfig;
