type ServicesRegistryConfig = {
  slug: string;
  title: string;
  category: "content";
  routes: unknown[];
  nav: { label: string; group: "content"; order: number };
};

/** Framework-neutral registry metadata for the backend-only services slice. */
export const servicesFeature = {
  slug: "services",
  title: "Services",
  category: "content",
  routes: [],
  nav: { label: "Services", group: "content", order: 71 },
} satisfies ServicesRegistryConfig;
