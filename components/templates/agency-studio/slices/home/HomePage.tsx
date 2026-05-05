"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_SITE_CONFIG } from "../../shared/site-config";
import { useFeaturedProjects, useServices } from "../../shared/store";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { PUBLIC_BASE } from "../../shared/nav-config";

export function HomePage() {
  const c = DEFAULT_SITE_CONFIG;
  const featured = useFeaturedProjects();
  const services = useServices().filter((s) => s.featured);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border/60">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-8">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{c.studioName}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">{c.tagline}</h1>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">{c.description}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href={`${PUBLIC_BASE}/contact`}>Start a project <ArrowRight className="size-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={`${PUBLIC_BASE}/portfolio`}>See work</Link>
              </Button>
            </div>
          </div>
          <div className="md:col-span-4">
            <Card className="border-border/60">
              <CardContent className="space-y-3 p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selected stats</p>
                <Stat k="Active clients" v="14" />
                <Stat k="Projects shipped" v="86+" />
                <Stat k="Avg engagement" v="6 weeks" />
                <Stat k="NPS" v="72" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured work */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHead eyebrow="Featured work" title="Recent client engagements" subtitle="A peek at what we've shipped lately." />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {featured.slice(0, 4).map((p) => (
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
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{p.category}</p>
                  <h3 className="mt-1 text-lg font-medium group-hover:underline">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.client}</p>
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{p.blurb}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="ghost">
              <Link href={`${PUBLIC_BASE}/portfolio`}>All work <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services strip */}
      <section className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHead eyebrow="What we do" title="Productized + retainer engagements" subtitle="Pick a sprint, a system build, or an embedded retainer." />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {services.map((s) => (
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
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Brief us — get a proposal in 5 days.</h2>
          <p className="mt-3 text-muted-foreground">No commitment. We respond within 24h.</p>
          <Button asChild size="lg" className="mt-6">
            <Link href={`${PUBLIC_BASE}/contact`}>Send the brief <ArrowRight className="size-4" /></Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-sm text-muted-foreground">{k}</span>
      <span className="text-xl font-semibold tracking-tight">{v}</span>
    </div>
  );
}
