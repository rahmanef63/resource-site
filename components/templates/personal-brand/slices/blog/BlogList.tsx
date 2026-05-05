"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Calendar, Clock, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fmtDate, usePublishedPosts } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/ui/site-nav";

export function BlogList() {
  const posts = usePublishedPosts();
  const [q, setQ] = React.useState("");
  const [tag, setTag] = React.useState<string | null>(null);

  const tags = React.useMemo(() => Array.from(new Set(posts.map((p) => p.tag))), [posts]);

  const filtered = React.useMemo(() => {
    return posts.filter((p) => {
      if (tag && p.tag !== tag) return false;
      if (q && !(p.title + " " + p.excerpt).toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [posts, tag, q]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Blog</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">Tulisan</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Esai panjang dan catatan singkat. Cari berdasarkan judul atau filter berdasarkan kategori.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari tulisan…"
            className="pl-3"
          />
        </div>
        <Filter className="size-3.5 text-muted-foreground" />
        <Button
          variant={!tag ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => setTag(null)}
        >
          All
        </Button>
        {tags.map((t) => (
          <Button
            key={t}
            variant={tag === t ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setTag(t)}
          >
            {t}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed bg-muted/10 p-10 text-center text-sm text-muted-foreground">
          Tidak ada post yang cocok. Reset filter atau buat post baru di Admin.
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`${PUBLIC_BASE}/blog/${p.slug}`}
              className="group overflow-hidden rounded-xl border border-border/60 bg-card/50 transition hover:border-border"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={p.cover}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <Badge variant="outline" className="rounded-full text-[10px]">{p.tag}</Badge>
                  <span className="inline-flex items-center gap-1"><Calendar className="size-3" /> {fmtDate(p.publishedAt)}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {p.readMin} min</span>
                </div>
                <h3 className="text-base font-medium leading-snug">{p.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-foreground/80 group-hover:text-foreground">
                  Read post <ArrowUpRight className="size-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
