"use client";

import {
  HeroBlock,
  CtaBand,
} from "@/components/templates/_shared";
import {
  FeatureGridSection,
  type FeatureItem as SliceFeatureItem,
} from "@/features/feature-grid";
import {
  PricingSection,
  type PricingTier as SliceTier,
} from "@/features/pricing-page";
import {
  BlogListSection,
  type BlogPost as SliceBlogPost,
} from "@/features/blog-section";
import { DEFAULT_SITE_CONFIG } from "../../shared/site-config";
import { useFeatures, usePricing, usePosts } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";

/**
 * Hybrid wrapper: 3 inline sections (features / pricing / recent posts)
 * delegated to canonical slices (DRY+SSOT). Admin CRUD propagates via
 * createTemplateStore BroadcastChannel. Hero + CtaBand kept as template
 * primitives (bespoke composition).
 */
export function HomePage() {
  const c = DEFAULT_SITE_CONFIG;
  const features = useFeatures();
  const pricing = usePricing();
  const posts = usePosts();

  const featureItems: SliceFeatureItem[] = features.slice(0, 3).map((f) => ({
    id: f.id,
    title: f.title,
    body: f.blurb,
    icon: f.icon,
  }));

  const tierItems: SliceTier[] = pricing as SliceTier[];

  const postItems: SliceBlogPost[] = posts.slice(0, 3).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    publishedAt: p.publishedAt,
    tags: p.tags,
  }));

  return (
    <>
      <HeroBlock
        badge="v1.7 — sequenced signing flows"
        title={c.tagline}
        subtitle={c.description}
        primaryCta={c.ctaPrimary}
        secondaryCta={{ label: "See features", href: `${PUBLIC_BASE}/features` }}
      />

      <FeatureGridSection
        eyebrow="What you get"
        title="Built for developers shipping fast"
        subtitle="A focused signing API. No bloat, no per-seat surprises."
        items={featureItems}
        columns={3}
        layout="cards"
        className="border-b border-border/60 !py-12 sm:!py-16"
      />

      <PricingSection
        eyebrow="Pricing"
        title="Simple, predictable, generous"
        subtitle="Free forever for prototypes. Paid plans scale with usage."
        tiers={tierItems}
        className="border-b border-border/60 bg-muted/30 !py-12 sm:!py-16"
      />

      <BlogListSection
        eyebrow="Latest writing"
        title="From the team"
        posts={postItems}
        hrefFor={(p) => `${PUBLIC_BASE}/blog/${p.slug}`}
        columns={3}
        layout="cards"
        limit={3}
        className="border-b border-border/60 !py-12 sm:!py-16"
      />

      <CtaBand
        title="Ship a signed PDF this afternoon."
        subtitle="Free tier, no card. Talk to a human anytime."
        cta={c.ctaPrimary}
        secondaryCta={{ label: "Talk to sales", href: `${PUBLIC_BASE}/contact` }}
      />
    </>
  );
}
