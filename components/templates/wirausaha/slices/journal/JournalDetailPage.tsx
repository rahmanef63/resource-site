"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fmtDate, useJournal } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";

/** Detail page for a single journal entry, looked up by slug. */
export function JournalDetailPage({ slug }: { slug: string }) {
  const entries = useJournal();
  const entry = entries.find((e) => e.slug === slug);
  if (!entry) notFound();

  const related = entries
    .filter((e) => e.category === entry.category && e.id !== entry.id)
    .sort((a, b) => b.publishedAt - a.publishedAt)
    .slice(0, 3);

  const paragraphs = entry.body.split(/\n\n+/);

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href={`${PUBLIC_BASE}/journal`}>
          <ArrowLeft className="size-4" /> Kembali ke jurnal
        </Link>
      </Button>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge>{entry.category}</Badge>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="size-3" /> {fmtDate(entry.publishedAt)}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <User className="size-3" /> {entry.author}
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
          {entry.title}
        </h1>
        <p className="text-lg text-muted-foreground">{entry.excerpt}</p>
      </header>

      <div
        className={`my-8 flex aspect-[16/9] items-center justify-center rounded-2xl bg-gradient-to-br ${entry.gradient}`}
      >
        <span className="text-8xl drop-shadow-lg" aria-hidden>
          {entry.emoji}
        </span>
      </div>

      <div className="space-y-5 text-base leading-relaxed text-foreground/90">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <Separator className="my-12" />

      <Card className="border-border/60 bg-card/50">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p className="text-sm font-medium">Tertarik dengan promo ini?</p>
            <p className="text-xs text-muted-foreground">
              Hubungi tim kami atau datang langsung ke outlet terdekat.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link href={`${PUBLIC_BASE}/contact`}>Kontak</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`${PUBLIC_BASE}/stores`}>Cari outlet</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {related.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">
              Lainnya di {entry.category}
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href={`${PUBLIC_BASE}/journal`}>
                Semua tulisan <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`${PUBLIC_BASE}/journal/${r.slug}`}
                className="group block"
              >
                <Card className="h-full overflow-hidden border-border/60 bg-card/50 transition hover:border-foreground/30">
                  <div className={`flex aspect-[5/3] items-center justify-center bg-gradient-to-br ${r.gradient}`}>
                    <span className="text-4xl" aria-hidden>{r.emoji}</span>
                  </div>
                  <CardContent className="space-y-1 p-4">
                    <p className="text-xs text-muted-foreground">{fmtDate(r.publishedAt)}</p>
                    <p className="font-medium leading-snug group-hover:underline">
                      {r.title}
                    </p>
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
