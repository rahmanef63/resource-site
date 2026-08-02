// glass-desktop — orders-summary (WP, analytics). A fictional store's three
// headline funnel metrics (clicks / leads / sales). Presentational — the canvas
// supplies the glass shell. Store name is fictional (no real-brand marks).
import { group, ordersSummarySeed } from "@/features/glass-desktop/lib/seeds/finance-analytics-2.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

const O = ordersSummarySeed;

export function OrdersSummary(_props: WidgetProps) {
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      <span className="truncate text-sm font-semibold" style={{ color: "var(--color-ink-hi)" }}>
        {O.store}
      </span>
      <div className="flex items-stretch gap-2">
        {O.rows.map((row) => (
          <div key={row.id} className="flex min-w-0 flex-1 flex-col">
            <span
              className="text-lg font-semibold tabular-nums"
              style={{ color: "var(--color-ink-hi)", fontFamily: "var(--font-numeric)" }}
            >
              {group(row.value)}
            </span>
            <span className="text-[11px] uppercase tracking-wide" style={{ color: "var(--color-ink-mid)" }}>
              {row.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
