"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { SEED_PUBLICATIONS } from "../../shared/publications-seed";
import { PUBLIC_BASE } from "../../shared/nav-config";
import type { Publication } from "../../shared/types";

const TYPE_LABEL: Record<Publication["type"], string> = {
  journal: "Jurnal",
  preprint: "Preprint",
  conference: "Konferensi",
  report: "Laporan",
  chapter: "Bab buku",
};

const TYPE_TONE: Record<Publication["type"], string> = {
  journal: "bg-sky-500/15 text-sky-300 hover:bg-sky-500/15",
  preprint: "bg-amber-500/15 text-amber-300 hover:bg-amber-500/15",
  conference: "bg-violet-500/15 text-violet-300 hover:bg-violet-500/15",
  report: "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15",
  chapter: "bg-rose-500/15 text-rose-300 hover:bg-rose-500/15",
};

type TypeFilter = Publication["type"] | "all";

const FILTERS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "journal", label: "Jurnal" },
  { value: "preprint", label: "Preprint" },
  { value: "conference", label: "Konferensi" },
  { value: "report", label: "Laporan" },
];

export function PublicationsListPage() {
  const [q, setQ] = React.useState("");
  const [type, setType] = React.useState<TypeFilter>("all");

  const filtered = React.useMemo(() => {
    const needle = q.toLowerCase().trim();
    return SEED_PUBLICATIONS.filter((p) => {
      if (type !== "all" && p.type !== type) return false;
      if (!needle) return true;
      return (
        p.title.toLowerCase().includes(needle) ||
        p.authors.toLowerCase().includes(needle) ||
        p.venue.toLowerCase().includes(needle) ||
        p.keywords.some((k) => k.toLowerCase().includes(needle))
      );
    }).sort((a, b) => b.year - a.year);
  }, [q, type]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <SectionHead
        eyebrow="Publications"
        title="Output riset terverifikasi"
        subtitle="Paper, preprint, dan laporan yang sudah dirilis. Klik untuk baca abstrak penuh dan ambil sitasi."
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Filter className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari judul, penulis, venue, keyword..."
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              type="button"
              variant={type === f.value ? "secondary" : "outline"}
              size="sm"
              onClick={() => setType(f.value)}
              className="h-7 rounded-full px-3 text-[11px] uppercase tracking-wider"
            >
              {f.label}
            </Button>
          ))}
        </div>
        <Badge variant="outline" className="rounded-full">{filtered.length}</Badge>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">Tidak ada publikasi yang cocok dengan filter.</p>
        )}
        {filtered.map((p) => (
          <Card key={p.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-2 p-5">
              <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                <BookOpen className="size-3" />
                <span>{p.year}</span>
                <Badge className={"rounded-full text-[10px] " + TYPE_TONE[p.type]}>{TYPE_LABEL[p.type]}</Badge>
                <span>·</span>
                <span className="normal-case tracking-normal">{p.venue}</span>
                {p.pages && <span>· hal {p.pages}</span>}
              </div>
              <Link
                href={`${PUBLIC_BASE}/publications/${p.slug}`}
                className="block text-base font-medium leading-snug hover:underline"
              >
                {p.title}
              </Link>
              <p className="text-xs text-muted-foreground">{p.authors}</p>
              <p className="line-clamp-3 text-sm text-foreground/75">{p.abstract}</p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-muted-foreground">
                <span className="font-mono">DOI: {p.doi}</span>
                <Link
                  href={`${PUBLIC_BASE}/publications/${p.slug}`}
                  className="inline-flex items-center gap-1 text-foreground/80 hover:text-foreground"
                >
                  Lihat detail <ArrowUpRight className="size-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
