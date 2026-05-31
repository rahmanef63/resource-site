import { defineFeature } from "@/lib/shared/features/defineFeature";

export const notionShellFeature = defineFeature({
  slug: "notion-shell",
  title: "Notion Shell — page + sidebar + block editor primitives (pure, no database)",
  category: "ui",
  routes: [],
  nav: { label: "Notion Shell", group: "tools", icon: "Layout" },
});
