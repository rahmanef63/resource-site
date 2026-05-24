"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, FileText, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ADMIN_BASE } from "../../../shared/nav-config";
import { useStore } from "../../../shared/store";
import type { KbArticle, KbCategory } from "../../../shared/types";

const CATEGORIES: KbCategory[] = [
  "Strategi",
  "Operasi",
  "Organisasi",
  "M&A",
  "Workshop",
  "Template",
];

const CATEGORY_ACCENT: Record<KbCategory, string> = {
  Strategi: "border-violet-500/40 text-violet-200",
  Operasi: "border-amber-500/40 text-amber-200",
  Organisasi: "border-emerald-500/40 text-emerald-200",
  "M&A": "border-rose-500/40 text-rose-200",
  Workshop: "border-sky-500/40 text-sky-200",
  Template: "border-zinc-500/40 text-zinc-200",
};

function relDays(ts: number): string {
  const days = Math.round((Date.now() - ts) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "hari ini";
  if (days === 1) return "kemarin";
  if (days < 30) return `${days} hari lalu`;
  return `${Math.round(days / 30)} bulan lalu`;
}

export function KbListView() {
  const { state, dispatch } = useStore();
  const [activeCat, setActiveCat] = React.useState<"all" | KbCategory>("all");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    let list = state.kbArticles;
    if (activeCat !== "all") list = list.filter((a) => a.category === activeCat);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q),
      );
    }
    return list;
  }, [state.kbArticles, activeCat, query]);

  function createBlank() {
    const id = `kb-${Math.random().toString(36).slice(2, 10)}`;
    const article: KbArticle = {
      id,
      slug: `playbook-${id.slice(3)}`,
      title: "Playbook baru",
      category: "Strategi",
      summary: "Ringkasan singkat.",
      body: "Paragraf pertama.",
      author: "Lorem Konsultan",
      updatedAt: Date.now(),
      status: "draft",
    };
    dispatch({ type: "kb.upsert", article });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground">
            Playbook internal — metodologi, checklist, template. Sumber pengetahuan
            tim konsultan.
          </p>
        </div>
        <Button size="sm" onClick={createBlank}>
          <Plus className="mr-2 size-4" />
          Playbook baru
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Tabs
          value={activeCat}
          onValueChange={(v) => setActiveCat(v as "all" | KbCategory)}
          className="w-full md:w-auto"
        >
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="all" className="text-xs">
              Semua
            </TabsTrigger>
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="text-xs">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative md:ml-auto md:w-72">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari judul / penulis"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 pl-8 text-sm"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-card/40">
          <CardContent className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground">
            <BookOpen className="size-6 opacity-50" />
            <p>Belum ada playbook di kategori ini.</p>
            <Button size="sm" variant="outline" onClick={createBlank}>
              Mulai tulis
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((article) => (
            <Card key={article.id} className="border-border/60 bg-card/60 transition hover:border-border">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`rounded-full text-[10px] ${CATEGORY_ACCENT[article.category]}`}>
                    {article.category}
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                    {article.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-semibold leading-snug">{article.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {article.summary}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-border/30 pt-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="size-3" />
                    {article.author}
                  </span>
                  <span>{relDays(article.updatedAt)}</span>
                </div>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href={`${ADMIN_BASE}/knowledge-base/${article.id}`}>Buka editor</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
