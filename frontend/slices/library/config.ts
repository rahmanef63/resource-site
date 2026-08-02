// library slice config. Convex-backed; ships schema + queries +
// mutations in convex/features/library/.
export const libraryFeature = {
  slug: "library",
  label: "Library",
  route: "/library",
  nav: { order: 5, section: "content" as const },
  backend: {
    enabled: true,
    tables: ["libraryItems", "libraryCollections"] as const,
    queries: [
      "listAll",
      "listPublic",
      "listByCollection",
      "getBySlug",
      "listFeatured",
      "listCollections",
      "getCollectionBySlug",
    ] as const,
    mutations: [
      "create",
      "update",
      "remove",
      "createCollection",
      "updateCollection",
      "removeCollection",
      "seed",
    ] as const,
    actions: [] as const,
  },
} as const;
