import { defineFeature } from "@/lib/shared/features/defineFeature";

export const settingsFeature = defineFeature({
  slug: "settings",
  title: "Settings — account + appearance shells",
  category: "ui",
  routes: [],
  nav: { label: "Settings", group: "settings", icon: "Settings", order: 90 },
});
