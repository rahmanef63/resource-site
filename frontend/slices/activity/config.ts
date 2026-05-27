// activity slice config. Convex-backed; ships schema + queries +
// mutations in convex/features/activity/.
export const activityFeature = {
  slug: "activity",
  label: "Activity",
  route: "/activity",
  nav: { order: 5, section: "marketing" as const },
  backend: {
    enabled: true,
    tables: ["activities"] as const,
    queries: ["listAll", "listPublic", "get", "statsThisWeek"] as const,
    mutations: ["create", "update", "remove", "seed"] as const,
    actions: [] as const,
  },
} as const;
