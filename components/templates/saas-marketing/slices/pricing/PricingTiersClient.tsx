"use client";

import { PricingSection, type PricingTier } from "@/features/pricing-page";
import { usePricing } from "../../shared/store";

/**
 * Hybrid wrapper: server chrome (PricingPage) renders this client wrap which
 * reads live tiers via usePricing() and feeds the canonical PricingSection
 * slice (DRY+SSOT). Admin edits propagate via the createTemplateStore
 * BroadcastChannel.
 */
export function PricingTiersClient({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  const tiers = usePricing() as PricingTier[];
  return (
    <PricingSection
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      tiers={tiers}
      className="!p-0"
    />
  );
}
