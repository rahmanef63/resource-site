"use client";

import { PricingSection, type PricingTier } from "@/features/pricing-page";
import { useServices } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";

/**
 * Productized engagements rendered via the canonical pricing-page slice
 * (DRY+SSOT). Each Service maps 1:1 to a PricingTier — price label sits in
 * `price`, duration in `period`, blurb + bullets pass through. CTA routes
 * to /contact with the service id so the form can pre-fill.
 */
export function ServicesPage() {
  const services = useServices();
  const tiers: PricingTier[] = services.map((s) => ({
    id: s.id,
    name: s.name,
    price: s.priceLabel,
    period: s.duration,
    blurb: s.blurb,
    bullets: s.bullets,
    featured: s.featured,
    badge: s.featured ? "Most booked" : undefined,
    cta: { label: "Brief us", href: `${PUBLIC_BASE}/contact?service=${s.id}` },
  }));
  return (
    <PricingSection
      eyebrow="Services"
      title="Productized engagements"
      subtitle="Predictable scope, predictable price. Custom work also available — start with a brief."
      tiers={tiers}
      featuredVariant="ring"
    />
  );
}
