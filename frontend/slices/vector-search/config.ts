import { defineFeature } from "@/lib/shared/features/defineFeature";

export const vectorSearchConfig = defineFeature({
  slug: "vector-search",
  title: "Convex Vector Search",
  category: "search",
  routes: [{ path: "/search", view: () => import("./components/search-page") }],
  nav: { label: "Search", group: "search", order: 0 },
});
