"use client";

import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

export function InsightsDetailPage({ slug }: { slug: string }) {
  const insight = SEED_INSIGHTS.find((i) => i.slug === slug);
  if (!insight) notFound();

  const related = React.useMemo(() => {
    return SEED_INSIGHTS.filter(
      (i) => i.slug !== slug && (i.category === insight.category || i.tags.some((t) => insight.tags.includes(t))),
    )
      .sort((a, b) => b.publishedAt - a.publishedAt)
      .slice(0, 3);
  }, [slug, insight]);

  const paragraphs = insight.body.split("\n\n");

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href={`${PUBLIC_BASE}/insights`}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Kembali ke insights
      </Link>

      <header className="mt-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          <Lightbulb className="size-3" />
          <Badge variant="outline" className="rounded-full text-[10px]">
            {CATEGORY_LABEL[insight.category]}
          </Badge>
          <span>·</span>
          <span className="normal-case tracking-normal">{fmtDate(insight.publishedAt)}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1 normal-case tracking-normal">
            <Clock className="size-3" /> {insight.readMinutes} mnt baca
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{insight.title}</h1>
        <p className="text-sm text-muted-foreground">oleh {insight.author}</p>
        <div className="flex flex-wrap gap-1.5">
          {insight.tags.map((t) => (
            <Badge key={t} variant="outline" className="rounded-full text-[10px]">
              {t}
            </Badge>
          ))}
        </div>
      </header>

      <section className="mt-10 space-y-4 text-[15px] leading-relaxed text-foreground/85">
        <p className="border-l-2 border-border/60 pl-4 italic text-foreground/75">{insight.excerpt}</p>
        {paragraphs.map((para, idx) => (
          <p key={idx}>{para}</p>
        ))}
      </section>

      {related.length > 0 && (
        <section className="mt-14 border-t border-border/60 pt-8">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Insight terkait</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {related.map((r) => (
              <Card key={r.id} className="border-border/60 bg-card/60">
                <CardContent className="space-y-1.5 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {CATEGORY_LABEL[r.category]} · {r.readMinutes} mnt
                  </p>
                  <Link
                    href={`${PUBLIC_BASE}/insights/${r.slug}`}
                    className="block text-sm font-medium leading-snug hover:underline"
                  >
                    {r.title}
                  </Link>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{r.excerpt}</p>
                  <Link
                    href={`${PUBLIC_BASE}/insights/${r.slug}`}
                    className="mt-1 inline-flex items-center gap-1 text-[11px] text-foreground/80 hover:text-foreground"
                  >
                    Baca <ArrowUpRight className="size-3" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
