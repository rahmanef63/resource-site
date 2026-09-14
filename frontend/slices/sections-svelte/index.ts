export { default as LandingProvider } from "./components/LandingProvider.svelte";
export { default as LandingView } from "./components/LandingView.svelte";
export { default as LandingEditorView } from "./components/LandingEditorView.svelte";
export { default as LandingSectionShell } from "./components/LandingSectionShell.svelte";
export { default as StatsSection } from "./sections/StatsSection.svelte";
export { default as TestimonialsSection } from "./sections/TestimonialsSection.svelte";
export { default as FaqSection } from "./sections/FaqSection.svelte";
export { default as PricingSection } from "./sections/PricingSection.svelte";
export { default as NewsletterSection } from "./sections/NewsletterSection.svelte";
export { default as CustomSection } from "./sections/CustomSection.svelte";
export { sectionsFeature } from "./config";
export type { SectionsConfig } from "./config";
export { provideLandingStore, useLandingStore, type LandingStoreGetter } from "./lib/context";
export { landingReducer } from "../sections/reducer";
export { defaultLandingSections } from "../sections/seed-factory";
export {
  blankSection,
  LANDING_KIND_LABEL,
  LANDING_KIND_OPTIONS,
  LANDING_RATIO_OPTIONS,
  moveLandingSection,
  sortedLandingSections,
  visibleLandingCount,
  type LandingStore,
} from "../sections/lib/core";
export { LANDING_FIELDS_CORE, type LandingFieldDef } from "../sections/lib/fields";
export type { LandingSection, LandingSectionKind, LandingAction, LandingSlice, AspectRatio } from "../sections/types";
export {
  parseConfigObject,
  parseConfigBadge,
  parseConfigField,
  cfgArray,
  cfgNumber,
  cfgString,
  isStatItem,
  isTestimonialItem,
  isFaqItem,
  isPricingTier,
  isString,
  type StatItem,
  type TestimonialItem,
  type FaqItem,
  type PricingTier,
} from "../sections/sections/config";
