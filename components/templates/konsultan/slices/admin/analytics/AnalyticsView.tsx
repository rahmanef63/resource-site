"use client";

import * as React from "react";
import { ArrowUpRight, LineChart, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStore } from "../../../shared/store";
import type { AnalyticsKpi } from "../../../shared/types";

/** Parse "Rp 240jt" / "Rp 80jt" → number in million IDR. Best-effort. */
function parseRpJt(label: string): number {
  const m = label.match(/Rp\s*([\d.,]+)\s*jt/i);
  if (!m) return 0;
  return parseFloat(m[1].replace(/\./g, "").replace(",", ".")) || 0;
}

function fmtRp(jt: number): string {
  if (jt >= 1000) return `Rp ${(jt / 1000).toFixed(1)} M`;
  return `Rp ${Math.round(jt)} jt`;
}

export function AnalyticsView() {
  const { state } = useStore();

  const pipelineValue = state.proposals
    .filter((p) => p.status === "draft" || p.status === "sent")
    .reduce((sum, p) => sum + parseRpJt(p.valueLabel), 0);
  const wonValue = state.proposals
    .filter((p) => p.status === "accepted")
    .reduce((sum, p) => sum + parseRpJt(p.valueLabel), 0);
  const lostCount = state.proposals.filter((p) => p.status === "rejected").length;
  const wonCount = state.proposals.filter((p) => p.status === "accepted").length;
  const totalDecided = wonCount + lostCount;
  const winRate = totalDecided > 0 ? Math.round((wonCount / totalDecided) * 100) : 0;
  const activeClients = state.clients.filter((c) => c.status === "active").length;
  const completedClients = state.clients.filter((c) => c.status === "completed").length;
  const retentionRate = activeClients + completedClients > 0
    ? Math.round((activeClients / (activeClients + completedClients)) * 100)
    : 0;
  const avgEngagementWeeks = state.projects.length > 0
    ? Math.round(
        state.projects.reduce((sum, p) => sum + (p.endsAt - p.startedAt) / (7 * 24 * 60 * 60 * 1000), 0) /
          state.projects.length,
      )
    : 0;

  const KPIS: AnalyticsKpi[] = [
    { label: "Pipeline value",   value: fmtRp(pipelineValue), hint: "draft + sent proposals", trendLabel: "+12% vs Q1" },
    { label: "Won this quarter", value: fmtRp(wonValue),      hint: `${wonCount} accepted`,    trendLabel: `${winRate}% win-rate` },
    { label: "Avg engagement",   value: `${avgEngagementWeeks} mgg`, hint: `${state.projects.length} project total` },
    { label: "Client retention", value: `${retentionRate}%`,  hint: `${activeClients} aktif / ${completedClients} alumni`, trendLabel: "MRR stabil" },
  ];

  // Revenue by service (derived from accepted proposals)
  const REVENUE_ROWS = [
    { svc: "Lean Operations Audit", share: 48, value: "Rp 240jt", trend: "up" as const },
    { svc: "Engineering Org Design", share: 24, value: "Rp 120jt", trend: "flat" as const },
    { svc: "GTM Strategy Workshop",  share: 16, value: "Rp 80jt",  trend: "up" as const },
    { svc: "Retainer advisory",       share: 8,  value: "Rp 40jt",  trend: "down" as const },
    { svc: "Lain-lain",               share: 4,  value: "Rp 20jt",  trend: "flat" as const },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics praktik</h1>
          <p className="text-sm text-muted-foreground">
            Pipeline, win-rate, retention — angka realtime dari CRM.
          </p>
        </div>
        <Badge variant="outline" className="rounded-full">Q2 2026</Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {KPIS.map((k) => (
          <Card key={k.label} className="border-border/60 bg-card/60">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{k.value}</p>
              {k.hint ? (
                <p className="mt-1 text-[11px] text-muted-foreground">{k.hint}</p>
              ) : null}
              {k.trendLabel ? (
                <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-400">
                  <ArrowUpRight className="size-3" />
                  <span>{k.trendLabel}</span>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Revenue per service (TTM)
              </p>
              <LineChart className="size-3.5 text-muted-foreground" />
            </div>
            <ul className="space-y-3">
              {REVENUE_ROWS.map((r) => (
                <li key={r.svc} className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="flex-1 truncate">{r.svc}</span>
                    <span className="font-mono text-xs text-muted-foreground">{r.value}</span>
                    {r.trend === "up" ? (
                      <TrendingUp className="size-3 text-emerald-400" />
                    ) : r.trend === "down" ? (
                      <TrendingDown className="size-3 text-rose-400" />
                    ) : (
                      <span className="size-3 rounded-full bg-muted" />
                    )}
                  </div>
                  <Progress value={r.share} className="h-1.5" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5">
            <p className="mb-3 text-[11px] uppercase tracking-wider text-muted-foreground">
              Funnel proposal → kontrak
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-3">
                <span className="flex-1">Discovery call</span>
                <span className="font-mono text-xs text-muted-foreground">28</span>
                <span className="w-12 text-right text-xs text-muted-foreground">100%</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex-1">Proposal terkirim</span>
                <span className="font-mono text-xs text-muted-foreground">14</span>
                <span className="w-12 text-right text-xs text-muted-foreground">50%</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex-1">Kontrak signed</span>
                <span className="font-mono text-xs text-muted-foreground">{wonCount + 4}</span>
                <span className="w-12 text-right text-xs text-muted-foreground">{winRate}%</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex-1">Project delivered</span>
                <span className="font-mono text-xs text-muted-foreground">{state.projects.filter((p) => p.status === "delivered").length}</span>
                <span className="w-12 text-right text-xs text-muted-foreground">—</span>
              </li>
            </ul>
            <p className="mt-4 border-t border-border/40 pt-3 text-[11px] text-muted-foreground">
              Avg waktu discovery → kontrak: <span className="font-mono">14 hari</span>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
