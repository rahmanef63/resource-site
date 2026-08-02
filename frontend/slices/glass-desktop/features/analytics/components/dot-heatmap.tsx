// glass-desktop — dot-heatmap (WP). Activity grid via DotMatrix; the pattern is
// derived deterministically inside the chart, so this is fully presentational.
// Ported from Lucent v4.
import { DotMatrix } from "@/features/glass-desktop/components/charts";
import { dotHeatmapSeed } from "@/features/glass-desktop/lib/seeds/system-finance-analytics.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

const D = dotHeatmapSeed;

export function DotHeatmap(_props: WidgetProps) {
  return (
    <div className="flex h-full flex-col justify-center gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-ink-mid)" }}>
        {D.label}
      </span>
      <div className="min-h-0 flex-1 overflow-hidden">
        <DotMatrix
          cols={D.cols}
          rows={D.rows}
          dot={D.dot}
          gap={D.gap}
          color={D.color}
          label={`${D.label} — ${D.caption}`}
        />
      </div>
      <span
        className="text-[11px] tabular-nums"
        style={{ color: "var(--color-ink-low)", fontFamily: "var(--font-numeric)" }}
      >
        {D.caption}
      </span>
    </div>
  );
}
