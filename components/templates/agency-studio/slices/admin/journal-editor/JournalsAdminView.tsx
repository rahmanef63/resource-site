"use client";

import * as React from "react";
import Link from "next/link";
import { Filter, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { rel, useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { ArticleStatus } from "../../../shared/types";

type Filter = "all" | ArticleStatus;

export function JournalsAdminView() {
  const { state, dispatch } = useStore();
  const [filter, setFilter] = React.useState<Filter>("all");
  const [q, setQ] = React.useState("");

  const counts = React.useMemo(() => ({
    all: state.articles.length,
    draft: state.articles.filter((a) => a.status === "draft").length,
    published: state.articles.filter((a) => a.status === "published").length,
  }), [state.articles]);

  const filtered = React.useMemo(() => {
    return state.articles
      .filter((a) => filter === "all" || a.status === filter)
      .filter((a) => !q || `${a.title} ${a.author} ${(a.tags ?? []).join(" ")}`.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.publishedAt - a.publishedAt);
  }, [state.articles, filter, q]);

  const remove = (id: string, title: string) => {
    if (!confirm(`Hapus artikel "${title}"?`)) return;
    dispatch({ type: "article.delete", id });
    toast.success("Article dihapus");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Journal articles</h1>
          <p className="text-sm text-muted-foreground">
            {counts.all} total · {counts.draft} draft · {counts.published} published
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title / tag / author…"
            className="h-9 w-64"
          />
          <Button variant="outline" size="sm" className="gap-1.5">
            <Filter className="size-3.5" /> All
          </Button>
          <Button asChild size="sm" className="gap-1.5">
            <Link href={`${ADMIN_BASE}/journal-editor/new`}>
              <Plus className="size-4" /> New article
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "draft", "published"] as Filter[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="h-7 rounded-full px-3 text-[11px] uppercase tracking-wider"
          >
            {f} ({counts[f]})
          </Button>
        ))}
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">
              Belum ada artikel — mulai dengan satu draft baru.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr className="border-b border-border/60">
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Tags</th>
                    <th className="px-4 py-3 text-left">Author</th>
                    <th className="px-4 py-3 text-left">Updated</th>
                    <th className="px-4 py-3 text-right">Read</th>
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((a) => (
                    <tr key={a.id} className="hover:bg-accent/30">
                      <td className="px-4 py-3">
                        <Link href={`${ADMIN_BASE}/journal-editor/${a.id}`} className="flex items-center gap-2 font-medium hover:underline">
                          <span className="text-base">{a.heroEmoji ?? "📝"}</span>
                          {a.title}
                        </Link>
                        <p className="text-[11px] text-muted-foreground">/journal/{a.slug}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            "rounded-full text-[10px] capitalize " +
                            (a.status === "published"
                              ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15"
                              : "bg-muted text-muted-foreground")
                          }
                        >
                          {a.status ?? "draft"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(a.tags ?? []).slice(0, 3).map((t) => (
                            <Badge key={t} variant="outline" className="rounded-full text-[10px]">{t}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{a.author}</td>
                      <td className="px-4 py-3 text-muted-foreground">{rel(a.publishedAt || Date.now())}</td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground">{a.readMinutes}m</td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="ghost" onClick={() => remove(a.id, a.title)}>
                          <Trash2 className="size-3.5 text-rose-400" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
