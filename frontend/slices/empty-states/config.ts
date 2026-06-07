import { defineFeature } from "@/lib/shared/features/defineFeature";

export const emptyStatesFeature = defineFeature({
  slug: "empty-states",
  title: "Empty States — 404/500/403 + zero-data",
  category: "ui",
  routes: [],
  nav: { label: "Empty States", group: "ui", order: 82 },
});
