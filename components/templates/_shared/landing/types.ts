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
  | "services"
  | "stats"
  | "newsletter"
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
  /** Optional foreground image (hero illustration, feature graphic, etc.).
   *  Threaded into the per-template renderer for the matching kind. */
  imageUrl?: string;
  /** Optional decorative background image (full-bleed band behind the
   *  section). Renderer composes with overlay/gradient. */
  bgImageUrl?: string;
  /** Custom Tailwind classes appended to the section wrapper. Use for
   *  one-off spacing / color / typography tweaks without touching code.
   *  Example: "py-24 bg-gradient-to-b from-background to-muted/40". */
  className?: string;
  /** Free-form JSON the renderer can interpret (kind-specific extras).
   *  Common keys: { badge: string } for hero badge override. */
  config?: string;
};

export type LandingAction =
  | { type: "LANDING_UPSERT"; payload: LandingSection }
  | { type: "LANDING_DELETE"; payload: { id: string } };

export interface LandingSlice {
  landingSections: LandingSection[];
}
