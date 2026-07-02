"use client";

import { Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Tone = "default" | "success" | "warning" | "destructive";

interface Props {
  label: string;
  value: string;
  badge?: string;
  tone?: Tone;
}

const toneClass: Record<Tone, string> = {
  default: "",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  destructive: "border-destructive/30 bg-destructive/10 text-destructive",
};

export function KpiCard({ label, value, badge, tone = "default" }: Props) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/70 p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="text-lg font-semibold tabular-nums">{value}</p>
        {badge ? <Badge variant="outline" className={toneClass[tone]}>{badge}</Badge> : null}
      </div>
    </div>
  );
}
