"use client";

import { Briefcase, FileSignature, FileText, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  HeroBlock,
  SectionHead,
  FeatureGrid,
  CtaBand,
  type FeatureItem,
} from "@/components/templates/_shared";
import { LandingSectionShell } from "@/components/templates/_shared/landing/LandingSectionShell";
import { parseConfigBadge } from "@/components/templates/_shared/landing/parse-config";
import type { LandingSection } from "@/components/templates/_shared/landing/types";
import { ADMIN_BASE, PUBLIC_BASE } from "../../shared/nav-config";
import type { Project } from "../../shared/types";

interface Deps {
  projects: Project[];
}

const SERVICE_ITEMS: FeatureItem[] = [
  { title: "Strategi & GTM", blurb: "Roadmap go-to-market, ICP definition, pricing strategy untuk launch baru." },
  { title: "Operations Audit", blurb: "Lean operations audit + quick-wins implementable dalam 8 minggu." },
  { title: "Org Design & Hiring", blurb: "Career ladder, interview rubric, onboarding system untuk scaling tim." },
  { title: "Workshop & Mentoring", blurb: "Intensive workshop fasilitasi + mentoring untuk leadership team." },
];

const FEATURE_ITEMS: FeatureItem[] = [
  { icon: FileText, title: "Proposal AI", blurb: "Generate proposal dari brief 1 paragraf — siap dipresentasikan." },
  { icon: FileSignature, title: "Kontrak ID-aware", blurb: "Template kontrak sesuai hukum Indonesia — bilingual." },
  { icon: Receipt, title: "PajakAware Invoice", blurb: "Auto PPN 11%, e-Faktur compatible, reminder otomatis." },
  { icon: Briefcase, title: "Project Tracking", blurb: "Status proyek live + progress milestone untuk klien." },
];

/**
 * Maps each enabled landingSection.kind to its konsultan renderer.
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
            badge={parseConfigBadge(section.config) ?? "Boutique consulting · Indonesia"}
            title={section.title}
            subtitle={section.subtitle}
            primaryCta={{ label: "Konsultasi gratis", href: `${PUBLIC_BASE}/contact` }}
            secondaryCta={{ label: "Lihat case studies", href: `${PUBLIC_BASE}/case-studies` }}
            image={section.imageUrl ? { url: section.imageUrl, ratio: section.imageRatio } : undefined}
          />
        </LandingSectionShell>
      );

    case "services":
      return (
        <LandingSectionShell section={section} defaultClassName="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead
            eyebrow="Layanan"
            title={section.title}
            subtitle={section.subtitle}
          />
          <FeatureGrid items={SERVICE_ITEMS} columns={4} className="mt-10" />
        </LandingSectionShell>
      );

    case "features":
      return (
        <LandingSectionShell section={section} defaultClassName="border-y border-border/50 bg-muted/10">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <SectionHead
              eyebrow="Workspace"
              title={section.title}
              subtitle={section.subtitle}
              cta={{ label: "Buka demo", href: ADMIN_BASE }}
            />
            <FeatureGrid items={FEATURE_ITEMS} columns={4} className="mt-10" />
          </div>
        </LandingSectionShell>
      );

    case "portfolio":
      return (
        <LandingSectionShell section={section} defaultClassName="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead
            eyebrow="Pengalaman"
            title={section.title}
            subtitle={section.subtitle}
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {deps.projects.map((p) => (
              <Card key={p.id} className="border-border/60 bg-card/60">
                <CardContent className="space-y-2 p-5">
                  <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                    {p.status}
                  </Badge>
                  <h3 className="text-base font-medium">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                    <div className="h-full bg-foreground/70" style={{ width: `${p.progress}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{p.progress}% complete</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </LandingSectionShell>
      );

    case "cta":
      return (
        <LandingSectionShell section={section}>
          <CtaBand
            title={section.title}
            subtitle={section.subtitle ?? "Respons dalam 24 jam."}
            cta={{ label: "Mulai konsultasi", href: `${PUBLIC_BASE}/contact` }}
          />
        </LandingSectionShell>
      );

    case "stats":
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

