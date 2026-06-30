// Slice config (rr: frontend.configExport = "resourcesLauncherAdminConfig").
export type ResourcesLauncherAdminConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "os";
};

export const resourcesLauncherAdminConfig: ResourcesLauncherAdminConfig = {
  slug: "resources-launcher-admin",
  title: "Resources Admin — curated icon-launcher CRUD",
  category: "os",
};

export default resourcesLauncherAdminConfig;
