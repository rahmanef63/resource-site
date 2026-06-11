/**
 * landing-sections slice contract.
 *
 * Landing-page composition for rr website templates: admin CRUD over the
 * section list PLUS a config-driven public section renderer library
 * (v0.4.0, lifted from the _templates fleet `_shared/landing`).
 *
 * Ships:
 *  - admin: LandingView + LandingEditorView (CRUD list/form) + LandingSectionShell
 *  - store: landingReducer (order auto-shift) + LandingProvider/useLandingStore
 *  - public renderers: StatsSection, TestimonialsSection, FaqSection,
 *    PricingSection, NewsletterSection, CustomSection — each reads
 *    `LandingSection.config` JSON over template defaults (dashboard-controlled).
 *  - helpers: parseConfigBadge/parseConfigField + sections/config guards.
 *
 * Soft template-base peers (ship in every rr website template — NOT rr
 * slices, so not in `requires.peers`):
 *  - `@/components/templates/_shared/motion` — Reveal/Stagger/CountUp/
 *    Marquee/useInView (the motion-kit primitives, present in the base).
 *  - `@/components/templates/_shared/ui/section-head` — section heading block.
 *  - `@/components/templates/_shared/crud/*` — CRUD list/form primitives
 *    consumed by LandingView + LandingEditorView.
 * Sections also use shadcn accordion/card/carousel + embla-carousel-autoplay.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "landing-sections",
  version: "0.4.0",
  category: "content",
  kind: "ui",
  provides: {
    tools: [
      "landing-sections.list", "landing-sections.add",
      "landing-sections.update", "landing-sections.remove",
    ],
    components: [
      "LandingView", "LandingEditorView", "LandingSectionShell",
      "StatsSection", "TestimonialsSection", "FaqSection",
      "PricingSection", "NewsletterSection", "CustomSection",
    ],
    utils: [
      "blankSection", "defaultLandingSections", "landingReducer",
      "parseConfigBadge", "parseConfigField", "parseConfigObject",
    ],
    hooks: ["useLandingStore"],
    convex: { tables: [], rbac: [] },
  },
  requires: {
    deps: [
      { npm: "lucide-react", range: "^0.400.0" },
      { npm: "embla-carousel-autoplay", range: "^8.6.0" },
      { npm: "next", range: "^15" },
    ],
    shadcn: ["accordion", "badge", "button", "card", "carousel", "dialog", "input", "label", "select", "switch", "table", "textarea"],
    env: [],
    peers: [],
  },
  conflicts: [],
});
