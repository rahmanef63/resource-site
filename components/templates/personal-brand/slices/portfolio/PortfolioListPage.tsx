"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePortfolio } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/ui/site-nav";

export function PortfolioListPage() {
  const items = usePortfolio();
  const [cat, setCat] = React.useState<string | null>(null);

  const cats = React.useMemo(() => Array.from(new Set(items.map((i) => i.category))), [items]);
  const filtered = cat ? items.filter((i) => i.category === cat) : items;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Portfolio</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">Karya terpilih</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Case study dengan struktur problem→approach→result. Pilih kategori untuk filter.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <Filter className="size-3.5 text-muted-foreground" />
        <Button
          variant={!cat ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => setCat(null)}
        >
          All
        </Button>
        {cats.map((c) => (
          <Button
            key={c}
            variant={cat === c ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setCat(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed bg-muted/10 p-10 text-center text-sm text-muted-foreground">
          Belum ada case study di kategori ini.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`${PUBLIC_BASE}/portfolio/${p.slug}`}
              className="group relative block aspect-[16/10] overflow-hidden rounded-xl border border-border/60"
            >
              <Image
                src={p.cover}
                alt=""
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{p.category}</p>
                <h3 className="mt-1 text-xl font-medium">{p.title}</h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">{p.blurb}</p>
              </div>
              <ArrowUpRight className="absolute right-4 top-4 size-5 text-foreground/70 transition group-hover:text-foreground" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
