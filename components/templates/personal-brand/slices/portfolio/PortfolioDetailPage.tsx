"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, CalendarCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fmtDate, usePortfolio, usePortfolioItem } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";

export function PortfolioDetailPage({ slug }: { slug: string }) {
  const item = usePortfolioItem(slug);
  const all = usePortfolio();

  if (!item) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="text-sm text-muted-foreground">Case study tidak ditemukan.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`${PUBLIC_BASE}/portfolio`}><ArrowLeft className="size-4" /> Kembali</Link>
        </Button>
      </section>
    );
  }

  const related = all.filter((p) => p.id !== item.id && p.category === item.category).slice(0, 3);

  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6 gap-1">
        <Link href={`${PUBLIC_BASE}/portfolio`}>
          <ArrowLeft className="size-3.5" /> All case studies
        </Link>
      </Button>

      <header>
        <div className="mb-3 flex items-center gap-2">
          <Badge variant="outline" className="rounded-full text-[10px]">{item.category}</Badge>
          <span className="text-xs text-muted-foreground">
            <CalendarCheck className="mr-1 inline size-3" /> {fmtDate(item.publishedAt)}
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{item.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{item.blurb}</p>
      </header>

      <div className="relative my-10 aspect-[16/9] overflow-hidden rounded-xl border border-border/60">
        <Image src={item.cover} alt="" fill priority sizes="(min-width: 768px) 1024px, 100vw" className="object-cover" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <CaseSection label="Problem" body={item.problem} />
        <CaseSection label="Approach" body={item.approach} />
        <CaseSection label="Result" body={item.result} />
      </div>

      <Card className="mt-12 border-border/60 bg-gradient-to-br from-card/80 to-muted/20">
        <CardContent className="flex flex-col gap-4 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">Mau hasil serupa?</h3>
            <p className="text-sm text-muted-foreground">Mulai dari office hours 30 menit, gratis untuk first-timer.</p>
          </div>
          <Button asChild>
            <Link href={`${PUBLIC_BASE}/services`}>Lihat layanan <ArrowUpRight className="size-4" /></Link>
          </Button>
        </CardContent>
      </Card>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold tracking-tight">More in {item.category}</h2>
          <ul className="mt-3 space-y-2">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  href={`${PUBLIC_BASE}/portfolio/${r.slug}`}
                  className="flex items-center justify-between rounded-md border border-border/60 p-3 hover:bg-accent"
                >
                  <span className="text-sm">{r.title}</span>
                  <ArrowUpRight className="size-3.5 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function CaseSection({ label, body }: { label: string; body: string }) {
  return (
    <Card className="border-border/60 bg-card/60">
      <CardContent className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/85">{body}</p>
      </CardContent>
    </Card>
  );
}
