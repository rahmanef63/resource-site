export type Source = {
  id: string;
  name: string;
  description: string;
  url?: string;
  contributes: string[];
  badge?: string;
};

export const sources: Source[] = [
  {
    id: "kitab-core",
    name: "@kitab-core",
    description:
      "Internal vertical-slice multi-tenant SaaS scaffold (private). Source of slice templates, feature registry, three-column dashboard, sidebar primitives, validators, slice CLI. Components are vendored into this kitab — the scaffold itself is not public.",
    contributes: ["vertical-slice arch", "feature registry", "dashboard shell", "Convex auth"],
    badge: "core · private",
  },
  {
    id: "rahmanef-com",
    name: "@rahmanef.com",
    description:
      "Personal site / motion playground. Source of motion primitives (marquee, kinetic-heading, magnetic, cursor-spotlight, stat-counter, lightbox), OKLch theme presets, asymmetric masonry.",
    url: "https://rahmanef.com",
    contributes: ["motion primitives", "theme presets", "asymmetric grid"],
  },
  {
    id: "cescadesigns",
    name: "@cescadesigns",
    description:
      "Marketing site for an interior studio. Source of hero carousel, ContactForm + Resend email pipeline, image-grid pattern.",
    url: "https://cescadesigns.com",
    contributes: ["hero carousel", "Resend contact form", "image grid"],
  },
  {
    id: "notion-page-clone",
    name: "@notion-page-clone",
    description:
      "Notion clone. Source of block editor with slash menu, page-tree dnd sidebar, multi-block selection, 11 database views, command palette, threaded comments.",
    contributes: ["block editor", "page tree", "database views", "comments"],
    badge: "private",
  },
];
