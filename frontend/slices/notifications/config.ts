import { defineFeature } from "@/lib/shared/features/defineFeature";

export const notificationsFeature = defineFeature({
  slug: "notifications",
  title: "Notifications — Per-page Notify Me",
  category: "ui",
  routes: [],
  nav: { label: "Notifications", group: "tools", icon: "Bell" },
});
