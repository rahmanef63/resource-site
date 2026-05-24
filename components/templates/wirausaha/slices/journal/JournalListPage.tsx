"use client";

import * as React from "react";
import Link from "next/link";
import { Calendar, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { fmtDate, useJournal } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";
import type { JournalEntry } from "../../shared/types";

/**
 * Public promo/news listing. Category-chip filter, sorted by date desc.
 * Cards link to detail route. Data sourced from `state.journal`; admin
 * CRUD can later wire via createTemplateStore actions.
 */
export function JournalListPage() {
  const entries = useJournal();
  const [active, setActive] = React.useState<string>("Semua");

  const categories = React.useMemo(() => {
    const set = new Set<string>(["Semua"]);
    entries.forEach((e) => set.add(e.category));
    return Array.from(set);
  }, [entries]);

  const filtered = React.useMemo(() => {
    const base = active === "Semua" ? entries : entries.filter((e) => e.category === active);
    return [...base].sort((a, b) => b.publishedAt - a.publishedAt);
  }, [entries, active]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <SectionHead
        eyebrow="Jurnal"
        title="Promo, kabar baru, dan catatan dari dapur"
        subtitle="Pembaruan rutin tentang menu baru, outlet baru, voucher, dan pembelajaran kami sebagai operator multi-unit."
      />

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Filter className="size-3.5 text-muted-foreground" />
        {categories.map((c) => (
          <Button
            key={c}
            variant={active === c ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setActive(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      {!featured ? (
        <Card className="mt-10 border-dashed bg-muted/10 p-10 text-center text-sm text-muted-foreground">
          Belum ada tulisan di kategori ini.
        </Card>
      ) : (
        <>
          <FeaturedCard entry={featured} className="mt-8" />
          {rest.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((e) => (
                <JournalCard key={e.id} entry={e} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function FeaturedCard({ entry, className }: { entry: JournalEntry; className?: string }) {
  return (
    <Link href={`${PUBLIC_BASE}/journal/${entry.slug}`} className={`group block ${className ?? ""}`}>
      <Card className="overflow-hidden border-border/60 bg-card/50 transition hover:border-foreground/30">
        <div className="grid md:grid-cols-[1.1fr_1fr]">
          <div className={`flex aspect-[16/10] items-center justify-center bg-gradient-to-br ${entry.gradient} md:aspect-auto`}>
            <span className="text-7xl drop-shadow-lg" aria-hidden>{entry.emoji}</span>
          </div>
          <div className="flex flex-col justify-center gap-3 p-6 md:p-8">
            <div className="flex items-center gap-2 text-xs">
              <Badge>{entry.category}</Badge>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="size-3" /> {fmtDate(entry.publishedAt)}
              </span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight group-hover:underline md:text-3xl">
              {entry.title}
            </h2>
            <p className="text-muted-foreground">{entry.excerpt}</p>
            <p className="text-xs text-muted-foreground">Oleh {entry.author}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function JournalCard({ entry }: { entry: JournalEntry }) {
  return (
    <Link href={`${PUBLIC_BASE}/journal/${entry.slug}`} className="group block">
      <Card className="h-full overflow-hidden border-border/60 bg-card/50 transition hover:border-foreground/30">
        <div className={`flex aspect-[5/3] items-center justify-center bg-gradient-to-br ${entry.gradient}`}>
          <span className="text-5xl drop-shadow-md" aria-hidden>{entry.emoji}</span>
        </div>
        <CardContent className="space-y-2 p-5">
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline">{entry.category}</Badge>
            <span className="text-muted-foreground">{fmtDate(entry.publishedAt)}</span>
          </div>
          <h3 className="font-medium leading-snug group-hover:underline">{entry.title}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{entry.excerpt}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
