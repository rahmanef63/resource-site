// i18n-translate slice config. Pure UI widget — no Convex backend,
// no admin route, no permissions. Hidden from default nav.
export const i18nTranslateFeature = {
  slug: "i18n-translate",
  label: "i18n / Translate",
  nav: { order: 99, section: "utility" as const, hidden: true },
  backend: {
    enabled: false,
    tables: [] as const,
    queries: [] as const,
    mutations: [] as const,
    actions: [] as const,
  },
} as const;
