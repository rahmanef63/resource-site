import { defineFeature } from "@/lib/shared/features/defineFeature"

export const auditLogConfig = defineFeature({
  slug: "audit-log",
  title: "Audit Log — Workspace Events",
  category: "infra",
  routes: [],
  nav: { label: "Audit Log", group: "tools", order: 80 },
})
