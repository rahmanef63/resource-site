import { defineFeature } from "@/lib/shared/features/defineFeature";

export const userManagementFeature = defineFeature({
  slug: "user-management",
  title: "User Management",
  category: "auth",
  routes: [],
  nav: { label: "Users", group: "settings", icon: "Users", order: 4 },
});
