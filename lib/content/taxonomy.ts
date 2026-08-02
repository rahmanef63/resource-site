/** Catalog taxonomy — SSOT (UX wave U2, 2026-06-06).
 *
 *  Single source for category order + labels across the site sidebar, the
 *  docs-catalog sidebar, /slices page and the /build picker. Before this
 *  file the same arrays were duplicated in four components and drifted
 *  ("Ai"/"Ui" from naive capitalize, missing "os" in the build picker,
 *  empty "storage" group in the sidebar).
 *
 *  2026-06-06 merge (12 → 8): payment+email → integrations,
 *  search+realtime → data, storage dropped (was empty).
 */

export const SLICE_CATEGORY_ORDER = [
  "auth",
  "integrations",
  "ai",
  "data",
  "content",
  "ui",
  "os",
  "infra",
] as const;

export const SLICE_CATEGORY_LABEL: Record<string, string> = {
  auth: "Auth",
  integrations: "Integrations",
  ai: "AI",
  data: "Data",
  content: "Content",
  ui: "UI",
  os: "OS Apps",
  infra: "Infra",
};

export const LAYOUT_CATEGORY_ORDER = ["marketing", "dashboard", "cms"] as const;

export const LAYOUT_CATEGORY_LABEL: Record<string, string> = {
  marketing: "Marketing",
  dashboard: "Dashboard",
  cms: "CMS",
};
