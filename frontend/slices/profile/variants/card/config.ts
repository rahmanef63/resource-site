// Slice config (rr: frontend.configExport = "aboutProfileConfig").
export type AboutProfileConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "os";
};

export const aboutProfileConfig: AboutProfileConfig = {
  slug: "about-profile",
  title: "About — identity / profile card",
  category: "os",
};

export default aboutProfileConfig;
