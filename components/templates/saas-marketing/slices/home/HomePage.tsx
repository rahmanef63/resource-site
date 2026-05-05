"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { DEFAULT_SITE_CONFIG } from "../../shared/site-config";
import { useFeatures, usePricing, usePosts } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";

export function HomePage() {
  const c = DEFAULT_SITE_CONFIG;
  const features = useFeatures().slice(0, 3);
  const pricing = usePricing();
  const posts = usePosts().slice(0, 3);

  return (
    <>
      <section className="border-b border-border/60 bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center md:py-32">
          <Badge variant="outline" className="rounded-full">v1.7 — sequenced signing flows</Badge>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight md:text-6xl">
            {c.tagline}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            {c.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href={c.ctaPrimary.href}>{c.ctaPrimary.label} <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={`${PUBLIC_BASE}/features`}>See features</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">No credit card. 100 free signed PDFs / month.</p>
        </div>
      </section>

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHead
            eyebrow="What you get"
            title="Built for developers shipping fast"
            subtitle="A focused signing API. No bloat, no per-seat surprises."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <div key={f.id} className="rounded-lg border border-border/60 bg-card p-6">
                <h3 className="text-base font-medium">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.blurb}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="ghost"><Link href={`${PUBLIC_BASE}/features`}>All features <ArrowRight className="size-4" /></Link></Button>
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHead
            eyebrow="Pricing"
            title="Simple, predictable, generous"
            subtitle="Free forever for prototypes. Paid plans scale with usage."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {pricing.map((p) => (
              <div
                key={p.id}
                className={`rounded-lg border bg-card p-6 ${p.featured ? "border-foreground/40 ring-1 ring-foreground/10" : "border-border/60"}`}
              >
                <h3 className="text-base font-medium">{p.name}</h3>
                <p className="mt-1 text-3xl font-semibold tracking-tight">{p.price} <span className="text-sm font-normal text-muted-foreground">{p.period}</span></p>
                <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>
                <ul className="mt-4 space-y-1.5 text-sm">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-3.5 text-muted-foreground" /> {b}
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
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHead eyebrow="Latest writing" title="From the team" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.id} href={`${PUBLIC_BASE}/blog/${p.slug}`} className="group rounded-lg border border-border/60 bg-card p-5 transition hover:bg-card/90">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{p.tags[0]}</p>
                <h3 className="mt-1 text-base font-medium group-hover:underline">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="ghost"><Link href={`${PUBLIC_BASE}/blog`}>All posts <ArrowRight className="size-4" /></Link></Button>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Ship a signed PDF this afternoon.</h2>
          <p className="mt-3 text-muted-foreground">Free tier, no card. Talk to a human anytime.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg"><Link href={c.ctaPrimary.href}>{c.ctaPrimary.label}</Link></Button>
            <Button asChild variant="outline" size="lg"><Link href={`${PUBLIC_BASE}/contact`}>Talk to sales</Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}
