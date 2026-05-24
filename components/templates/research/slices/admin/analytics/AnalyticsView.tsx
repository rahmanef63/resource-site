"use client";

import * as React from "react";
import { Activity, FileText, Quote, StickyNote, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "../../../shared/store";

export function AnalyticsView() {
  const { state } = useStore();

  const docs30d = state.documents.filter((d) => d.uploadedAt > Date.now() - 30 * 24 * 60 * 60 * 1000).length;
  const citations30d = state.citations.filter((c) => c.addedAt > Date.now() - 30 * 24 * 60 * 60 * 1000).length;
  const notes30d = state.notes.length;
  const litReviewPct = Math.min(
    100,
    Math.round(
      (state.litReviews.reduce((s, lr) => s + lr.matrix.length, 0) /
        Math.max(state.documents.length, 1)) *
        100,
    ),
  );

  // 7x6 heatmap (last 6 weeks). Deterministic faux activity so SSR ≈ CSR.
  const heatmap = React.useMemo(() => {
    const cells: { day: number; intensity: number }[] = [];
    for (let i = 0; i < 42; i++) {
      const seed = (i * 31 + 7) % 11;
      cells.push({ day: i, intensity: seed === 0 ? 0 : Math.min(4, Math.floor(seed / 2)) });
    }
    return cells;
  }, []);

  const TOP_TAGS = React.useMemo(() => {
    const tally = new Map<string, number>();
    for (const n of state.notes) for (const t of n.tags) tally.set(t, (tally.get(t) ?? 0) + 1);
    for (const d of state.documents) tally.set(d.tag, (tally.get(d.tag) ?? 0) + 1);
    return Array.from(tally.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [state.notes, state.documents]);

  const intensityClass = (n: number) => {
    if (n === 0) return "bg-muted/30";
    if (n === 1) return "bg-emerald-500/20";
    if (n === 2) return "bg-emerald-500/45";
    if (n === 3) return "bg-emerald-500/65";
    return "bg-emerald-500/85";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Aktivitas riset 30 hari terakhir. Privacy-friendly — semua data lokal di workspace.
          </p>
        </div>
        <Badge variant="outline" className="rounded-full">Last 30d</Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
              <Quote className="size-3" /> Citations harvested
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{citations30d}</p>
            <p className="mt-1 text-[11px] text-emerald-300">+{Math.max(1, Math.floor(citations30d * 0.4))} dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
              <FileText className="size-3" /> Documents read
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{docs30d}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{state.documents.length} total di library</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
              <StickyNote className="size-3" /> Notes written
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{notes30d}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">avg 1.2 / hari</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
              <Activity className="size-3" /> Lit-review coverage
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{litReviewPct}%</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{state.litReviews.length} review aktif</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Activity heatmap (6 minggu)
              </p>
              <TrendingUp className="size-3.5 text-emerald-400" />
            </div>
            <div className="grid grid-cols-7 gap-1">
              {heatmap.map((c) => (
                <div
                  key={c.day}
                  className={"aspect-square rounded-sm " + intensityClass(c.intensity)}
                  title={`Day ${c.day + 1} — intensity ${c.intensity}`}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((n) => (
                <span key={n} className={"size-3 rounded-sm " + intensityClass(n)} />
              ))}
              <span>More</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5">
            <p className="mb-3 text-[11px] uppercase tracking-wider text-muted-foreground">Top tags</p>
            <ul className="space-y-2 text-sm">
              {TOP_TAGS.map((r, i) => (
                <li key={r.tag} className="flex items-center gap-3">
                  <span className="grid size-5 place-items-center rounded-full bg-muted text-[10px]">{i + 1}</span>
                  <span className="flex-1 truncate">{r.tag}</span>
                  <span className="font-mono text-xs text-muted-foreground">{r.count}</span>
                </li>
              ))}
              {TOP_TAGS.length === 0 && (
                <li className="text-xs text-muted-foreground">Belum ada tag. Tambahkan note dulu.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
