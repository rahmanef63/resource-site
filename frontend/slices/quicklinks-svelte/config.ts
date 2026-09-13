export type QuicklinksConfig = {
  slug: string;
  title: string;
  category: "os";
  storageKey: string;
};

export const quicklinksConfig: QuicklinksConfig = {
  slug: "quicklinks",
  title: "Quicklinks — website shortcuts with favicons",
  category: "os",
  storageKey: "rr:quicklinks",
};

export default quicklinksConfig;
