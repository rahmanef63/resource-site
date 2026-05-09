"use client";

import * as React from "react";
import { Briefcase, FileSignature, FileText, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  HeroBlock,
  SectionHead,
  FeatureGrid,
  type FeatureItem,
} from "@/components/templates/_shared";
import { useProjects, useProposals } from "../../shared/store";
import { ADMIN_BASE, PUBLIC_BASE } from "../../shared/nav-config";

const SERVICES: FeatureItem[] = [
  { title: "Strategi & GTM", blurb: "Roadmap go-to-market, ICP definition, pricing strategy untuk launch baru." },
  { title: "Operations Audit", blurb: "Lean operations audit + quick-wins implementable dalam 8 minggu." },
  { title: "Org Design & Hiring", blurb: "Career ladder, interview rubric, onboarding system untuk scaling tim." },
  { title: "Workshop & Mentoring", blurb: "Intensive workshop fasilitasi + mentoring untuk leadership team." },
];

const FEATURES: FeatureItem[] = [
  { icon: FileText, title: "Proposal AI", blurb: "Generate proposal dari brief 1 paragraf — siap dipresentasikan." },
  { icon: FileSignature, title: "Kontrak ID-aware", blurb: "Template kontrak sesuai hukum Indonesia — bilingual." },
  { icon: Receipt, title: "PajakAware Invoice", blurb: "Auto PPN 11%, e-Faktur compatible, reminder otomatis." },
  { icon: Briefcase, title: "Project Tracking", blurb: "Status proyek live + progress milestone untuk klien." },
];

export function HomePage() {
  const projects = useProjects();
  return (
    <>
      <HeroBlock
        glow
        badge="Boutique consulting · Indonesia"
        title="Konsultan independen, tools setara firma global."
        subtitle="Proposal AI, kontrak ID-aware, PajakAware invoicing — workspace lengkap untuk konsultan Indonesia yang serius."
        primaryCta={{ label: "Konsultasi gratis", href: `${PUBLIC_BASE}/contact` }}
        secondaryCta={{ label: "Lihat case studies", href: `${PUBLIC_BASE}/case-studies` }}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHead
          eyebrow="Layanan"
          title="Empat area utama"
          subtitle="Fokus di strategi, operasi, organisasi, dan workshop intensif."
        />
        <FeatureGrid items={SERVICES} columns={4} className="mt-10" />
      </section>

      <section className="border-y border-border/50 bg-muted/10">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead
            eyebrow="Workspace"
            title="Tools yang menjalankan praktik kami"
            subtitle="Sistem ini sama yang juga bisa Anda pakai untuk firma sendiri."
            cta={{ label: "Buka demo", href: ADMIN_BASE }}
          />
          <FeatureGrid items={FEATURES} columns={4} className="mt-10" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHead
          eyebrow="Pengalaman"
          title="Proyek terbaru"
          subtitle="Sebagian engagement yang sedang/telah berjalan."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {projects.map((p) => (
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
      </section>
    </>
  );
}
