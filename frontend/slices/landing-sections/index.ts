/**
 * Shared landing-sections admin slice. Generic CRUD that any template
 * mounts by:
 *   1. Adding `landingSections: LandingSection[]` to State + LandingAction
 *   2. Folding `landingReducer` into the root reducer
 *   3. Wrapping StoreProvider with <LandingProvider value={adapter}/>
 *   4. Registering /admin/landing + /admin/landing/[id] routes that
 *      render <LandingView/> + <LandingEditorView id/>
 */
export { landingSectionsFeature } from "./config";
export { LandingProvider, useLandingStore, type LandingStore } from "./landing-context";
export { landingReducer } from "./reducer";
export { defaultLandingSections } from "./seed-factory";
export { LandingView } from "./views/LandingView";
export { LandingEditorView, blankSection } from "./views/LandingEditorView";
export { LANDING_FIELDS } from "./landing-fields";
export { LandingSectionShell } from "./components/LandingSectionShell";
export type { LandingSection, LandingSectionKind, LandingAction, LandingSlice } from "./types";
export { landingSectionsTools, type LandingToolsCtx } from "./lib/tools";

// Public section renderers (config-driven) + config helpers — lifted from the
// fleet `_shared/landing` system (2026-06-11). Consumers map each `kind` to a
// section and feed it `LandingSection.config` JSON; content stays dashboard-
// controlled (admin landing editor) without per-template renderer code.
// Soft peers: `_shared/motion` + `_shared/ui/section-head` (ship in every rr
// website template).
export * from "./sections";
export { parseConfigBadge, parseConfigField } from "./parse-config";
