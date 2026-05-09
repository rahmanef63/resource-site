"use client";

import * as React from "react";
import { BookOpen, Bot, FileText, Library, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  HeroBlock,
  SectionHead,
  FeatureGrid,
  type FeatureItem,
} from "@/components/templates/_shared";
import { useDocuments, useLitReviews } from "../../shared/store";
import { PUBLIC_BASE, ADMIN_BASE } from "../../shared/nav-config";

const FEATURES: FeatureItem[] = [
  { icon: FileText, title: "Document Library", blurb: "Upload PDF/DOCX, OCR otomatis, indeks vektor untuk pencarian semantik." },
  { icon: Bot, title: "AI Reader", blurb: "Chat dengan dokumen — tanya, parafrase, ringkas. Paham EYD bahasa Indonesia." },
  { icon: Library, title: "Lit Review Matrix", blurb: "Bandingkan 10+ paper sekaligus: metode, temuan, gap penelitian." },
  { icon: Quote, title: "Citation Manager", blurb: "APA, MLA, Chicago, IEEE, BibTeX. Auto-extract metadata dari PDF." },
];

const STATS = [
  { value: "10+", label: "Format dokumen" },
  { value: "5", label: "Citation styles" },
  { value: "EYD", label: "Mode akademik ID" },
  { value: "100%", label: "Privasi lokal" },
];

export function HomePage() {
  const documents = useDocuments();
  const litReviews = useLitReviews();
  return (
    <>
      <HeroBlock
        glow
        badge="Untuk peneliti, mahasiswa S2/S3, think-tank"
        title="Riset workspace yang paham bahasa akademik Indonesia."
        subtitle="Baca PDF, review literatur, dan draft tesis — semua dalam satu workspace dengan AI yang ngerti EYD dan metodologi riset."
        primaryCta={{ label: "Buka workspace", href: ADMIN_BASE }}
        secondaryCta={{ label: "Lihat library publik", href: `${PUBLIC_BASE}/library` }}
      />

      <section className="border-y border-border/50 bg-muted/20">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 sm:py-10 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-semibold tracking-tight sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHead
          eyebrow="Fitur"
          title="Semua yang dibutuhkan dalam siklus riset"
          subtitle="Dari upload paper sampai draft bab — satu workspace, AI di setiap titik."
        />
        <FeatureGrid items={FEATURES} columns={4} className="mt-10" />
      </section>

      <section className="border-y border-border/50 bg-muted/10">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead
            eyebrow="Library"
            title="Paper terbaru"
            subtitle="Sebagian dari knowledge-base yang sudah diindeks."
            cta={{ label: "Buka library", href: `${PUBLIC_BASE}/library` }}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.slice(0, 3).map((d) => (
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

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHead
          eyebrow="Lit Review"
          title="Sintesis literatur jadi mudah"
          subtitle="Matrix bandingkan metode, temuan, dan gap antar paper otomatis."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {litReviews.map((r) => (
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
    </>
  );
}
