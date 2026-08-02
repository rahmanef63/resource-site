// glass-desktop — revenue-card (WP). Headline revenue + trend Sparkline, delta
// coloured through the tones SSOT. Presentational. Ported from Lucent v4.
import { Sparkline } from "@/features/glass-desktop/components/charts";
import { TONES, revenueCardSeed } from "@/features/glass-desktop/lib/seeds/system-finance-analytics.seed";
import { compact } from "@/features/glass-desktop/utils/format";
import type { WidgetProps } from "@/features/glass-desktop/types";

const R = revenueCardSeed;

export function RevenueCard(_props: WidgetProps) {
  const up = R.changePct >= 0;
  const tone = up ? TONES.up : TONES.down;

  return (
    <div className="flex h-full items-center gap-3">
      <div className="flex min-w-0 flex-col justify-center">
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-ink-mid)" }}>
          {R.label}
        </span>
        <span
          className="text-xl font-semibold tabular-nums"
          style={{ color: "var(--color-ink-hi)", fontFamily: "var(--font-numeric)" }}
        >
          ${compact(R.value)}
        </span>
        <span className="text-[11px] font-medium tabular-nums" style={{ color: tone, fontFamily: "var(--font-numeric)" }}>
          {up ? "+" : ""}
          {R.changePct.toFixed(1)}%
          <span style={{ color: "var(--color-ink-low)" }}> · {R.period}</span>
        </span>
      </div>
      <div className="ml-auto h-full min-w-0 flex-1 self-center">
        <Sparkline points={[...R.points]} color={R.color} height={48} fill />
      </div>
    </div>
  );
}
