import { defineFeature } from "@/lib/shared/features/defineFeature";

export const ctaFeature = defineFeature({
  slug: "cta",
  title: "Call to Action",
  category: "ui",
  routes: [],
  nav: { label: "CTA", group: "ui", order: 80 },
});
