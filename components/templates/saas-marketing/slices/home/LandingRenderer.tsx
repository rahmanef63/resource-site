"use client";

import {
  HeroBlock,
  CtaBand,
} from "@/components/templates/_shared";
import { LandingSectionShell } from "@/components/templates/_shared/landing/LandingSectionShell";
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
import {
  ChangelogFeedSection,
  type ChangelogEntry as SliceChangelogEntry,
} from "@/features/changelog-feed";
import { DEFAULT_SITE_CONFIG } from "../../shared/site-config";
import { PUBLIC_BASE } from "../../shared/nav-config";
import type {
  FeatureItem,
  PricingTier,
  BlogPost,
  ChangelogEntry,
  LandingSection,
} from "../../shared/types";

interface Deps {
  features: FeatureItem[];
  pricing: PricingTier[];
  posts: BlogPost[];
  changelog: ChangelogEntry[];
}

const SHARED_CLS = "border-b border-border/60 !py-12 sm:!py-16";

/**
 * Maps a `LandingSection` to its canonical-slice renderer. Returns null
 * for kinds we don't have data for (admin shows them but the public page
 * skips them — silent fallback rather than crash).
 */
export function renderLanding(section: LandingSection, deps: Deps) {
  switch (section.kind) {
    case "hero":
      return (
        <LandingSectionShell section={section}>
          <HeroBlock
            badge={DEFAULT_SITE_CONFIG.tagline}
            title={section.title}
            subtitle={section.subtitle ?? DEFAULT_SITE_CONFIG.description}
            primaryCta={DEFAULT_SITE_CONFIG.ctaPrimary}
            secondaryCta={{ label: "See features", href: `${PUBLIC_BASE}/features` }}
          />
          {section.imageUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={section.imageUrl}
              alt=""
              className="mx-auto mt-8 max-h-[420px] w-full max-w-4xl rounded-2xl border border-border/60 object-cover shadow-lg"
            />
          )}
        </LandingSectionShell>
      );

    case "features": {
      const items: SliceFeatureItem[] = deps.features.slice(0, 6).map((f) => ({
        id: f.id,
        title: f.title,
        body: f.blurb,
        icon: f.icon,
      }));
      return (
        <LandingSectionShell section={section}>
          <FeatureGridSection
            eyebrow="What you get"
            title={section.title}
            subtitle={section.subtitle}
            items={items}
            columns={3}
            layout="cards"
            className={SHARED_CLS}
          />
        </LandingSectionShell>
      );
    }

    case "pricing":
      return (
        <LandingSectionShell section={section}>
          <PricingSection
            eyebrow="Pricing"
            title={section.title}
            subtitle={section.subtitle}
            tiers={deps.pricing as SliceTier[]}
            className={`${SHARED_CLS} bg-muted/30`}
          />
        </LandingSectionShell>
      );

    case "blog": {
      const items: SliceBlogPost[] = deps.posts.slice(0, 3).map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        publishedAt: p.publishedAt,
        tags: p.tags,
      }));
      return (
        <LandingSectionShell section={section}>
          <BlogListSection
            eyebrow="Latest writing"
            title={section.title}
            subtitle={section.subtitle}
            posts={items}
            hrefFor={(p) => `${PUBLIC_BASE}/blog/${p.slug}`}
            columns={3}
            layout="cards"
            limit={3}
            className={SHARED_CLS}
          />
        </LandingSectionShell>
      );
    }

    case "changelog": {
      const entries: SliceChangelogEntry[] = deps.changelog.slice(0, 4).map((e) => ({
        id: e.id,
        version: e.version,
        date: e.date,
        kind: e.kind === "chore" ? "chore" : e.kind === "fix" ? "fix" : "feature",
        title: e.title,
        body: e.body,
      }));
      return (
        <LandingSectionShell section={section}>
          <ChangelogFeedSection
            eyebrow="What's new"
            title={section.title}
            subtitle={section.subtitle}
            entries={entries}
            layout="list"
            limit={4}
            className={SHARED_CLS}
          />
        </LandingSectionShell>
      );
    }

    case "cta":
      return (
        <LandingSectionShell section={section}>
          <CtaBand
            title={section.title}
            subtitle={section.subtitle ?? "Spin up a workspace in 60 seconds."}
            cta={DEFAULT_SITE_CONFIG.ctaPrimary}
            secondaryCta={{ label: "Talk to sales", href: `${PUBLIC_BASE}/contact` }}
          />
        </LandingSectionShell>
      );

    case "testimonials":
    case "faq":
    case "services":
    case "stats":
    case "newsletter":
    case "custom":
      // No matching data source yet — render a minimal stub so the admin
      // sees its label without crashing the page.
      return (
        <LandingSectionShell
          section={section}
          defaultClassName={`${SHARED_CLS} mx-auto max-w-3xl px-6 text-center`}
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {section.kind}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {section.title}
          </h2>
          {section.subtitle ? (
            <p className="mt-3 text-sm text-muted-foreground">{section.subtitle}</p>
          ) : null}
        </LandingSectionShell>
      );

    default:
      return null;
  }
}
