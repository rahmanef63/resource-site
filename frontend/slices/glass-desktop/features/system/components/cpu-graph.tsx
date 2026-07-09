"use client";
// glass-desktop — cpu-graph (W). Live CPU-load Sparkline. Subscribes to the
// shared clock; each second it shifts the series and appends a bounded random
// step (client-only, so no hydration mismatch). Ported from Lucent v4.
import { useEffect, useState } from "react";
import { Sparkline } from "@/features/glass-desktop/components/charts";
import { useClock } from "@/features/glass-desktop/hooks/use-clock";
import { useMounted } from "@/features/glass-desktop/hooks/use-mounted";
import { cpuGraphSeed } from "@/features/glass-desktop/lib/seeds/system-finance-analytics.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";
import { clamp } from "@/lib/utils";

const S = cpuGraphSeed;

export function CpuGraph(_props: WidgetProps) {
  const mounted = useMounted();
  const tick = useClock("second");
  const [series, setSeries] = useState<number[]>([...S.points]);

  useEffect(() => {
    if (!mounted) return;
    setSeries((prev) => {
      const last = prev[prev.length - 1];
      const next = clamp(Math.round(last + (Math.random() * 2 - 1) * S.jitter), S.min, S.max);
      return [...prev.slice(1), next];
    });
    // tick drives the walk; mounted gates the first client-only step.
  }, [tick, mounted]);

  const current = Math.round(series[series.length - 1]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-baseline justify-between">
        <span
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: "var(--color-ink-mid)" }}
        >
          {S.label}
        </span>
        <span
          className="text-lg font-semibold tabular-nums"
          style={{ color: "var(--color-ink-hi)", fontFamily: "var(--font-numeric)" }}
        >
          {current}
          <span className="text-xs" style={{ color: "var(--color-ink-low)" }}>
            {S.unit}
          </span>
        </span>
      </div>
      <div className="mt-auto">
        <Sparkline points={series} color={S.color} height={54} fill />
      </div>
    </div>
  );
}
