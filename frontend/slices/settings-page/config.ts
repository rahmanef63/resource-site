import { defineFeature } from "@/lib/shared/features/defineFeature";

export const settingsPageFeature = defineFeature({
  slug: "settings-page",
  title: "Settings Page — adapter-driven shell",
  category: "ui",
  routes: [],
  nav: { label: "Settings", group: "settings", icon: "Settings", order: 90 },
});
