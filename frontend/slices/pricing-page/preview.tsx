"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */
import type { SlicePreviewModule } from "@/shared/preview/types";
import { PricingSection, type PricingTier } from "./views/PricingSection";

const TIERS: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    period: "/mo",
    blurb: "For solo builders.",
    bullets: ["1 project", "Community support", "Core slices"],
    cta: { label: "Get started", href: "#" },
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "/mo",
    blurb: "For growing teams.",
    bullets: ["Unlimited projects", "Priority support", "All slices", "AI builder"],
    cta: { label: "Go Pro", href: "#" },
    featured: true,
    badge: "Popular",
  },
  {
    id: "team",
    name: "Team",
    price: "$49",
    period: "/mo",
    blurb: "For agencies.",
    bullets: ["Seats included", "SSO", "Audit gates"],
    cta: { label: "Contact us", href: "#" },
  },
];

const preview: SlicePreviewModule = {
  PricingSection: ({ variant }) => (
    <div className="p-4">
      <PricingSection
        title="Simple pricing"
        tiers={TIERS}
        columns={(Number(variant.columns) as 2 | 3 | 4) || 3}
        featuredVariant={(variant.featuredVariant as "ring" | "scale" | "tint") ?? "ring"}
        className="px-0 py-0"
      />
    </div>
  ),
};
export default preview;
