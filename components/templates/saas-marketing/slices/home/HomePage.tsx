"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HeroBlock,
  SectionHead,
  CtaBand,
  FeatureGrid,
  type FeatureItem,
} from "@/components/templates/_shared";
import { DEFAULT_SITE_CONFIG } from "../../shared/site-config";
import { useFeatures, usePricing, usePosts } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";

export function HomePage() {
  const c = DEFAULT_SITE_CONFIG;
  const features = useFeatures().slice(0, 3);
  const featureItems: FeatureItem[] = features.map((f) => ({ title: f.title, blurb: f.blurb }));
  const pricing = usePricing();
  const posts = usePosts().slice(0, 3);

  return (
    <>
      <HeroBlock
        badge="v1.7 — sequenced signing flows"
        title={c.tagline}
        subtitle={c.description}
        primaryCta={c.ctaPrimary}
        secondaryCta={{ label: "See features", href: `${PUBLIC_BASE}/features` }}
      />

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <SectionHead
            eyebrow="What you get"
            title="Built for developers shipping fast"
            subtitle="A focused signing API. No bloat, no per-seat surprises."
          />
          <FeatureGrid items={featureItems} columns={3} className="mt-10" />
          <div className="mt-8 text-center">
            <Button asChild variant="ghost">
              <Link href={`${PUBLIC_BASE}/features`}>
                All features <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <SectionHead
            eyebrow="Pricing"
            title="Simple, predictable, generous"
            subtitle="Free forever for prototypes. Paid plans scale with usage."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pricing.map((p) => (
              <div
                key={p.id}
                className={`rounded-lg border bg-card p-6 ${p.featured ? "border-foreground/40 ring-1 ring-foreground/10" : "border-border/60"}`}
              >
                {p.featured && <Badge variant="secondary" className="mb-2 rounded-full text-[10px]">Most picked</Badge>}
                <h3 className="text-base font-medium">{p.name}</h3>
                <p className="mt-1 text-3xl font-semibold tracking-tight">
                  {p.price} <span className="text-sm font-normal text-muted-foreground">{p.period}</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>
                <ul className="mt-4 space-y-1.5 text-sm">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" /> {b}
                    </li>
                  ))}
                </ul>
                <Button asChild variant={p.featured ? "default" : "outline"} className="mt-5 w-full">
                  <Link href={p.cta.href}>{p.cta.label}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <SectionHead eyebrow="Latest writing" title="From the team" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`${PUBLIC_BASE}/blog/${p.slug}`}
                className="group rounded-lg border border-border/60 bg-card p-5 transition hover:bg-card/90"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {p.tags[0]}
                </p>
                <h3 className="mt-1 text-base font-medium group-hover:underline">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="ghost">
              <Link href={`${PUBLIC_BASE}/blog`}>
                All posts <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <CtaBand
        title="Ship a signed PDF this afternoon."
        subtitle="Free tier, no card. Talk to a human anytime."
        cta={c.ctaPrimary}
        secondaryCta={{ label: "Talk to sales", href: `${PUBLIC_BASE}/contact` }}
      />
    </>
  );
}
