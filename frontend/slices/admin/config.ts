import { defineFeature } from "@/lib/shared/features/defineFeature"

export const adminConfig = defineFeature({
  slug: "admin",
  title: "Admin",
  category: "infra",
  routes: [{ path: "/admin", view: () => import("./page") }],
  nav: { label: "Admin", group: "tools", order: 99 },
})
