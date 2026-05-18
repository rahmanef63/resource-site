"use client";

import * as React from "react";
import { PricingSection, type PricingTier, type PricingFAQItem } from "@/features/pricing-page";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TIERS: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    period: "/mo",
    blurb: "For side projects + experiments.",
    bullets: ["1 project", "Community support", "1 GB storage", "Up to 1k requests/mo"],
    cta: { label: "Start free", href: "#" },
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/mo",
    blurb: "For growing teams shipping daily.",
    bullets: ["10 projects", "Priority email support", "100 GB storage", "1M requests/mo", "Custom domain"],
    cta: { label: "Start 14-day trial", href: "#" },
    featured: true,
    badge: "Most popular",
  },
  {
    id: "scale",
    name: "Scale",
    price: "$99",
    period: "/mo",
    blurb: "For revenue-bearing production.",
    bullets: ["Unlimited projects", "24/7 phone support", "1 TB storage", "Unmetered requests", "SSO + audit log"],
    cta: { label: "Talk to sales", href: "#" },
  },
];

const FAQ: PricingFAQItem[] = [
  { q: "Can I change tier later?", a: "Yes — upgrades take effect immediately, downgrades at the next renewal." },
  { q: "Do you offer annual discounts?", a: "Pro and Scale annual plans get two months free (16% off)." },
  { q: "What payment methods?", a: "All major cards via Stripe, plus invoiced ACH for Scale tier." },
];

const VARIANTS = ["ring", "scale", "tint"] as const;

export default function Page() {
  const [variant, setVariant] = React.useState<(typeof VARIANTS)[number]>("ring");
  return (
    <SlicePreviewLayout title="Pricing Page" kind="ui" maxWidth="none">
      <PreviewSection title="Live demo" hint={`featuredVariant="${variant}"`}>
        <div className="mb-4 inline-flex rounded-md border border-input p-0.5">
          {VARIANTS.map((v) => (
            <Button
              key={v}
              variant="ghost"
              type="button"
              onClick={() => setVariant(v)}
              className={cn(
                "h-auto rounded px-3 py-1 text-xs capitalize",
                variant === v ? "bg-accent font-medium" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v}
            </Button>
          ))}
        </div>

        <PricingSection
          eyebrow="Pricing"
          title="Simple, transparent pricing"
          subtitle="Start free, upgrade when you outgrow it. No hidden fees, cancel any time."
          tiers={TIERS}
          featuredVariant={variant}
          faq={FAQ}
          faqTitle="Common questions"
        />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
