import { defineFeature } from "@/lib/shared/features/defineFeature";

export const pagesFeature = defineFeature({
  slug: "pages",
  title: "Pages CRUD",
  category: "content",
  routes: [],
  nav: { label: "Pages", group: "content", icon: "Newspaper", order: 0 },
  peers: [{ slug: "landing-sections", range: "^1.0" }],
});
