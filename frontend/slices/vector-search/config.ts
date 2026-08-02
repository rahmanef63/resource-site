import { defineFeature } from "@/lib/shared/features/defineFeature";

export const vectorSearchConfig = defineFeature({
  slug: "vector-search",
  title: "Convex Vector Search",
  category: "data",
  routes: [{ path: "/search", view: () => import("./components/search-page") }],
  nav: { label: "Search", group: "data", order: 0 },
});
