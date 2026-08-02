// glass-desktop — ticker-spark (W, finance). One public quote (AAPL) with its
// change coloured up/down through the tones SSOT, over a green trend Sparkline.
// Presentational — the canvas supplies the glass shell.
import { Sparkline } from "@/features/glass-desktop/components/charts";
import { TONES } from "@/features/glass-desktop/lib/seeds/system-finance-analytics.seed";
import { tickerSparkSeed } from "@/features/glass-desktop/lib/seeds/finance-analytics-2.seed";
import { currency } from "@/features/glass-desktop/utils/format";
import type { WidgetProps } from "@/features/glass-desktop/types";

const T = tickerSparkSeed;

export function TickerSpark(_props: WidgetProps) {
  const tone = T.up ? TONES.up : TONES.down;
  const sign = T.up ? "+" : "";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-semibold" style={{ color: "var(--color-ink-hi)" }}>
          {T.symbol}
        </span>
        <span className="truncate text-xs" style={{ color: "var(--color-ink-mid)" }}>
          {T.name}
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-2 tabular-nums" style={{ fontFamily: "var(--font-numeric)" }}>
        <span className="text-xl font-semibold" style={{ color: "var(--color-ink-hi)" }}>
          {currency(T.price)}
        </span>
        <span className="text-xs font-medium" style={{ color: tone }}>
          {sign}
          {T.change.toFixed(2)} ({sign}
          {T.changePct.toFixed(2)}%)
        </span>
      </div>
      <div className="mt-auto">
        <Sparkline points={[...T.points]} color={T.color} height={52} fill />
      </div>
    </div>
  );
}
