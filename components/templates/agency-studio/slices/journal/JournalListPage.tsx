"use client";

import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { SEED_ARTICLES } from "../../shared/journal-seed";
import { PUBLIC_BASE } from "../../shared/nav-config";

const CATEGORY_LABEL: Record<string, string> = {
  "case-study": "Case study",
  essay: "Essay",
  "field-notes": "Field notes",
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Journal list — studio writing + case-study index. Featured articles
 * surface in a 2-col hero grid; the remainder fall into a uniform list.
 */
export function JournalListPage() {
  const sorted = [...SEED_ARTICLES].sort((a, b) => b.publishedAt - a.publishedAt);
  const featured = sorted.filter((a) => a.featured);
  const rest = sorted.filter((a) => !a.featured);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionHead
        eyebrow="Journal"
        title="Tulisan studio + case-study"
        subtitle="Catatan dari proyek, eksperimen design system, dan format workshop yang kami pakai."
      />

      {featured.length > 0 && (
        <section className="grid gap-5 md:grid-cols-2">
          {featured.map((a) => (
            <Link
              key={a.id}
              href={`${PUBLIC_BASE}/journal/${a.slug}`}
              className="group block focus-visible:outline-none"
            >
              <Card className="h-full overflow-hidden border-border/60 transition-colors group-hover:border-foreground/40 group-focus-visible:ring-2 group-focus-visible:ring-ring">
                <div
                  className="aspect-[16/9] w-full bg-gradient-to-br from-muted via-muted/50 to-muted/30"
                  style={a.cover ? { backgroundImage: `url(${a.cover})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                  aria-hidden
                />
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="font-normal">{CATEGORY_LABEL[a.category]}</Badge>
                    <span>·</span>
                    <span>{formatDate(a.publishedAt)}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1"><Clock className="size-3" />{a.readMinutes} min</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight">{a.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{a.excerpt}</p>
                  <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium">
                    Baca <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      )}

      {rest.length > 0 && (
        <ul className="mt-10 divide-y divide-border border-y border-border">
          {rest.map((a) => (
            <li key={a.id}>
              <Link
                href={`${PUBLIC_BASE}/journal/${a.slug}`}
                className="group flex flex-wrap items-baseline gap-x-6 gap-y-2 py-5 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
              >
                <span className="w-24 shrink-0 text-xs uppercase tracking-wider text-muted-foreground">
                  {CATEGORY_LABEL[a.category]}
                </span>
                <span className="flex-1 text-base font-medium">{a.title}</span>
                <span className="text-xs text-muted-foreground">{a.author}</span>
                <span className="text-xs text-muted-foreground">{formatDate(a.publishedAt)}</span>
                <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
