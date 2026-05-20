"use client";

import { BookOpen, Bot, FileText, Library, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  HeroBlock,
  SectionHead,
  FeatureGrid,
  type FeatureItem,
} from "@/components/templates/_shared";
import { LandingSectionShell } from "@/components/templates/_shared/landing/LandingSectionShell";
import { parseConfigBadge } from "@/components/templates/_shared/landing/parse-config";
import type { LandingSection } from "@/components/templates/_shared/landing/types";
import { ADMIN_BASE, PUBLIC_BASE } from "../../shared/nav-config";
import type { Document, LitReview } from "../../shared/types";

interface Deps {
  documents: Document[];
  litReviews: LitReview[];
}

const FEATURE_ITEMS: FeatureItem[] = [
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

/**
 * Maps each enabled landingSection.kind to its research renderer.
 * Admin-editable title/subtitle thread through; unknown kinds render a
 * minimal stub so admin still sees them without crashing the page.
 */
export function renderLanding(section: LandingSection, deps: Deps) {
  switch (section.kind) {
    case "hero":
      return (
        <LandingSectionShell section={section}>
          <HeroBlock
            glow
            badge={parseConfigBadge(section.config) ?? "Untuk peneliti, mahasiswa S2/S3, think-tank"}
            title={section.title}
            subtitle={section.subtitle}
            primaryCta={{ label: "Buka workspace", href: ADMIN_BASE }}
            secondaryCta={{ label: "Lihat library publik", href: `${PUBLIC_BASE}/library` }}
            image={section.imageUrl ? { url: section.imageUrl, ratio: section.imageRatio } : undefined}
          />
        </LandingSectionShell>
      );

    case "stats":
      return (
        <LandingSectionShell section={section} defaultClassName="border-y border-border/50 bg-muted/20">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 sm:py-10 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-semibold tracking-tight sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </LandingSectionShell>
      );

    case "features":
      return (
        <LandingSectionShell section={section} defaultClassName="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead
            eyebrow="Fitur"
            title={section.title}
            subtitle={section.subtitle}
          />
          <FeatureGrid items={FEATURE_ITEMS} columns={4} className="mt-10" />
        </LandingSectionShell>
      );

    case "blog":
      return (
        <LandingSectionShell section={section} defaultClassName="border-y border-border/50 bg-muted/10">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <SectionHead
              eyebrow="Library"
              title={section.title}
              subtitle={section.subtitle}
              cta={{ label: "Buka library", href: `${PUBLIC_BASE}/library` }}
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {deps.documents.slice(0, 3).map((d) => (
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
        </LandingSectionShell>
      );

    case "portfolio":
      return (
        <LandingSectionShell section={section} defaultClassName="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead
            eyebrow="Lit Review"
            title={section.title}
            subtitle={section.subtitle}
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {deps.litReviews.map((r) => (
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
        </LandingSectionShell>
      );

    case "pricing":
    case "changelog":
    case "services":
    case "testimonials":
    case "faq":
    case "newsletter":
    case "cta":
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

