import { defineFeature } from "@/lib/shared/features/defineFeature";

export const notionBlocksFeature = defineFeature({
  slug: "notion-blocks",
  title: "Notion Blocks",
  category: "ui",
  routes: [],
  nav: { label: "Notion Blocks", group: "tools", icon: "LayoutGrid" },
});
