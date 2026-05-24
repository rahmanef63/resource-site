import type { LandingSection } from "@/components/templates/_shared/landing/types";

export const SEED_LANDING_SECTIONS: LandingSection[] = [
  {
    id: "ls-hero",
    order: 10,
    kind: "hero",
    title: "Brand, design system, and product partner for ambitious teams.",
    subtitle: "Two-week sprints, multi-month builds, and embedded retainers — pick what fits.",
    enabled: true,
  },
  {
    id: "ls-portfolio",
    order: 20,
    kind: "portfolio",
    title: "Recent client engagements",
    subtitle: "A peek at what we've shipped lately.",
    enabled: true,
  },
  {
    id: "ls-services",
    order: 30,
    kind: "services",
    title: "Productized + retainer engagements",
    subtitle: "Pick a sprint, a system build, or an embedded retainer.",
    enabled: true,
  },
  {
    id: "ls-stats",
    order: 40,
    kind: "stats",
    title: "By the numbers",
    subtitle: "A few quick signals from recent quarters.",
    enabled: true,
  },
  {
    id: "ls-cta",
    order: 50,
    kind: "cta",
    title: "Brief us — get a proposal in 5 days.",
    subtitle: "No commitment. We respond within 24h.",
    enabled: true,
  },
];
