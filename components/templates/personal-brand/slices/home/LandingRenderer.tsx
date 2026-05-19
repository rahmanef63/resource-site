"use client";

import * as React from "react";
import type { LandingSection } from "@/components/templates/_shared/landing/types";
import { Hero } from "./Hero";
import { NewsletterBlock } from "./NewsletterBlock";
import {
  FeaturedPosts,
  PortfolioStrip,
  ServicesBand,
  StatsStrip,
  TestimonialsGrid,
} from "./HomeSections";
import type {
  Service,
  PortfolioItem,
  Post,
} from "../../shared/types";

interface Deps {
  posts: Post[];
  portfolio: PortfolioItem[];
  services: Service[];
}

/**
 * Personal-brand landing renderer. Maps each enabled section.kind to
 * its template-side component, threading admin-editable title / subtitle
 * through. Unknown kinds render a minimal stub so admin still sees them
 * without crashing the page.
 */
export function renderLanding(section: LandingSection, deps: Deps) {
  switch (section.kind) {
    case "hero":
      return (
        <Hero
          key={section.id}
          title={section.title}
          subtitle={section.subtitle}
          badge={parseConfigBadge(section.config)}
        />
      );

    case "stats":
      return <StatsStrip key={section.id} />;

    case "blog":
      return <FeaturedPosts key={section.id} posts={deps.posts.slice(0, 3)} />;

    case "portfolio":
      return <PortfolioStrip key={section.id} items={deps.portfolio.slice(0, 4)} />;

    case "services":
      return <ServicesBand key={section.id} services={deps.services} />;

    case "testimonials":
      return <TestimonialsGrid key={section.id} />;

    case "newsletter":
    case "cta":
      return <NewsletterBlock key={section.id} />;

    case "features":
    case "pricing":
    case "changelog":
    case "faq":
    case "custom":
      return (
        <section
          key={section.id}
          className="border-y border-border/40 bg-muted/10 py-12"
        >
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {section.kind}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {section.title}
            </h2>
            {section.subtitle ? (
              <p className="mt-3 text-sm text-muted-foreground">{section.subtitle}</p>
            ) : null}
          </div>
        </section>
      );

    default:
      return null;
  }
}

/** Optional badge override from the section's config JSON: `{"badge":"…"}`. */
function parseConfigBadge(config?: string): string | undefined {
  if (!config) return undefined;
  try {
    const parsed = JSON.parse(config) as { badge?: unknown };
    return typeof parsed.badge === "string" ? parsed.badge : undefined;
  } catch {
    return undefined;
  }
}
