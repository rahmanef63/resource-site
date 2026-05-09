// Slice config — picked up by the registry generators.

import { defineFeature } from "@/lib/shared/features/defineFeature";

export const exampleFeatureConfig = defineFeature({
  slug: "example-feature",
  title: "Example Feature",
  category: "data",
  routes: [
    { path: "/example", view: () => import("./page") },
  ],
  nav: { label: "Example", group: "data", order: 100 },
});
