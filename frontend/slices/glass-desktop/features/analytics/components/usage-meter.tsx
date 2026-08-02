// glass-desktop — usage-meter (WP, analytics). Headline token volume plus a
// request cap bar. The fill tints amber once utilisation crosses the warn
// threshold (via the tones SSOT), green below it. Presentational.
import { TONES } from "@/features/glass-desktop/lib/seeds/system-finance-analytics.seed";
import { usageMeterSeed } from "@/features/glass-desktop/lib/seeds/finance-analytics-2.seed";
import { compact } from "@/features/glass-desktop/utils/format";
import type { WidgetProps } from "@/features/glass-desktop/types";

const U = usageMeterSeed;

export function UsageMeter(_props: WidgetProps) {
  const ratio = U.cap.used / U.cap.total;
  const pct = Math.min(100, Math.round(ratio * 100));
  const tone = ratio > U.warnAt ? TONES.warn : TONES.up;

  return (
    <div className="flex h-full flex-col justify-center gap-2">
      <div className="flex items-baseline gap-1.5 tabular-nums" style={{ fontFamily: "var(--font-numeric)" }}>
        <span className="text-xl font-semibold" style={{ color: "var(--color-ink-hi)" }}>
          {compact(U.tokens)}
        </span>
        <span className="text-[11px]" style={{ color: "var(--color-ink-mid)" }}>
          {U.tokenLabel} · {U.period}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <div
          className="h-2 w-full overflow-hidden rounded-[var(--radius-pill)]"
          style={{ background: "var(--color-glass-lo)" }}
          role="img"
          aria-label={`${compact(U.cap.used)} of ${compact(U.cap.total)} ${U.cap.unit} used`}
        >
          <div
            className="h-full rounded-[var(--radius-pill)]"
            style={{ width: `${pct}%`, background: tone }}
          />
        </div>
        <span
          className="text-[11px] tabular-nums"
          style={{ color: "var(--color-ink-low)", fontFamily: "var(--font-numeric)" }}
        >
          {compact(U.cap.used)} / {compact(U.cap.total)} {U.cap.unit}
        </span>
      </div>
    </div>
  );
}
