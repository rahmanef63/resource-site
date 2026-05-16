import { defineFeature } from "@/lib/shared/features/defineFeature";

export const heroFeature = defineFeature({
  slug: "hero",
  title: "Hero",
  category: "ui",
  routes: [],
  nav: { label: "Hero", group: "ui", order: 1 },
});
