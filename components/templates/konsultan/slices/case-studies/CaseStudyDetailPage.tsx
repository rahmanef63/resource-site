"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  MapPin,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  fmtDate,
  slugify,
  useClients,
  useProjects,
} from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";

const PHASES = [
  { label: "Diagnostic", text: "Discovery interview + data review." },
  { label: "Synthesis", text: "Pemetaan isu dan opsi solusi." },
  { label: "Recommendation", text: "Roadmap eksekusi & business case." },
  { label: "Handover", text: "Knowledge transfer ke tim klien." },
];

export function CaseStudyDetailPage({ slug }: { slug: string }) {
  const projects = useProjects();
  const clients = useClients();
  const project = projects.find((p) => slugify(p.name) === slug);
  if (!project) notFound();

  const client = clients.find((c) => c.id === project.clientId);
  const others = projects.filter((p) => p.id !== project.id).slice(0, 2);

  return (
    <article className="mx-auto max-w-4xl px-6 py-16">
      <Button asChild variant="ghost" size="sm" className="mb-8 gap-1.5 -ml-2">
        <Link href={`${PUBLIC_BASE}/case-studies`}>
          <ArrowLeft className="size-3.5" /> Semua case studies
        </Link>
      </Button>

      <header className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          {client?.industry && (
            <Badge variant="outline" className="rounded-full text-[10px]">
              {client.industry}
            </Badge>
          )}
          <Badge variant="outline" className="rounded-full text-[10px] capitalize">
            {project.status}
          </Badge>
        </div>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
          {project.name}
        </h1>
        <p className="text-lg text-muted-foreground">{project.description}</p>
      </header>

      <Card className="mt-8 border-border/60 bg-card/60">
        <CardContent className="grid gap-6 p-6 md:grid-cols-3">
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
              <Building2 className="size-3.5" /> Klien
            </p>
            <p className="text-sm font-medium">{client?.company ?? "—"}</p>
          </div>
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
              <MapPin className="size-3.5" /> Lokasi
            </p>
            <p className="text-sm font-medium">{client?.city ?? "—"}</p>
          </div>
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
              <Calendar className="size-3.5" /> Mulai
            </p>
            <p className="text-sm font-medium">{fmtDate(project.startedAt)}</p>
          </div>
        </CardContent>
      </Card>

      <section className="mt-12 space-y-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Target className="size-5 text-muted-foreground" /> Konteks engagement
        </h2>
        <p className="leading-relaxed text-foreground/85">
          {client?.company} menghadapi tantangan {client?.industry?.toLowerCase()} yang membutuhkan
          pendekatan terstruktur. Tim kami menjalankan engagement dengan fokus pada hasil yang
          siap dieksekusi — bukan hanya rekomendasi.
        </p>
        <p className="leading-relaxed text-foreground/85">
          {project.description} Engagement saat ini berada di {project.progress}% progress
          dengan timeline berakhir {fmtDate(project.endsAt)}.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Briefcase className="size-5 text-muted-foreground" /> Pendekatan
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {PHASES.map((p, i) => (
            <Card key={p.label} className="border-border/60 bg-card/60">
              <CardContent className="space-y-2 p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex size-6 items-center justify-center rounded-full bg-muted/50 text-[10px] font-semibold">
                    {i + 1}
                  </span>
                  <span className="uppercase tracking-wider">{p.label}</span>
                </div>
                <p className="text-sm">{p.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold">Progress</h2>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/40">
          <div
            className="h-full bg-foreground/80 transition-all"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {project.progress}% complete · target selesai {fmtDate(project.endsAt)}
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold">Outcome (target)</h2>
        <ul className="space-y-2 text-sm">
          {[
            "Rekomendasi yang teruji secara data",
            "Roadmap eksekusi yang konkret",
            "Tim klien yang lebih kapabel pasca-engagement",
          ].map((o) => (
            <li key={o} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500/70" />
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </section>

      <Card className="mt-12 border-border/60 bg-gradient-to-br from-foreground/[0.04] to-transparent">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Punya tantangan serupa?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Diskusi 30 menit gratis dengan tim kami.
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href={`${PUBLIC_BASE}/contact`}>
              Jadwalkan <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {others.length > 0 && (
        <section className="mt-16">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Case study lainnya
          </h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {others.map((o) => (
              <Link key={o.id} href={`${PUBLIC_BASE}/case-studies/${slugify(o.name)}`}>
                <Card className="h-full border-border/60 bg-card/60 transition-colors hover:border-foreground/30">
                  <CardContent className="space-y-2 p-5">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground capitalize">
                      {o.status}
                    </p>
                    <h4 className="text-base font-medium leading-snug">{o.name}</h4>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
