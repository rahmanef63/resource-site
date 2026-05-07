"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Bot, FileText, Library, Quote, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { useDocuments, useLitReviews } from "../../shared/store";
import { PUBLIC_BASE, ADMIN_BASE } from "../../shared/nav-config";

const FEATURES = [
  { icon: FileText,  title: "Document Library",  blurb: "Upload PDF/DOCX, OCR otomatis, indeks vektor untuk pencarian semantik." },
  { icon: Bot,       title: "AI Reader",         blurb: "Chat dengan dokumen — tanya, parafrase, ringkas. Paham EYD bahasa Indonesia." },
  { icon: Library,   title: "Lit Review Matrix", blurb: "Bandingkan 10+ paper sekaligus: metode, temuan, gap penelitian." },
  { icon: Quote,     title: "Citation Manager",  blurb: "APA, MLA, Chicago, IEEE, BibTeX. Auto-extract metadata dari PDF." },
];

const STATS = [
  { value: "10+",  label: "Format dokumen" },
  { value: "5",    label: "Citation styles" },
  { value: "EYD",  label: "Mode akademik ID" },
  { value: "100%", label: "Privasi lokal" },
];

export function HomePage() {
  const documents = useDocuments();
  const litReviews = useLitReviews();
  return (
    <>
      <Hero />
      <StatsStrip />
      <FeatureGrid />
      <RecentLibrary docs={documents.slice(0, 3)} />
      <LitReviewBand reviews={litReviews} />
    </>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute -right-40 top-32 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-6xl px-6 pt-24 pb-28 md:pt-32 md:pb-36">
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px]">
          <Sparkles className="mr-1 size-3" /> Untuk peneliti, mahasiswa S2/S3, think-tank
        </Badge>
        <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          Riset workspace yang paham bahasa akademik Indonesia.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Baca PDF, review literatur, dan draft tesis — semua dalam satu workspace dengan AI yang ngerti EYD dan
          metodologi riset.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link href={ADMIN_BASE}>Buka workspace <ArrowRight className="size-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={`${PUBLIC_BASE}/library`}>Lihat library publik</Link>
          </Button>
        </div>
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

function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionHead
        eyebrow="Fitur"
        title="Semua yang dibutuhkan dalam siklus riset"
        subtitle="Dari upload paper sampai draft bab — satu workspace, AI di setiap titik."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.title} className="border-border/60 bg-card/60">
              <CardContent className="p-6">
                <Icon className="size-5 text-foreground/80" />
                <h3 className="mt-4 text-base font-medium">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.blurb}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function RecentLibrary({ docs }: { docs: ReturnType<typeof useDocuments> }) {
  return (
    <section className="border-y border-border/50 bg-muted/10">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHead
          eyebrow="Library"
          title="Paper terbaru"
          subtitle="Sebagian dari knowledge-base yang sudah diindeks."
          cta={{ label: "Buka library", href: `${PUBLIC_BASE}/library` }}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {docs.map((d) => (
            <Card key={d.id} className="border-border/60 bg-card/60">
              <CardContent className="space-y-2 p-5">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <BookOpen className="size-3" />
                  <span>{d.year}</span>
                  <Badge variant="outline" className="rounded-full text-[10px]">{d.tag}</Badge>
                </div>
                <h3 className="text-sm font-medium leading-snug">{d.title}</h3>
                <p className="text-xs text-muted-foreground">{d.authors}</p>
                <p className="line-clamp-3 text-xs text-foreground/70">{d.abstract}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function LitReviewBand({ reviews }: { reviews: ReturnType<typeof useLitReviews> }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionHead
        eyebrow="Lit Review"
        title="Sintesis literatur jadi mudah"
        subtitle="Matrix bandingkan metode, temuan, dan gap antar paper otomatis."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {reviews.map((r) => (
          <Card key={r.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-2 p-6">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Topik riset</p>
              <h3 className="text-base font-medium">{r.topic}</h3>
              <p className="text-sm text-muted-foreground">{r.question}</p>
              <p className="text-xs text-foreground/70">{r.docIds.length} paper · {r.matrix.length} entri matrix</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
