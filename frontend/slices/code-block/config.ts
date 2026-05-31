import { defineFeature } from "@/lib/shared/features/defineFeature";

export const codeBlockFeature = defineFeature({
  slug: "code-block",
  title: "Code Block — Notion-style syntax-highlighted code primitive",
  category: "ui",
  routes: [],
  nav: { label: "Code Block", group: "tools", icon: "Code" },
});
