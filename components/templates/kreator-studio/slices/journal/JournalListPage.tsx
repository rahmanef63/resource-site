"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PUBLIC_BASE } from "../../shared/nav-config";
import { fmtDate, useJournal } from "../../shared/store";
import type { JournalEntry } from "../../shared/types";

type Cat = "all" | JournalEntry["category"];

const CAT_LABEL: Record<Cat, string> = {
  all: "Semua",
  "behind-the-scenes": "BTS",
  lesson: "Lesson",
  experiment: "Eksperimen",
  essay: "Essay",
};

/**
 * Journal feed — long-form & BTS, distinct from /posts (newsletter
 * archive). Featured entry (latest) takes hero-card slot; rest in grid.
 */
export function JournalListPage() {
  const entries = useJournal();
  const [cat, setCat] = React.useState<Cat>("all");
  const filtered = cat === "all" ? entries : entries.filter((e) => e.category === cat);
  const [featured, ...rest] = filtered;
  const cats: Cat[] = ["all", "behind-the-scenes", "lesson", "experiment", "essay"];

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <header>
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Journal</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
          Catatan, lesson, dan behind-the-scenes.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Lebih panjang dari newsletter, lebih honest dari LinkedIn. Tempat untuk
          long-form thinking yang masih in-progress.
        </p>
      </header>

      <div className="mt-10 mb-8 flex flex-wrap items-center gap-2">
        <Filter className="size-3.5 text-muted-foreground" />
        {cats.map((c) => (
          <Button
            key={c}
            variant={cat === c ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setCat(c)}
          >
            {CAT_LABEL[c]}
          </Button>
        ))}
      </div>

      {featured && <FeaturedCard entry={featured} />}

      {rest.length > 0 && (
        <>
          <Separator className="my-12 opacity-60" />
          <div className="grid gap-5 md:grid-cols-2">
            {rest.map((e) => (
              <JournalCard key={e.id} entry={e} />
            ))}
          </div>
        </>
      )}

      {filtered.length === 0 && (
        <Card className="border-dashed bg-muted/10 p-10 text-center text-sm text-muted-foreground">
          Belum ada entry di kategori ini.
        </Card>
      )}
    </section>
  );
}

function FeaturedCard({ entry }: { entry: JournalEntry }) {
  return (
    <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-muted/40">
      <CardContent className="grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-end">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="rounded-full text-[10px]">Latest</Badge>
            <Badge variant="outline" className="rounded-full text-[10px] capitalize">
              {entry.category.replace("-", " ")}
            </Badge>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{entry.title}</h2>
          <p className="max-w-2xl text-muted-foreground">{entry.excerpt}</p>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>{fmtDate(entry.publishedAt)}</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" /> {entry.readMinutes} min baca
            </span>
          </div>
        </div>
        <Button asChild>
          <Link href={`${PUBLIC_BASE}/journal/${entry.slug}`}>
            Baca <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function JournalCard({ entry }: { entry: JournalEntry }) {
  return (
    <Link href={`${PUBLIC_BASE}/journal/${entry.slug}`} className="group block">
      <Card className="h-full border-border/60 bg-card/60 transition group-hover:border-foreground/30">
        <CardContent className="space-y-2 p-6">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="rounded-full text-[10px] capitalize">
              {entry.category.replace("-", " ")}
            </Badge>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="size-3" /> {entry.readMinutes} min
            </span>
          </div>
          <h3 className="text-lg font-medium leading-snug transition group-hover:text-foreground">
            {entry.title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{entry.excerpt}</p>
          <p className="pt-1 text-[11px] text-muted-foreground">{fmtDate(entry.publishedAt)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
