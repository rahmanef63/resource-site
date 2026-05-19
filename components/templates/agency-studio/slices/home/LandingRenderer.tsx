"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  HeroBlock,
  SectionHead,
  CtaBand,
  MetricRow,
} from "@/components/templates/_shared";
import { LandingSectionShell } from "@/components/templates/_shared/landing/LandingSectionShell";
import type { LandingSection } from "@/components/templates/_shared/landing/types";
import { PUBLIC_BASE } from "../../shared/nav-config";
import { DEFAULT_SITE_CONFIG } from "../../shared/site-config";
import type { Project, Service } from "../../shared/types";

interface Deps {
  featured: Project[];
  services: Service[];
}

/**
 * Maps each enabled landingSection.kind to its agency-studio renderer.
 * Admin-editable title/subtitle thread through; unknown kinds render a
 * minimal stub so admin still sees them without crashing the page.
 */
export function renderLanding(section: LandingSection, deps: Deps) {
  switch (section.kind) {
    case "hero":
      return (
        <LandingSectionShell section={section}>
          <HeroBlock
            variant="split"
            eyebrow={DEFAULT_SITE_CONFIG.studioName}
            title={section.title}
            subtitle={section.subtitle ?? DEFAULT_SITE_CONFIG.description}
            primaryCta={{ label: "Start a project", href: `${PUBLIC_BASE}/contact` }}
            secondaryCta={{ label: "See work", href: `${PUBLIC_BASE}/portfolio` }}
            sidekick={
              section.imageUrl ? undefined : (
                <Card className="border-border/60">
                  <CardContent className="space-y-3 p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Selected stats
                    </p>
                    <MetricRow
                      rows={[
                        { k: "Active clients", v: "14" },
                        { k: "Projects shipped", v: "86+" },
                        { k: "Avg engagement", v: "6 weeks" },
                        { k: "NPS", v: "72" },
                      ]}
                    />
                  </CardContent>
                </Card>
              )
            }
            image={section.imageUrl ? { url: section.imageUrl, ratio: section.imageRatio } : undefined}
          />
        </LandingSectionShell>
      );

    case "portfolio":
      return (
        <LandingSectionShell section={section} defaultClassName="border-b border-border/60">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <SectionHead
              eyebrow="Featured work"
              title={section.title}
              subtitle={section.subtitle}
            />
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {deps.featured.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  href={`${PUBLIC_BASE}/portfolio/${p.slug}`}
                  className="group block overflow-hidden rounded-lg border border-border/60 bg-card transition hover:shadow-lg"
                >
                  <div
                    className="aspect-[16/9] w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${p.cover})` }}
                  />
                  <div className="p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {p.category}
                    </p>
                    <h3 className="mt-1 text-lg font-medium group-hover:underline">{p.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{p.client}</p>
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{p.blurb}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button asChild variant="ghost">
                <Link href={`${PUBLIC_BASE}/portfolio`}>
                  All work <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </LandingSectionShell>
      );

    case "services":
      return (
        <LandingSectionShell section={section} defaultClassName="border-b border-border/60 bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <SectionHead
              eyebrow="What we do"
              title={section.title}
              subtitle={section.subtitle}
            />
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {deps.services.filter((s) => s.featured).map((s) => (
                <Link
                  key={s.id}
                  href={`${PUBLIC_BASE}/services`}
                  className="group rounded-lg border border-border/60 bg-card p-6 transition hover:bg-card/90"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium">{s.name}</h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{s.blurb}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{s.duration}</span>
                    <span className="font-mono text-foreground">{s.priceLabel}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </LandingSectionShell>
      );

    case "cta":
      return (
        <LandingSectionShell section={section}>
          <CtaBand
            title={section.title}
            subtitle={section.subtitle ?? "No commitment. We respond within 24h."}
            cta={{ label: "Send the brief", href: `${PUBLIC_BASE}/contact` }}
          />
        </LandingSectionShell>
      );

    case "stats":
    case "features":
    case "pricing":
    case "blog":
    case "changelog":
    case "testimonials":
    case "faq":
    case "newsletter":
    case "custom":
      return (
        <LandingSectionShell
          section={section}
          defaultClassName="border-b border-border/40 bg-muted/10 py-12"
        >
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {section.kind}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{section.title}</h2>
            {section.subtitle ? (
              <p className="mt-3 text-sm text-muted-foreground">{section.subtitle}</p>
            ) : null}
          </div>
        </LandingSectionShell>
      );

    default:
      return null;
  }
}
