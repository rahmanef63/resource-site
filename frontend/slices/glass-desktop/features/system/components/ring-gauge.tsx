// glass-desktop — ring-gauge (S). One component, three instances (battery /
// memory / storage) selected by `metric` (from defaultProps or the instanceId
// suffix, e.g. "ring-gauge:battery"). Presentational — RingGauge + tones.
import { RingGauge } from "@/features/glass-desktop/components/charts";
import {
  TONES,
  ringGauge,
  ringGaugeSeed,
  type RingMetric,
} from "@/features/glass-desktop/lib/seeds/system-finance-analytics.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

function resolveMetric(props: WidgetProps): RingMetric {
  const fromProp = props.metric;
  if (typeof fromProp === "string" && fromProp in ringGaugeSeed) return fromProp as RingMetric;
  const suffix = props.instanceId.split(":")[1];
  if (suffix && suffix in ringGaugeSeed) return suffix as RingMetric;
  return "battery";
}

export function RingGaugeWidget(props: WidgetProps) {
  const metric = resolveMetric(props);
  const s = ringGaugeSeed[metric];

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <RingGauge
        value={s.value}
        size={ringGauge.size}
        thickness={ringGauge.thickness}
        color={TONES[s.tone]}
        label={`${s.label} ${s.value}%`}
      />
      <div className="text-center leading-tight">
        <div
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: "var(--color-ink-mid)" }}
        >
          {s.label}
        </div>
        <div
          className="text-[11px] tabular-nums"
          style={{ color: "var(--color-ink-low)", fontFamily: "var(--font-numeric)" }}
        >
          {s.caption}
        </div>
      </div>
    </div>
  );
}
