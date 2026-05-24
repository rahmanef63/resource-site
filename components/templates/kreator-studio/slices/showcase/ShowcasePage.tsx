"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PUBLIC_BASE } from "../../shared/nav-config";
import { useShowcase } from "../../shared/store";
import { fmtDate } from "../../shared/store";
import type { ShowcaseItem } from "../../shared/types";
import { ShowcaseStats } from "./ShowcaseStats";

type Kind = "all" | ShowcaseItem["kind"];

const KIND_LABEL: Record<Kind, string> = {
  all: "Semua",
  carousel: "Carousel",
  video: "Video",
  campaign: "Campaign",
  newsletter: "Newsletter",
};

/**
 * Visual gallery of past work. Asymmetric grid using gradient placeholders
 * (no img — per template constraints). Filter chips by kind.
 */
export function ShowcasePage() {
  const items = useShowcase();
  const [kind, setKind] = React.useState<Kind>("all");
  const filtered = kind === "all" ? items : items.filter((i) => i.kind === kind);
  const kinds: Kind[] = ["all", "carousel", "video", "campaign", "newsletter"];

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <header>
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Showcase</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
          Highlight karya terpilih.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Campaign, carousel, dan video yang resonate sama audience. Mix antara work
          klien dan editorial sendiri.
        </p>
      </header>

      <ShowcaseStats items={items} />

      <div className="mt-12 mb-8 flex flex-wrap items-center gap-2">
        <Filter className="size-3.5 text-muted-foreground" />
        {kinds.map((k) => (
          <Button
            key={k}
            variant={kind === k ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setKind(k)}
          >
            {KIND_LABEL[k]}
          </Button>
        ))}
      </div>

      <div className="grid auto-rows-[minmax(220px,auto)] gap-4 md:grid-cols-3">
        {filtered.map((item, i) => (
          <ShowcaseCard key={item.id} item={item} spotlight={i % 5 === 0} />
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="mt-6 border-dashed bg-muted/10 p-10 text-center text-sm text-muted-foreground">
          Belum ada item di kategori ini.
        </Card>
      )}

      <Separator className="my-16 opacity-60" />

      <Card className="border-border/60 bg-gradient-to-br from-card via-card to-muted/40">
        <CardContent className="flex flex-col items-start gap-3 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">Mau hasil serupa untuk brand kamu?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Lihat opsi kerja sama atau langsung book brief call gratis.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`${PUBLIC_BASE}/pricing`}>Lihat pricing</Link>
            </Button>
            <Button asChild>
              <Link href={`${PUBLIC_BASE}/about`}>Brief call <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function ShowcaseCard({ item, spotlight }: { item: ShowcaseItem; spotlight?: boolean }) {
  return (
    <Card
      className={`group overflow-hidden border-border/60 bg-card/60 ${
        spotlight ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      <div
        className={`relative flex items-center justify-center bg-gradient-to-br ${item.gradient} ${
          spotlight ? "h-64 md:h-full md:min-h-[400px]" : "h-44"
        }`}
      >
        <span className={spotlight ? "text-7xl" : "text-5xl"} aria-hidden>
          {item.emoji}
        </span>
        <Badge
          variant="secondary"
          className="absolute left-3 top-3 rounded-full text-[10px] capitalize backdrop-blur"
        >
          {item.kind}
        </Badge>
      </div>
      <CardContent className="space-y-2 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{item.client}</span>
          <span className="text-[11px] text-muted-foreground">{fmtDate(item.publishedAt)}</span>
        </div>
        <h3 className="text-base font-medium leading-snug">{item.title}</h3>
        <p className="text-sm text-muted-foreground">{item.blurb}</p>
        <p className="pt-1 font-mono text-xs text-foreground/85">{item.metric}</p>
      </CardContent>
    </Card>
  );
}
