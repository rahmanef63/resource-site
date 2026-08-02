import { defineFeature } from "@/lib/shared/features/defineFeature";

export const adminFeature = defineFeature({
  slug: "admin",
  title: "Admin — generic shell + composed console",
  category: "infra",
  routes: [],
  nav: { label: "Admin", group: "settings", icon: "Shield", order: 1 },
});
