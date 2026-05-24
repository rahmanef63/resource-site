"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PUBLIC_BASE } from "../../shared/nav-config";
import { fmtDate, useJournal } from "../../shared/store";
import type { JournalEntry } from "../../shared/types";

/**
 * Journal detail — slug-based lookup, prev/next nav. Body is plain text
 * split by paragraph; no editor wire-up needed for seed data.
 */
export function JournalDetailPage({ slug }: { slug: string }) {
  const entries = useJournal();
  const idx = entries.findIndex((e) => e.slug === slug);
  const entry = idx >= 0 ? entries[idx] : null;
  const prev = idx > 0 ? entries[idx - 1] : null;
  const next = idx >= 0 && idx < entries.length - 1 ? entries[idx + 1] : null;

  if (!entry) return <NotFound slug={slug} />;

  const paragraphs = entry.body.split(/\n\n+/).filter(Boolean);

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link href={`${PUBLIC_BASE}/journal`}>
          <ArrowLeft className="size-4" /> Semua journal
        </Link>
      </Button>

      <header className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full text-[10px] capitalize">
            {entry.category.replace("-", " ")}
          </Badge>
          <span className="text-[11px] text-muted-foreground">{fmtDate(entry.publishedAt)}</span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="size-3" /> {entry.readMinutes} min baca
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{entry.title}</h1>
        <p className="text-lg text-muted-foreground">{entry.excerpt}</p>
      </header>

      <Separator className="my-10 opacity-60" />

      <div className="space-y-5 text-base leading-relaxed text-foreground/90">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <Separator className="my-12 opacity-60" />

      <PrevNext prev={prev} next={next} />
    </article>
  );
}

function PrevNext({ prev, next }: { prev: JournalEntry | null; next: JournalEntry | null }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {prev ? (
        <Link href={`${PUBLIC_BASE}/journal/${prev.slug}`} className="group">
          <Card className="h-full border-border/60 bg-card/60 transition group-hover:border-foreground/30">
            <CardContent className="space-y-1 p-4">
              <p className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                <ArrowLeft className="size-3" /> Sebelumnya
              </p>
              <p className="line-clamp-2 text-sm font-medium">{prev.title}</p>
            </CardContent>
          </Card>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link href={`${PUBLIC_BASE}/journal/${next.slug}`} className="group">
          <Card className="h-full border-border/60 bg-card/60 transition group-hover:border-foreground/30">
            <CardContent className="space-y-1 p-4 md:text-right">
              <p className="flex items-center justify-end gap-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                Berikutnya <ArrowRight className="size-3" />
              </p>
              <p className="line-clamp-2 text-sm font-medium">{next.title}</p>
            </CardContent>
          </Card>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}

function NotFound({ slug }: { slug: string }) {
  return (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Entry tidak ditemukan</h1>
      <p className="mt-3 text-muted-foreground">
        Tidak ada journal dengan slug <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{slug}</code>.
      </p>
      <Button asChild className="mt-6">
        <Link href={`${PUBLIC_BASE}/journal`}>
          <ArrowLeft className="size-4" /> Kembali ke journal
        </Link>
      </Button>
    </section>
  );
}
