// Slice config — picked up by the registry generators (Phase 1).
//
// Phase 0 ships this as a typed object with the `defineFeature` shape, but
// the actual `defineFeature` runtime lands in Phase 1 (`lib/shared/features/
// defineFeature.ts`). For now we export a plain object that conforms to the
// expected shape; once the runtime lands, swap the import + call.

export const exampleFeatureConfig = {
  slug: "example-feature",
  title: "Example Feature",
  category: "data" as const,
  routes: [
    { path: "/example", view: () => import("./page") },
  ],
  registry: {
    nav: { label: "Example", group: "data" },
  },
} satisfies {
  slug: string;
  title: string;
  category: string;
  routes: Array<{ path: string; view: () => Promise<unknown> }>;
  registry: { nav: { label: string; group: string } };
};
