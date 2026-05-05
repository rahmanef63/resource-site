"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Calendar, CheckCircle2, Clock, Quote, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fmtDate, usePortfolio, usePublishedPosts, useServices } from "../../shared/store";
import { SectionHead } from "../../shared/ui/section-head";
import { PUBLIC_BASE } from "../../shared/ui/site-nav";
import { NewsletterBlock } from "./NewsletterBlock";

const HERO_IMG =
  "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1800&q=70";

const STATS = [
  { value: "120+", label: "Klien & student" },
  { value: "8 thn", label: "Praktek industri" },
  { value: "60K", label: "Newsletter readers" },
  { value: "4.9", label: "Avg rating sesi" },
];

const TESTIMONIALS = [
  { quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore.", name: "Asep Wijaya", role: "CEO, Acme Indonesia" },
  { quote: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.", name: "Putri Maharani", role: "Head of Product, Foobar" },
  { quote: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.", name: "Bayu Setiawan", role: "Founder, Beta Labs" },
  { quote: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", name: "Linda Hartono", role: "VP Engineering, Gamma" },
];

export function HomePage() {
  const posts = usePublishedPosts().slice(0, 3);
  const portfolio = usePortfolio().slice(0, 4);
  const services = useServices();

  return (
    <>
      <Hero />
      <StatsStrip />
      <FeaturedPosts posts={posts} />
      <PortfolioStrip items={portfolio} />
      <ServicesBand services={services} />
      <TestimonialsGrid />
      <NewsletterBlock />
    </>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image src={HERO_IMG} alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/85 to-background" />
        <div className="absolute -right-40 top-32 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-6xl px-6 pt-24 pb-28 md:pt-32 md:pb-36">
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px]">
          <Sparkles className="mr-1 size-3" /> 2026 mentorship cohort open
        </Badge>
        <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Tempor incididunt ut labore et dolore magna aliqua — strategi produk, mentorship engineer, dan riset go-to-market untuk founder &amp; tim Indonesia.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link href={`${PUBLIC_BASE}/services`}>Lihat layanan <ArrowRight className="size-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={`${PUBLIC_BASE}/portfolio`}>Karya terpilih</Link>
          </Button>
        </div>
        <p className="mt-12 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Trusted by — Acme · Foobar · Beta Labs · Gamma · Delta · Zeta
        </p>
      </div>
    </section>
  );
}

function StatsStrip() {
  return (
    <section className="border-y border-border/50 bg-muted/20">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label}>
            <p className="text-3xl font-semibold tracking-tight">{s.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedPosts({ posts }: { posts: ReturnType<typeof usePublishedPosts> }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionHead
        eyebrow="Blog"
        title="Tulisan terbaru"
        subtitle="Esai panjang & catatan singkat — strategy, engineering, refleksi."
        cta={{ label: "Semua tulisan", href: `${PUBLIC_BASE}/blog` }}
      />
      <div className="grid gap-6 md:grid-cols-3">
        {posts.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">Belum ada post yang dipublish — cek tab Admin → Posts → New.</p>
        )}
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`${PUBLIC_BASE}/blog/${p.slug}`}
            className="group overflow-hidden rounded-xl border border-border/60 bg-card/50 transition hover:border-border"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={p.cover}
                alt=""
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Badge variant="outline" className="rounded-full text-[10px]">{p.tag}</Badge>
                <span className="inline-flex items-center gap-1"><Calendar className="size-3" /> {fmtDate(p.publishedAt)}</span>
                <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {p.readMin} min</span>
              </div>
              <h3 className="text-base font-medium leading-snug">{p.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-foreground/80 group-hover:text-foreground">
                Read post <ArrowUpRight className="size-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PortfolioStrip({ items }: { items: ReturnType<typeof usePortfolio> }) {
  return (
    <section className="border-y border-border/50 bg-muted/10">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHead
          eyebrow="Portfolio"
          title="Karya terpilih"
          subtitle="Case study dengan struktur problem→approach→result."
          cta={{ label: "Lihat semua", href: `${PUBLIC_BASE}/portfolio` }}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((p) => (
            <Link
              key={p.id}
              href={`${PUBLIC_BASE}/portfolio/${p.slug}`}
              className="group relative block aspect-[16/10] overflow-hidden rounded-xl border border-border/60"
            >
              <Image
                src={p.cover}
                alt=""
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{p.category}</p>
                <h3 className="mt-1 text-xl font-medium">{p.title}</h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">{p.blurb}</p>
              </div>
              <ArrowUpRight className="absolute right-4 top-4 size-5 text-foreground/70 transition group-hover:text-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesBand({ services }: { services: ReturnType<typeof useServices> }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionHead
        eyebrow="Services"
        title="Cara kerja sama"
        subtitle="Pilih yang paling sesuai konteks tim atau kariermu."
        cta={{ label: "Detail", href: `${PUBLIC_BASE}/services` }}
      />
      <div className="grid gap-5 md:grid-cols-3">
        {services.map((s) => (
          <Card
            key={s.id}
            className={
              "relative border-border/60 bg-card/60 " + (s.featured ? "ring-1 ring-foreground/30" : "")
            }
          >
            {s.featured && (
              <Badge className="absolute right-4 top-4 rounded-full">Most picked</Badge>
            )}
            <CardContent className="p-6">
              <Sparkles className="size-5 text-foreground/80" />
              <h3 className="mt-4 text-lg font-medium">{s.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight">{s.priceLabel}</span>
                <span className="text-sm text-muted-foreground">{s.period}</span>
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 text-foreground/70" />
                    {b}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-6 w-full" variant={s.featured ? "default" : "outline"}>
                <Link href={`${PUBLIC_BASE}/services#${s.slug}`}>
                  Book consultation <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function TestimonialsGrid() {
  return (
    <section className="border-y border-border/50 bg-muted/10">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHead
          eyebrow="Testimonials"
          title="Apa kata mereka"
          subtitle="Sebagian feedback dari klien dan student."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} className="border-border/60 bg-card/60">
              <CardContent className="p-6">
                <Quote className="size-5 text-muted-foreground/60" />
                <p className="mt-3 text-sm leading-relaxed text-foreground/85">"{t.quote}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-full bg-foreground text-xs text-background">
                    {t.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
