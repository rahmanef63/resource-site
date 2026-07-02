import { defineFeature } from "@/frontend/shared/lib/features/defineFeature"

/**
 * i18n-translate slice — Google Translate widget drop-in.
 * Pure UI library (no route, no Convex). Consumed by landing/dashboard layouts
 * via `<GoogleTranslate />`. Lifted from rr `i18n-translate@0.1.0` (2026-05-27).
 *
 * CSP: consumer must allow `translate.google.com`, `translate.googleapis.com`,
 * and `*.gstatic.com` in script-src + connect-src + img-src.
 */
export default defineFeature({
  id: "i18n-translate",
  name: "i18n Translate",
  description:
    "Google Translate widget — drop-in language switcher. No API key, no Google Cloud billing. Auto-detect browser language, persist via localStorage + cookie.",

  ui: {
    icon: "Languages",
    path: "/dashboard/i18n-translate",
    component: "GoogleTranslate",
    category: "productivity",
    order: 999,
  },

  technical: {
    featureType: "optional",
    hasUI: true,
    hasConvex: false,
    hasTests: true,
    version: "0.1.0",
  },

  status: {
    state: "stable",
    isReady: true,
  },

  bundles: {
    core: [],
    recommended: [],
    optional: ["custom"],
  },

  tags: ["i18n", "translate", "google-translate", "ui", "library"],

  permissions: [],
})
