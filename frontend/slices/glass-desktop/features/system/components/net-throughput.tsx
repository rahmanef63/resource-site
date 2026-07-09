"use client";
// glass-desktop — net-throughput (WP). Dual Sparkline (download + upload, Mbps)
// driven by the shared clock; each second both series shift and append a bounded
// random step (client-only → no hydration mismatch). Ported from Lucent v4.
import { useEffect, useState } from "react";
import { Sparkline } from "@/features/glass-desktop/components/charts";
import { useClock } from "@/features/glass-desktop/hooks/use-clock";
import { useMounted } from "@/features/glass-desktop/hooks/use-mounted";
import {
  TONES,
  netThroughputSeed,
} from "@/features/glass-desktop/lib/seeds/system-finance-analytics.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";
import { clamp } from "@/lib/utils";

const N = netThroughputSeed;

function step(prev: number[], min: number, max: number, jitter: number): number[] {
  const last = prev[prev.length - 1];
  const next = clamp(Math.round(last + (Math.random() * 2 - 1) * jitter), min, max);
  return [...prev.slice(1), next];
}

function Lane({
  glyph,
  tone,
  series,
  unit,
}: {
  glyph: string;
  tone: string;
  series: number[];
  unit: string;
}) {
  const current = series[series.length - 1];
  return (
    <div className="flex flex-1 items-center gap-2">
      <span className="text-sm font-semibold" style={{ color: tone }} aria-hidden>
        {glyph}
      </span>
      <div className="min-w-0 flex-1">
        <Sparkline points={series} color={tone} height={20} />
      </div>
      <span
        className="w-14 text-right text-xs tabular-nums"
        style={{ color: "var(--color-ink-hi)", fontFamily: "var(--font-numeric)" }}
      >
        {current}
        <span style={{ color: "var(--color-ink-low)" }}> {unit}</span>
      </span>
    </div>
  );
}

export function NetThroughput(_props: WidgetProps) {
  const mounted = useMounted();
  const tick = useClock("second");
  const [down, setDown] = useState<number[]>([...N.down.points]);
  const [up, setUp] = useState<number[]>([...N.up.points]);

  useEffect(() => {
    if (!mounted) return;
    setDown((p) => step(p, N.down.min, N.down.max, N.down.jitter));
    setUp((p) => step(p, N.up.min, N.up.max, N.up.jitter));
  }, [tick, mounted]);

  return (
    <div className="flex h-full flex-col justify-center gap-1.5">
      <Lane glyph={N.down.label} tone={TONES[N.down.tone]} series={down} unit={N.unit} />
      <Lane glyph={N.up.label} tone={TONES[N.up.tone]} series={up} unit={N.unit} />
    </div>
  );
}
