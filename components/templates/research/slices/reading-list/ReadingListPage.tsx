"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, BookMarked, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { fmtDate } from "../../shared/store";
import { SEED_READING_LIST } from "../../shared/reading-seed";
import type { PublicReadingItem } from "../../shared/types";

const CAT_LABEL: Record<PublicReadingItem["category"], string> = {
  paper: "Paper",
  essay: "Essay",
  book: "Book",
  thread: "Thread",
  report: "Report",
};

const CAT_TONE: Record<PublicReadingItem["category"], string> = {
  paper: "bg-sky-500/15 text-sky-300 hover:bg-sky-500/15",
  essay: "bg-amber-500/15 text-amber-300 hover:bg-amber-500/15",
  book: "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15",
  thread: "bg-rose-500/15 text-rose-300 hover:bg-rose-500/15",
  report: "bg-violet-500/15 text-violet-300 hover:bg-violet-500/15",
};

type CatFilter = PublicReadingItem["category"] | "all";

const FILTERS: { value: CatFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "paper", label: "Paper" },
  { value: "essay", label: "Essay" },
  { value: "book", label: "Book" },
  { value: "report", label: "Report" },
  { value: "thread", label: "Thread" },
];

export function ReadingListPage() {
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState<CatFilter>("all");

  const filtered = React.useMemo(() => {
    const needle = q.toLowerCase().trim();
    return SEED_READING_LIST.filter((r) => {
      if (cat !== "all" && r.category !== cat) return false;
      if (!needle) return true;
      return (
        r.title.toLowerCase().includes(needle) ||
        r.source.toLowerCase().includes(needle) ||
        r.why.toLowerCase().includes(needle)
      );
    }).sort((a, b) => b.addedAt - a.addedAt);
  }, [q, cat]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <SectionHead
        eyebrow="Reading list"
        title="Bacaan terpilih untuk peneliti"
        subtitle="Paper, esai, dan buku yang membentuk arah workspace ini. Diperbarui ketika kami menemukan sesuatu yang layak dibaca."
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Filter className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari judul, sumber, atau alasan..."
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              type="button"
              variant={cat === f.value ? "secondary" : "outline"}
              size="sm"
              onClick={() => setCat(f.value)}
              className="h-7 rounded-full px-3 text-[11px] uppercase tracking-wider"
            >
              {f.label}
            </Button>
          ))}
        </div>
        <Badge variant="outline" className="rounded-full">{filtered.length}</Badge>
      </div>

      <ol className="grid gap-3">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">Belum ada bacaan yang cocok.</p>
        )}
        {filtered.map((r, idx) => (
          <li key={r.id}>
            <Card className="border-border/60 bg-card/60">
              <CardContent className="flex gap-4 p-5">
                <div className="flex shrink-0 items-start pt-0.5 text-xs font-mono text-muted-foreground">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <BookMarked className="size-3" />
                    <Badge className={"rounded-full text-[10px] " + CAT_TONE[r.category]}>
                      {CAT_LABEL[r.category]}
                    </Badge>
                    <span>·</span>
                    <span>{r.year}</span>
                    <span>·</span>
                    <span className="normal-case tracking-normal">Ditambah {fmtDate(r.addedAt)}</span>
                  </div>
                  <Link
                    href={r.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-start gap-1.5 text-base font-medium leading-snug hover:underline"
                  >
                    <span>{r.title}</span>
                    <ArrowUpRight className="mt-1 size-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
                  </Link>
                  <p className="text-xs text-muted-foreground">{r.source}</p>
                  <p className="text-sm leading-relaxed text-foreground/80">
                    <span className="text-foreground/60">Kenapa: </span>
                    {r.why}
                  </p>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
    </section>
  );
}
