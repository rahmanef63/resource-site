"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Clock, Filter, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { SEED_INSIGHTS } from "../../shared/insights-seed";
import { PUBLIC_BASE } from "../../shared/nav-config";
import { fmtDate } from "../../shared/store";
import type { Insight } from "../../shared/types";

const CATEGORY_LABEL: Record<Insight["category"], string> = {
  methodology: "Metodologi",
  "tool-review": "Tool Review",
  "field-notes": "Field Notes",
  opinion: "Opini",
  tutorial: "Tutorial",
};

const CATEGORY_TONE: Record<Insight["category"], string> = {
  methodology: "bg-sky-500/15 text-sky-300 hover:bg-sky-500/15",
  "tool-review": "bg-amber-500/15 text-amber-300 hover:bg-amber-500/15",
  "field-notes": "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15",
  opinion: "bg-rose-500/15 text-rose-300 hover:bg-rose-500/15",
  tutorial: "bg-violet-500/15 text-violet-300 hover:bg-violet-500/15",
};

type CatFilter = Insight["category"] | "all";

const FILTERS: { value: CatFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "methodology", label: "Metodologi" },
  { value: "tool-review", label: "Tool" },
  { value: "field-notes", label: "Field" },
  { value: "tutorial", label: "Tutorial" },
  { value: "opinion", label: "Opini" },
];

export function InsightsListPage() {
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState<CatFilter>("all");

  const filtered = React.useMemo(() => {
    const needle = q.toLowerCase().trim();
    return SEED_INSIGHTS.filter((i) => {
      if (cat !== "all" && i.category !== cat) return false;
      if (!needle) return true;
      return (
        i.title.toLowerCase().includes(needle) ||
        i.excerpt.toLowerCase().includes(needle) ||
        i.tags.some((t) => t.toLowerCase().includes(needle))
      );
    }).sort((a, b) => b.publishedAt - a.publishedAt);
  }, [q, cat]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <SectionHead
        eyebrow="Insights"
        title="Catatan singkat dari lapangan"
        subtitle="Esai metodologi, review tool, dan field notes. Lebih ringan dari publikasi formal — lebih cepat sampai ke pembaca."
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[240px] flex-1">
          <Filter className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari tema, tools, atau tag..."
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
        <Badge variant="outline" className="rounded-full">
          {filtered.length}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">Tidak ada insight yang cocok dengan filter.</p>
        )}
        {filtered.map((i) => (
          <Card key={i.id} className="border-border/60 bg-card/60">
            <CardContent className="space-y-2 p-5">
              <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Lightbulb className="size-3" />
                <Badge className={"rounded-full text-[10px] " + CATEGORY_TONE[i.category]}>
                  {CATEGORY_LABEL[i.category]}
                </Badge>
                <span>·</span>
                <span className="normal-case tracking-normal">{fmtDate(i.publishedAt)}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1 normal-case tracking-normal">
                  <Clock className="size-3" /> {i.readMinutes} mnt
                </span>
              </div>
              <Link
                href={`${PUBLIC_BASE}/insights/${i.slug}`}
                className="block text-base font-medium leading-snug hover:underline"
              >
                {i.title}
              </Link>
              <p className="text-xs text-muted-foreground">{i.author}</p>
              <p className="line-clamp-3 text-sm text-foreground/75">{i.excerpt}</p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex flex-wrap gap-1">
                  {i.tags.slice(0, 3).map((t) => (
                    <Badge key={t} variant="outline" className="rounded-full text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
                <Link
                  href={`${PUBLIC_BASE}/insights/${i.slug}`}
                  className="inline-flex items-center gap-1 text-[11px] text-foreground/80 hover:text-foreground"
                >
                  Baca <ArrowUpRight className="size-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
