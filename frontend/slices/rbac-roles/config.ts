import { defineFeature } from "@/lib/shared/features/defineFeature";

export const rbacRolesFeature = defineFeature({
  slug: "rbac-roles",
  title: "RBAC — Roles & Permissions",
  category: "auth",
  routes: [],
  nav: { label: "Roles", group: "settings", icon: "ShieldCheck", order: 3 },
});
