import { defineFeature } from "@/lib/shared/features/defineFeature";

export const notificationsFeature = defineFeature({
  slug: "notifications",
  title: "Notifications",
  category: "ui",
  routes: [],
  nav: { label: "Notifications", group: "tools", icon: "Bell" },
});
