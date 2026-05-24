"use client";

import { ArrowDownRight, ArrowUpRight, BarChart3, DollarSign, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { fmtDate, useMonetization } from "../../../shared/store";
import {
  KIND_ICON,
  KIND_LABEL,
  MonthBar,
  STATUS_TONE,
  chartMax,
  fmtIdr,
  totalAmount,
} from "./monetization-helpers";

/**
 * Revenue dashboard for creator economy — breakdown per source (sponsor /
 * affiliate / product / course / subscription), monthly ASCII bar chart,
 * payout schedule list. All read-only from seed; numbers are illustrative.
 */
export function MonetizationView() {
  const { sources, months, payouts } = useMonetization();
  const total = totalAmount(sources);
  const lastMonth = months[months.length - 1]?.amountIdr ?? 0;
  const prevMonth = months[months.length - 2]?.amountIdr ?? 0;
  const momPct = prevMonth === 0 ? 0 : ((lastMonth - prevMonth) / prevMonth) * 100;
  const scheduledTotal = payouts
    .filter((p) => p.status !== "paid")
    .reduce((s, p) => s + p.amountIdr, 0);
  const ytdTotal = months.reduce((s, m) => s + m.amountIdr, 0);
  const max = chartMax(months);

  return (
    <div className="space-y-5">
      <SectionHead
        eyebrow="Monetization"
        title="Revenue & payouts"
        subtitle="Breakdown per source, monthly trend, payout schedule. Numbers ilustratif."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="This month"
          value={fmtIdr(lastMonth)}
          hint={`${momPct >= 0 ? "+" : ""}${momPct.toFixed(1)}% vs last`}
        />
        <StatCard
          icon={BarChart3}
          label="YTD revenue"
          value={fmtIdr(ytdTotal)}
          hint={`${months.length} bulan tracked`}
        />
        <StatCard
          icon={Wallet}
          label="Scheduled payouts"
          value={fmtIdr(scheduledTotal)}
          hint={`${payouts.filter((p) => p.status !== "paid").length} pending`}
        />
        <StatCard label="Active sources" value={sources.length} hint="diversified" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Source breakdown */}
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Revenue by source
              </p>
              <span className="font-mono text-xs text-muted-foreground">
                {fmtIdr(total)} this month
              </span>
            </div>
            <ul className="space-y-3">
              {sources
                .slice()
                .sort((a, b) => b.amountIdr - a.amountIdr)
                .map((src) => {
                  const Icon = KIND_ICON[src.kind];
                  const up = src.growth >= 0;
                  return (
                    <li key={src.id} className="flex items-center gap-3">
                      <span className="grid size-8 place-items-center rounded-md bg-muted/60">
                        <Icon className="size-4 text-foreground/85" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{src.label}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {KIND_LABEL[src.kind]} · {src.share}% of total
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm">{fmtIdr(src.amountIdr)}</p>
                        <p
                          className={`flex items-center justify-end gap-0.5 text-[10px] ${up ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                          {Math.abs(src.growth)}%
                        </p>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </CardContent>
        </Card>

        {/* Monthly bar chart */}
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Monthly revenue
              </p>
              <Badge variant="outline" className="rounded-full text-[10px]">
                12 bulan terakhir
              </Badge>
            </div>
            <div className="space-y-1.5">
              {months.map((m) => (
                <MonthBar key={m.id} month={m} max={max} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout schedule */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Payout schedule
            </p>
            <span className="text-[11px] text-muted-foreground">
              {payouts.length} entries
            </span>
          </div>
          <ul className="divide-y divide-border/60">
            {payouts
              .slice()
              .sort((a, b) => a.dueAt - b.dueAt)
              .map((p) => {
                const Icon = KIND_ICON[p.kind];
                return (
                  <li key={p.id} className="flex items-center gap-3 py-3 text-sm">
                    <Icon className="size-4 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{p.source}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {KIND_LABEL[p.kind]} · {fmtDate(p.dueAt)}
                      </p>
                    </div>
                    <span className="font-mono text-xs">{fmtIdr(p.amountIdr)}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] capitalize ${STATUS_TONE[p.status]}`}
                    >
                      {p.status}
                    </span>
                  </li>
                );
              })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
