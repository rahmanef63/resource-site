/**
 * Shared `landingSections` slice — admin-editable composition of the
 * public landing page. Mount into a template by:
 *
 *   • importing `LandingSection` into State + reducer (state.landingSections)
 *   • dispatching LANDING_UPSERT / LANDING_DELETE actions
 *   • wrapping StoreProvider with LandingProvider (landing-context.tsx)
 *   • registering /admin/landing routes that render <LandingView/> + <LandingEditorView id/>
 *
 * Per-template public renderers map `kind` → canonical slice components.
 * See saas-marketing/slices/home/LandingRenderer.tsx for the reference impl.
 */

export type LandingSectionKind =
  | "hero"
  | "features"
  | "testimonials"
  | "pricing"
  | "blog"
  | "changelog"
  | "faq"
  | "portfolio"
  | "cta"
  | "custom";

export type LandingSection = {
  id: string;
  /** Render order on the home page. Lower numbers render first. */
  order: number;
  /** Section type — picks which canonical slice renders. */
  kind: LandingSectionKind;
  /** Section heading (also used as admin label). */
  title: string;
  /** Optional subtitle / lead paragraph. */
  subtitle?: string;
  /** Toggle to hide on / without deleting. */
  enabled: boolean;
  /** Free-form JSON the renderer can interpret (slice-specific). */
  config?: string;
};

export type LandingAction =
  | { type: "LANDING_UPSERT"; payload: LandingSection }
  | { type: "LANDING_DELETE"; payload: { id: string } };

export interface LandingSlice {
  landingSections: LandingSection[];
}
