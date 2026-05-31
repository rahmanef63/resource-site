import { defineFeature } from "@/lib/shared/features/defineFeature";

export const equationFeature = defineFeature({
  slug: "equation",
  title: "Equation — Notion-style KaTeX block primitive",
  category: "ui",
  routes: [],
  nav: { label: "Equation", group: "tools", icon: "Sigma" },
});
