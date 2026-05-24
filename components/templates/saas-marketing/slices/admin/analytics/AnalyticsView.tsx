"use client";

import * as React from "react";
import {
  Activity,
  ArrowDownRight,
  DollarSign,
  LineChart,
  RefreshCcw,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAnalytics, useStore } from "../../../shared/store";
import { HealthRow, Kpi, MrrBars, pct, usd } from "./analytics-helpers";

/** CK-2B — SaaS KPI snapshot. MRR, ARR, NRR, churn, trial→paid, CAC payback.
 *  All derived from `state.analytics` (weekly samples) + `state.subscriptions`
 *  + `state.customers`. Deterministic — no rng. Helpers live in sibling
 *  analytics-helpers.tsx so this file stays under the 200 LOC cap. */
export function AnalyticsView() {
  const analytics = useAnalytics();
  const { state } = useStore();

  const current = analytics[analytics.length - 1];
  const prev = analytics[analytics.length - 2];

  const mrr = current?.mrrCents ?? 0;
  const arr = mrr * 12;
  const mrrDelta = prev ? ((mrr - prev.mrrCents) / Math.max(prev.mrrCents, 1)) * 100 : 0;
  const churnRate = current
    ? (current.churnedCustomers / Math.max(state.customers.length, 1)) * 100
    : 0;
  const trialConversion = current
    ? (current.trialsConverted / Math.max(current.trials, 1)) * 100
    : 0;
  const avgArpu =
    mrr / Math.max(state.subscriptions.filter((s) => s.status === "active").length, 1);
  const churnDollars = (current?.churnedCustomers ?? 0) * avgArpu;
  const nrr = prev
    ? ((mrr + churnDollars - churnDollars * 0.4) / Math.max(prev.mrrCents, 1)) * 100
    : 100;
  const cacPayback = avgArpu > 0 ? 480 / ((avgArpu * 0.78) / 100) : 0;

  const cohort = analytics.map((w) => ({
    week: w.week,
    starters: w.trials,
    converted: w.trialsConverted,
    rate: pct((w.trialsConverted / Math.max(w.trials, 1)) * 100, 0),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Self-hosted SaaS KPIs — refreshed nightly from the warehouse.
          </p>
        </div>
        <Badge variant="outline" className="rounded-full gap-1">
          <RefreshCcw className="size-3" /> Last 4 weeks
        </Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi icon={<DollarSign className="size-3.5" />} label="MRR" value={usd(mrr)} delta={mrrDelta} />
        <Kpi icon={<LineChart className="size-3.5" />} label="ARR" value={usd(arr)} delta={mrrDelta} />
        <Kpi icon={<Activity className="size-3.5" />} label="NRR" value={pct(nrr, 0)} delta={nrr - 100} />
        <Kpi icon={<ArrowDownRight className="size-3.5" />} label="Churn" value={pct(churnRate)} delta={-churnRate} inverse />
        <Kpi icon={<Users className="size-3.5" />} label="Trial → Paid" value={pct(trialConversion, 0)} delta={trialConversion - 30} />
        <Kpi icon={<RefreshCcw className="size-3.5" />} label="CAC payback" value={`${cacPayback.toFixed(1)}mo`} delta={-cacPayback + 12} inverse />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">MRR trend</p>
              <span className="text-[11px] text-emerald-400">+{pct(mrrDelta, 1)} WoW</span>
            </div>
            <MrrBars rows={analytics} />
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5">
            <p className="mb-4 text-[11px] uppercase tracking-wider text-muted-foreground">
              Trial cohort
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Cohort</th>
                  <th className="pb-2 font-medium">Started</th>
                  <th className="pb-2 font-medium">Converted</th>
                  <th className="pb-2 text-right font-medium">Rate</th>
                </tr>
              </thead>
              <tbody>
                {cohort.map((c) => (
                  <tr key={c.week} className="border-t border-border/40">
                    <td className="py-2 font-mono text-xs text-muted-foreground">{c.week}</td>
                    <td className="py-2 tabular-nums">{c.starters}</td>
                    <td className="py-2 tabular-nums">{c.converted}</td>
                    <td className="py-2 text-right font-medium tabular-nums">{c.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-5">
          <p className="mb-4 text-[11px] uppercase tracking-wider text-muted-foreground">
            Healthy ranges — quick reference
          </p>
          <div className="grid gap-3 text-sm md:grid-cols-3">
            <HealthRow label="MRR growth"            actual={pct(mrrDelta, 1)} target=">= 8% WoW" good={mrrDelta >= 8} />
            <HealthRow label="Net revenue retention" actual={pct(nrr, 0)}      target=">= 110% (best-in-class)" good={nrr >= 110} />
            <HealthRow label="Logo churn"            actual={pct(churnRate)}   target="<= 3% monthly" good={churnRate <= 3} />
            <HealthRow label="Trial conversion"      actual={pct(trialConversion, 0)} target=">= 25% (PLG)" good={trialConversion >= 25} />
            <HealthRow label="CAC payback"           actual={`${cacPayback.toFixed(1)} mo`} target="<= 12 mo (efficient)" good={cacPayback <= 12} />
            <HealthRow label="ARR"                   actual={usd(arr)} target="next milestone $2M" good={arr >= 2_000_000_00} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
