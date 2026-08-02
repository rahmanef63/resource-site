import { defineFeature } from "@/lib/shared/features/defineFeature";

export const testimonialsFeature = defineFeature({
  slug: "testimonials",
  title: "Testimonials",
  category: "content",
  routes: [],
  nav: { label: "Testimonials", group: "content", order: 70 },
});
