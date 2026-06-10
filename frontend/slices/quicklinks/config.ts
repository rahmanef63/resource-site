// Slice config (rr: frontend.configExport = "quicklinksConfig").
export type QuicklinksConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "os";
  /** localStorage key for the default (self-contained) store. */
  storageKey: string;
};

export const quicklinksConfig: QuicklinksConfig = {
  slug: "quicklinks",
  title: "Quicklinks — website shortcuts with favicons",
  category: "os",
  storageKey: "rr:quicklinks",
};

export default quicklinksConfig;
