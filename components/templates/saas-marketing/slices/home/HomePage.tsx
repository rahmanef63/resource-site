"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaBand } from "@/components/templates/_shared";
import {
  useChangelog,
  useFeatures,
  useLandingSections,
  usePosts,
  usePricing,
} from "../../shared/store";
import { DEFAULT_SITE_CONFIG } from "../../shared/site-config";
import { PUBLIC_BASE } from "../../shared/nav-config";
import { renderLanding } from "./LandingRenderer";
import { HomeStatsStrip, SocialProofRow } from "./HomeStats";
import { HomePricingTeaser, HomeTestimonials } from "./HomeTestimonials";

/**
 * CK-2B expansion:
 *
 * Public landing now layers admin-controlled `landingSections` (the
 * AB-wave composition layer) with three always-on bands that wouldn't fit
 * the data-driven model: social-proof logos, numeric KPI strip, and an
 * editorial testimonial grid. Pricing teaser drives traffic to /pricing;
 * the CTA band is the universal closer.
 *
 * Section files are siblings (HomeStats.tsx, HomeTestimonials.tsx) so each
 * stays under the 200 LOC cap. Admin still owns hero copy + section order
 * via /admin/landing — the renderer wired below respects every enabled
 * section there before our extras kick in.
 */
export function HomePage() {
  const sections = useLandingSections();
  const features = useFeatures();
  const pricing = usePricing();
  const posts = usePosts();
  const changelog = useChangelog();

  const ordered = React.useMemo(
    () => [...sections].filter((s) => s.enabled).sort((a, b) => a.order - b.order),
    [sections],
  );

  // Splice extras into the canonical flow: hero → social proof → admin
  // sections → stats → testimonials → pricing teaser → CTA.
  const heroSection = ordered.find((s) => s.kind === "hero");
  const restSections = ordered.filter((s) => s.kind !== "hero");

  return (
    <>
      {heroSection && renderLanding(heroSection, { features, pricing, posts, changelog })}
      <SocialProofRow />
      {restSections.map((s) => renderLanding(s, { features, pricing, posts, changelog }))}
      <HomeStatsStrip />
      <HomeTestimonials />
      <HomePricingTeaser />
      <section className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-12 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            What shipped this month
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            We release every week
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Sequenced signing flows, EU residency, webhook v2 — all rolled out in the
            last six weeks. Full history on the changelog.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href={`${PUBLIC_BASE}/changelog`}>
              View changelog <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
      <CtaBand
        title="Ready to ship signed PDFs?"
        subtitle={`Spin up a workspace in 60 seconds. ${DEFAULT_SITE_CONFIG.tagline}`}
        cta={DEFAULT_SITE_CONFIG.ctaPrimary}
        secondaryCta={{ label: "Talk to sales", href: `${PUBLIC_BASE}/contact` }}
        bordered
      />
    </>
  );
}
