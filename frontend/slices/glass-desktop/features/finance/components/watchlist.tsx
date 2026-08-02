// glass-desktop — watchlist (W). Three tickers (AAPL / MSFT / NVDA); each change
// is coloured up/down through the tones SSOT. Presentational. Ported from v4.
import { TONES, watchlistSeed } from "@/features/glass-desktop/lib/seeds/system-finance-analytics.seed";
import { currency } from "@/features/glass-desktop/utils/format";
import type { WidgetProps } from "@/features/glass-desktop/types";

export function Watchlist(_props: WidgetProps) {
  return (
    <div className="flex h-full flex-col justify-center gap-1">
      {watchlistSeed.map((row) => {
        const up = row.changePct >= 0;
        const tone = up ? TONES.up : TONES.down;
        const sign = up ? "+" : "";
        return (
          <div key={row.symbol} className="flex items-center justify-between gap-2">
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--color-ink-hi)" }}
            >
              {row.symbol}
            </span>
            <div className="flex items-baseline gap-2 tabular-nums" style={{ fontFamily: "var(--font-numeric)" }}>
              <span className="text-xs" style={{ color: "var(--color-ink-mid)" }}>
                {currency(row.price)}
              </span>
              <span className="w-14 text-right text-xs font-medium" style={{ color: tone }}>
                {sign}
                {row.changePct.toFixed(2)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
