"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ADMIN_BASE } from "../../shared/nav-config";

const PRINCIPLES = [
  "Privasi-first — dokumen diproses di workspace pribadi.",
  "EYD-aware — AI ngerti tata bahasa akademik Indonesia.",
  "Citation-correct — APA, MLA, Chicago, IEEE, BibTeX.",
  "Methodology-aware — review logika metode otomatis.",
  "Source-of-truth — setiap klaim selalu balik ke dokumen asli.",
  "Open formats — export ke .docx, .tex, .md, .bib.",
];

const TIMELINE = [
  { year: "2026", milestone: "Riset Kit launch — workspace untuk peneliti Indonesia." },
  { year: "2025", milestone: "Beta tertutup di 3 universitas — feedback dari 40+ peneliti." },
  { year: "2024", milestone: "Prototype AI Reader — validasi konsep dengan tesis S2." },
];

export function AboutPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <header>
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Tentang</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
          Workspace riset yang dirancang dari konteks Indonesia.
        </h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Riset Kit dibangun karena tools riset global tidak selalu cocok dengan workflow akademik Indonesia.
          Bahasa, metodologi, format sitasi — semua kami sesuaikan ulang.
        </p>
        <Button asChild className="mt-6">
          <Link href={ADMIN_BASE}>Coba workspace <ArrowRight className="size-4" /></Link>
        </Button>
      </header>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">Prinsip</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <Card key={p} className="border-border/60 bg-card/60">
              <CardContent className="flex items-start gap-3 p-4 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 text-foreground/70" />
                <span className="text-foreground/85">{p}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">Timeline</h2>
        <ol className="mt-6 space-y-3 border-l border-border/60 pl-6">
          {TIMELINE.map((t) => (
            <li key={t.year} className="relative">
              <span className="absolute -left-[29px] top-1.5 grid size-3 place-items-center rounded-full border border-border bg-background">
                <span className="size-1 rounded-full bg-foreground" />
              </span>
              <p className="text-xs font-mono text-muted-foreground">{t.year}</p>
              <p className="text-sm text-foreground/85">{t.milestone}</p>
            </li>
          ))}
        </ol>
      </section>
    </section>
  );
}
