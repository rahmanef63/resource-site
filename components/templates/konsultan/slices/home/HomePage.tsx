"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, FileSignature, FileText, Receipt, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { useProjects, useProposals } from "../../shared/store";
import { ADMIN_BASE, PUBLIC_BASE } from "../../shared/nav-config";

const SERVICES = [
  { title: "Strategi & GTM",          blurb: "Roadmap go-to-market, ICP definition, pricing strategy untuk launch baru." },
  { title: "Operations Audit",        blurb: "Lean operations audit + quick-wins implementable dalam 8 minggu." },
  { title: "Org Design & Hiring",     blurb: "Career ladder, interview rubric, onboarding system untuk scaling tim." },
  { title: "Workshop & Mentoring",    blurb: "Intensive workshop fasilitasi + mentoring untuk leadership team." },
];

const FEATURES = [
  { icon: FileText,      title: "Proposal AI",        blurb: "Generate proposal dari brief 1 paragraf — siap dipresentasikan." },
  { icon: FileSignature, title: "Kontrak ID-aware",   blurb: "Template kontrak sesuai hukum Indonesia — bilingual." },
  { icon: Receipt,       title: "PajakAware Invoice", blurb: "Auto PPN 11%, e-Faktur compatible, reminder otomatis." },
  { icon: Briefcase,     title: "Project Tracking",   blurb: "Status proyek live + progress milestone untuk klien." },
];

export function HomePage() {
  const projects = useProjects();
  const proposals = useProposals();
  return (
    <>
      <Hero />
      <ServicesGrid />
      <WorkspaceFeatures />
      <ProjectShowcase projects={projects} proposals={proposals} />
    </>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute -right-40 top-32 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-6xl px-6 pt-24 pb-28 md:pt-32 md:pb-36">
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px]">
          <Sparkles className="mr-1 size-3" /> Boutique consulting · Indonesia
        </Badge>
        <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          Konsultan independen, tools setara firma global.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Proposal AI, kontrak ID-aware, PajakAware invoicing — workspace lengkap untuk konsultan Indonesia
          yang serius.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link href={`${PUBLIC_BASE}/contact`}>Konsultasi gratis <ArrowRight className="size-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={`${PUBLIC_BASE}/case-studies`}>Lihat case studies</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function ServicesGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionHead
        eyebrow="Layanan"
        title="Empat area utama"
        subtitle="Fokus di strategi, operasi, organisasi, dan workshop intensif."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((s) => (
          <Card key={s.title} className="border-border/60 bg-card/60">
            <CardContent className="p-6">
              <h3 className="text-base font-medium">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.blurb}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function WorkspaceFeatures() {
  return (
    <section className="border-y border-border/50 bg-muted/10">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHead
          eyebrow="Workspace"
          title="Tools yang menjalankan praktik kami"
          subtitle="Sistem ini sama yang juga bisa Anda pakai untuk firma sendiri."
          cta={{ label: "Buka demo", href: ADMIN_BASE }}
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
      </div>
    </section>
  );
}

function ProjectShowcase({
  projects,
  proposals,
}: {
  projects: ReturnType<typeof useProjects>;
  proposals: ReturnType<typeof useProposals>;
}) {
  const proposalMap = new Map(proposals.map((p) => [p.id, p]));
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionHead
        eyebrow="Pengalaman"
        title="Proyek terbaru"
        subtitle="Sebagian engagement yang sedang/telah berjalan."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <Card key={p.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-2 p-5">
              <Badge variant="outline" className="rounded-full text-[10px] capitalize">{p.status}</Badge>
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
  );
}
