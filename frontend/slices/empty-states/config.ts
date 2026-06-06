import { defineFeature } from "@/lib/shared/features/defineFeature";

export const emptyStatesFeature = defineFeature({
  slug: "empty-states",
  title: "Empty States",
  category: "ui",
  routes: [],
  nav: { label: "Empty States", group: "ui", order: 82 },
});
