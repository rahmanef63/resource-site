/**
 * AI feature compatibility barrel.
 *
 * Canonical runtime imports should use `@/frontend/shared/ai`.
 */

export * from "@/frontend/shared/ai"
export { AIView } from "./AIView"
export { AIListView } from "./AIListView"
export { AIDetailView } from "./AIDetailView"
export { default as AIFeaturePreview } from "./features-preview"
