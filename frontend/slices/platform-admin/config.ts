import { defineFeature } from "@/lib/shared/features/defineFeature";

/**
 * Contract-only scaffold. Implementation lands when superspace promotes
 * the structural patterns (top bar + drawer + RBAC matrix + KPI widget grid)
 * into a portable subset via /rr-send platform-admin.
 *
 * See docs/contract-negotiations-2026-05-15.md §4.
 */
export const platformAdminConfig = defineFeature({
  slug: "platform-admin",
  title: "Platform Admin — Multi-Tenant Control Plane",
  category: "infra",
  routes: [],
  nav: { label: "Platform Admin", group: "tools", order: 100 },
  peers: [
    { slug: "convex-auth", range: "^0.1" },
    { slug: "audit-log", range: "^0.2" },
  ],
});
