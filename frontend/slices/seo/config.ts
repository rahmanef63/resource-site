import { defineFeature } from "@/lib/shared/features/defineFeature"

// SEO is a service slice — no public route, no nav surface.
// Backend exposes AI generator action + cost-guard log (see convex/features/seo/).
export const seoConfig = defineFeature({
  slug: "seo",
  title: "SEO",
  category: "content",
  routes: [],
  nav: { label: "SEO", group: "tools", order: 99 },
})
