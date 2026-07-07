// glass-desktop — RingGauge (ported from Lucent v4). SVG-only, presentational.
// A circular progress ring over a hairline track. The value arc "draws in" from
// empty to its target over --duration-settle on mount, gated by
// prefers-reduced-motion (the keyframe only runs motion-safe; reduced motion
// shows the final arc instantly).
import { clamp } from "@/lib/utils";

export interface RingGaugeProps {
  /** 0–100. */
  value: number;
  size?: number;
  thickness?: number;
  color: string;
  /** aria-label; the ring is otherwise decorative. */
  label: string;
  showValue?: boolean;
}

const DRAW_IN = `@media (prefers-reduced-motion: no-preference){
  .rr-ring-arc{animation:rr-ring-draw var(--duration-settle) var(--ease-settle) both;}
}
@keyframes rr-ring-draw{from{stroke-dashoffset:var(--rr-ring-c);}}`;

export function RingGauge({ value, size = 56, thickness = 6, color, label, showValue = true }: RingGaugeProps) {
  const pct = clamp(value, 0, 100);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  const center = size / 2;

  return (
    <div
      role="img"
      aria-label={label}
      className="relative inline-grid place-items-center"
      style={{ width: size, height: size }}
    >
      <style>{DRAW_IN}</style>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="var(--color-hairline)"
          strokeWidth={thickness}
        />
        <circle
          className="rr-ring-arc"
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          style={
            {
              strokeDasharray: c,
              strokeDashoffset: offset,
              ["--rr-ring-c" as string]: `${c}`,
            } as React.CSSProperties
          }
        />
      </svg>
      {showValue ? (
        <span
          className="absolute text-xs font-medium"
          style={{ color: "var(--color-ink-hi)", fontFamily: "var(--font-numeric)" }}
        >
          {Math.round(pct)}%
        </span>
      ) : null}
    </div>
  );
}
