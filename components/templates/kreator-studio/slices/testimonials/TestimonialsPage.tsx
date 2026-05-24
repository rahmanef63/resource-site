"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PUBLIC_BASE } from "../../shared/nav-config";
import { useFeaturedClients, useTestimonials } from "../../shared/store";
import type { Testimonial } from "../../shared/types";
import {
  FeaturedTestimonialCard,
  TestimonialCard,
} from "./TestimonialsCard";

type Filter = "all" | "client" | "audience" | "newsletter";

const FILTER_LABEL: Record<Filter, string> = {
  all: "Semua",
  client: "Klien & brand",
  audience: "Audience",
  newsletter: "Newsletter readers",
};

function matchFilter(t: Testimonial, f: Filter): boolean {
  if (f === "all") return true;
  if (f === "client") return t.channel === "client";
  if (f === "newsletter") return t.channel === "newsletter";
  return t.channel !== "client" && t.channel !== "newsletter";
}

/**
 * Wall-of-love. Featured quotes spotlight + masonry grid + client logo strip.
 * 8-12 testimonials seeded, filter chips (client / audience / newsletter).
 */
export function TestimonialsPage() {
  const testimonials = useTestimonials();
  const clients = useFeaturedClients();
  const [filter, setFilter] = React.useState<Filter>("all");
  const filtered = testimonials.filter((t) => matchFilter(t, filter));
  const featured = testimonials.filter((t) => t.featured).slice(0, 2);
  const filters: Filter[] = ["all", "client", "audience", "newsletter"];
  const avgRating =
    testimonials.length === 0
      ? 0
      : testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <header className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Testimonials
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
          Apa kata klien & audience.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Wall-of-love dari brand yang pernah kerja sama dan reader yang konsisten
          baca tiap minggu. Real words, real outcomes.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <span className="font-medium">{avgRating.toFixed(1)}</span>
            <span className="text-muted-foreground">avg rating</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-muted-foreground">
            {testimonials.length} testimoni · {clients.length} brand
          </span>
        </div>
      </header>

      {/* Featured client logos strip */}
      <div className="mt-12">
        <p className="mb-4 text-[11px] uppercase tracking-wider text-muted-foreground">
          Trusted by
        </p>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-7">
          {clients.map((c) => (
            <div
              key={c.id}
              className={`flex h-16 items-center justify-center rounded-lg border border-border/60 bg-gradient-to-br ${c.gradient} backdrop-blur transition hover:scale-[1.02]`}
            >
              <div className="text-center">
                <div className="text-2xl font-bold tracking-tight text-foreground/85">
                  {c.initial}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  {c.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured spotlight quotes */}
      {featured.length > 0 && (
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {featured.map((t) => (
            <FeaturedTestimonialCard key={t.id} t={t} />
          ))}
        </div>
      )}

      {/* Filter chips */}
      <div className="mt-12 mb-6 flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setFilter(f)}
          >
            {FILTER_LABEL[f]}
          </Button>
        ))}
      </div>

      {/* Masonry grid of remaining quotes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <TestimonialCard key={t.id} t={t} />
        ))}
      </div>

      <Separator className="my-16 opacity-60" />

      {/* CTA */}
      <Card className="border-border/60 bg-gradient-to-br from-card via-card to-muted/40">
        <CardContent className="flex flex-col items-start gap-3 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">
              Mau jadi case study berikutnya?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Lihat paket kerja sama atau langsung book brief call gratis.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`${PUBLIC_BASE}/pricing`}>Lihat pricing</Link>
            </Button>
            <Button asChild>
              <Link href={`${PUBLIC_BASE}/about`}>
                Brief call <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
