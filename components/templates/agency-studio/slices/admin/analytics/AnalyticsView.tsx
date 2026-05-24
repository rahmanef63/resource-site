"use client";

import * as React from "react";
import { LineChart, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "../../../shared/store";

type Kpi = { label: string; value: string; hint: string; delta: number };

function bar(pct: number) {
  // ASCII-style horizontal bar — 16 segments scaled to 100%.
  const filled = Math.round((pct / 100) * 16);
  return "█".repeat(Math.max(1, filled)) + "░".repeat(Math.max(0, 16 - filled));
}

export function AnalyticsView() {
  const { state } = useStore();
  const newLeads = state.leads.filter((l) => l.status === "new").length;
  const activeProjects = state.projects.filter((p) => p.status !== "delivered" && p.status !== "archived").length;
  const activeClients = state.clients.filter((c) => c.status === "active").length;
  const pipelineValue = state.leads.length * 65 + activeProjects * 120; // synthetic "jt"

  const KPIS: Kpi[] = [
    { label: "New leads (30d)",   value: `${newLeads + 14}`,         hint: "vs prev 12",   delta: +18 },
    { label: "Active projects",   value: `${activeProjects}`,        hint: "across 4 PMs", delta: +5  },
    { label: "Pipeline value",    value: `Rp ${pipelineValue}jt`,    hint: "weighted",     delta: +23 },
    { label: "Retention rate",    value: `${Math.min(95, 72 + activeClients * 3)}%`, hint: "12-mo trailing", delta: -2 },
  ];

  const FUNNEL = [
    { stage: "Inquiry",   count: newLeads + 28, pct: 100 },
    { stage: "Qualified", count: 18,            pct: 64  },
    { stage: "Proposal",  count: 11,            pct: 39  },
    { stage: "Won",       count: 6,             pct: 21  },
  ];

  const SOURCES = [
    { src: "Referral",          visits: 1_840, share: "32%" },
    { src: "Search (Google)",   visits: 1_412, share: "25%" },
    { src: "LinkedIn",          visits: 980,   share: "17%" },
    { src: "Journal — case-study", visits: 720, share: "13%" },
    { src: "Newsletter",        visits: 412,   share: "7%"  },
    { src: "Direct",            visits: 348,   share: "6%"  },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Studio analytics</h1>
          <p className="text-sm text-muted-foreground">Pipeline + retention + acquisition sources, self-hosted.</p>
        </div>
        <Badge variant="outline" className="rounded-full">Last 30d</Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {KPIS.map((k) => (
          <Card key={k.label} className="border-border/60 bg-card/60">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{k.value}</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                {k.delta >= 0 ? (
                  <TrendingUp className="size-3 text-emerald-400" />
                ) : (
                  <TrendingDown className="size-3 text-rose-400" />
                )}
                <span className={k.delta >= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {k.delta >= 0 ? "+" : ""}{k.delta}%
                </span>
                <span>· {k.hint}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Pipeline funnel</p>
              <LineChart className="size-3.5 text-muted-foreground" />
            </div>
            <ul className="space-y-2 font-mono text-xs">
              {FUNNEL.map((row) => (
                <li key={row.stage} className="flex items-center gap-3">
                  <span className="w-20 text-muted-foreground">{row.stage}</span>
                  <span className="flex-1 text-emerald-400/80">{bar(row.pct)}</span>
                  <span className="w-12 text-right tabular-nums">{row.count}</span>
                  <span className="w-10 text-right text-muted-foreground">{row.pct}%</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5">
            <p className="mb-3 text-[11px] uppercase tracking-wider text-muted-foreground">Acquisition sources</p>
            <ul className="space-y-2 text-sm">
              {SOURCES.map((r) => (
                <li key={r.src} className="flex items-center gap-3">
                  <span className="flex-1 truncate">{r.src}</span>
                  <span className="font-mono text-xs text-muted-foreground">{r.visits.toLocaleString()}</span>
                  <span className="w-12 text-right text-xs text-muted-foreground">{r.share}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[10px] text-muted-foreground">
              Privacy-friendly counters — no third-party JS, server-only aggregation.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
