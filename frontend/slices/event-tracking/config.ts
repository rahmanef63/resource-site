import { defineFeature } from "@/lib/shared/features/defineFeature";

export const eventTrackingFeature = defineFeature({
  slug: "event-tracking",
  title: "Analytics",
  category: "data",
  routes: [],
  nav: { label: "Analytics", group: "settings", icon: "Activity", order: 2 },
});
