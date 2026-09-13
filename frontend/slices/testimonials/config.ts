type TestimonialsRegistryConfig = {
  slug: string;
  title: string;
  category: "content";
  routes: unknown[];
  nav: { label: string; group: "content"; order: number };
};

/** Framework-neutral registry metadata for the backend-only testimonials slice. */
export const testimonialsFeature = {
  slug: "testimonials",
  title: "Testimonials",
  category: "content",
  routes: [],
  nav: { label: "Testimonials", group: "content", order: 70 },
} satisfies TestimonialsRegistryConfig;
