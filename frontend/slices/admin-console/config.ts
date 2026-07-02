import { defineFeature } from "@/lib/shared/features/defineFeature"

/**
 * Admin Console — the composed admin panel surface.
 *
 * A single gated route that mounts the harvested section registry
 * (`ADMIN_CONSOLE_SECTIONS`). Sits at the bottom of the tools group.
 * Access is injected at the component layer, never resolved here.
 */
export const adminConsoleConfig = defineFeature({
  slug: "admin-console",
  title: "Admin Console — Composed Admin Panel",
  category: "infra",
  routes: [{ path: "/admin", view: () => import("./page") }],
  nav: { label: "Admin Console", group: "tools", order: 98 },
})
