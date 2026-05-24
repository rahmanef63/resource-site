"use client";

import { Award, Gift, GraduationCap, Repeat, ShoppingBag } from "lucide-react";
import type {
  MonetizationKind,
  MonetizationMonth,
  MonetizationSource,
  Payout,
} from "../../../shared/types";

/** Compact IDR formatter — "Rp 32.4jt" / "Rp 1.2M". */
export function fmtIdr(amount: number): string {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}jt`;
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}rb`;
  return `Rp ${amount}`;
}

export const KIND_ICON: Record<MonetizationKind, React.ComponentType<{ className?: string }>> = {
  sponsor: Award,
  affiliate: Gift,
  product: ShoppingBag,
  course: GraduationCap,
  subscription: Repeat,
};

export const KIND_LABEL: Record<MonetizationKind, string> = {
  sponsor: "Sponsor",
  affiliate: "Affiliate",
  product: "Digital product",
  course: "Course / cohort",
  subscription: "Subscription",
};

export const STATUS_TONE: Record<Payout["status"], string> = {
  scheduled: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  "in-review": "border-sky-400/40 bg-sky-400/10 text-sky-300",
  paid: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
};

export function totalAmount(sources: MonetizationSource[]): number {
  return sources.reduce((s, x) => s + x.amountIdr, 0);
}

export function chartMax(months: MonetizationMonth[]): number {
  return Math.max(1, ...months.map((m) => m.amountIdr));
}

/** ASCII-style horizontal bar — pure CSS width tween. */
export function MonthBar({
  month,
  max,
}: {
  month: MonetizationMonth;
  max: number;
}) {
  const pct = Math.round((month.amountIdr / max) * 100);
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-20 shrink-0 text-muted-foreground">{month.period}</span>
      <div className="relative h-5 flex-1 overflow-hidden rounded-sm bg-muted/50">
        <div
          className="h-full bg-gradient-to-r from-emerald-500/70 via-teal-500/70 to-cyan-500/70 transition-all"
          style={{ width: `${pct}%` }}
        />
        <div className="absolute inset-y-0 right-2 flex items-center font-mono text-[10px] text-foreground/85">
          {fmtIdr(month.amountIdr)}
        </div>
      </div>
    </div>
  );
}
