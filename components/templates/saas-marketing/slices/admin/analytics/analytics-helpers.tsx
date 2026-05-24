"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const usd = (cents: number) =>
  `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export const pct = (n: number, digits = 1) =>
  `${n.toLocaleString(undefined, { maximumFractionDigits: digits })}%`;

/** Tiny ASCII bar chart (terminal-flavoured, fits a Card). */
export function MrrBars({
  rows,
}: {
  rows: { week: string; mrrCents: number }[];
}) {
  const max = Math.max(...rows.map((r) => r.mrrCents), 1);
  return (
    <ul className="space-y-1.5 font-mono text-[11px]">
      {rows.map((r) => {
        const fill = Math.max(1, Math.round((r.mrrCents / max) * 28));
        const bar = "█".repeat(fill).padEnd(28, "·");
        return (
          <li key={r.week} className="flex items-center gap-3">
            <span className="w-10 shrink-0 text-muted-foreground">{r.week}</span>
            <span className="text-emerald-400/90">{bar}</span>
            <span className="ml-auto tabular-nums text-foreground">{usd(r.mrrCents)}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function Kpi({
  icon,
  label,
  value,
  delta,
  inverse,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: number;
  inverse?: boolean;
}) {
  const up = delta >= 0;
  const positive = inverse ? !up : up;
  return (
    <Card className="border-border/60 bg-card/60">
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          {icon}
          <p className="text-[11px] uppercase tracking-wider">{label}</p>
        </div>
        <p className="mt-2 text-xl font-semibold tracking-tight tabular-nums">{value}</p>
        <p
          className={`mt-1 inline-flex items-center gap-0.5 text-[11px] ${
            positive ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {pct(Math.abs(delta), 1)}
        </p>
      </CardContent>
    </Card>
  );
}

export function HealthRow({
  label,
  actual,
  target,
  good,
}: {
  label: string;
  actual: string;
  target: string;
  good: boolean;
}) {
  return (
    <div className="rounded-md border border-border/50 bg-muted/20 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Badge variant={good ? "default" : "outline"} className="rounded-full text-[10px]">
          {good ? "on target" : "watch"}
        </Badge>
      </div>
      <p className="mt-1 text-base font-semibold tabular-nums">{actual}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{target}</p>
    </div>
  );
}
