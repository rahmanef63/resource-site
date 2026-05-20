import { defineFeature } from "@/lib/shared/features/defineFeature";

export const rbacRolesFeature = defineFeature({
  slug: "rbac-roles",
  title: "User Management",
  category: "auth",
  routes: [],
  nav: { label: "Users", group: "settings", icon: "Users", order: 3 },
});
