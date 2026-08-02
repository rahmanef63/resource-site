import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "ok" | "warn" | "err";

const TONE: Record<Tone, string> = {
  default: "border-border bg-card",
  ok: "border-emerald-500/30 bg-emerald-500/5",
  warn: "border-amber-500/30 bg-amber-500/5",
  err: "border-rose-500/30 bg-rose-500/5",
};

const VALUE_TONE: Record<Tone, string> = {
  default: "text-foreground",
  ok: "text-emerald-500",
  warn: "text-amber-500",
  err: "text-rose-500",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: Tone;
}) {
  return (
    <div className={cn("rounded-lg border p-4", TONE[tone])}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {Icon && <Icon className={cn("size-3.5", VALUE_TONE[tone])} />}
      </div>
      <p
        className={cn(
          "mt-2 font-mono text-3xl font-semibold tabular-nums",
          VALUE_TONE[tone],
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
