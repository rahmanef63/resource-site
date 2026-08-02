// glass-desktop — visitors-spark (WP, analytics). Headline 7-day visitor count
// over an amber Sparkline, with a Δ RingGauge summarising week-over-week change.
// The delta colour resolves through the tones SSOT. Presentational.
import { RingGauge, Sparkline } from "@/features/glass-desktop/components/charts";
import { TONES } from "@/features/glass-desktop/lib/seeds/system-finance-analytics.seed";
import { group, visitorsSparkSeed } from "@/features/glass-desktop/lib/seeds/finance-analytics-2.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

const V = visitorsSparkSeed;

export function VisitorsSpark(_props: WidgetProps) {
  const tone = TONES[V.deltaTone];

  return (
    <div className="flex h-full items-center gap-3">
      <div className="flex min-w-0 flex-col justify-center">
        <span
          className="text-xl font-semibold tabular-nums"
          style={{ color: "var(--color-ink-hi)", fontFamily: "var(--font-numeric)" }}
        >
          {group(V.count)}
        </span>
        <span className="text-[11px]" style={{ color: "var(--color-ink-mid)" }}>
          {V.label} · {V.period}
        </span>
        <div className="mt-1 min-w-0">
          <Sparkline points={[...V.points]} color={V.color} height={30} fill />
        </div>
      </div>
      <div className="ml-auto flex flex-col items-center gap-1">
        <RingGauge
          value={V.deltaPct}
          size={52}
          thickness={7}
          color={tone}
          label={`Change +${V.deltaPct}%`}
          showValue={false}
        />
        <span className="text-[11px] font-medium tabular-nums" style={{ color: tone, fontFamily: "var(--font-numeric)" }}>
          Δ +{V.deltaPct}%
        </span>
      </div>
    </div>
  );
}
