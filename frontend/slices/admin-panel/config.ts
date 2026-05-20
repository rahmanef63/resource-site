import { defineFeature } from "@/lib/shared/features/defineFeature";

export const adminPanelFeature = defineFeature({
  slug: "admin-panel",
  title: "Admin Panel",
  category: "ui",
  routes: [],
  nav: { label: "Admin Panel", group: "settings", icon: "Settings2", order: 0 },
  peers: [{ slug: "admin", range: "^1.0" }],
});
