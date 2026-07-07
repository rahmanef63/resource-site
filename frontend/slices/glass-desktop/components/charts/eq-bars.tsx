// glass-desktop — EqBars (ported from Lucent v4). CSS-only, presentational.
// A row of equaliser bars. When `playing`, each bar pulses on a staggered loop;
// the animation is gated by prefers-reduced-motion (motion-safe only) and by
// `playing` — otherwise the bars rest at a fixed, intentional silhouette.
import { cn } from "@/lib/utils";

export interface EqBarsProps {
  playing?: boolean;
  bars?: number;
  color?: string;
  height?: number;
  barWidth?: number;
  gap?: number;
}

// Resting silhouette + pulse cadence, cycled per bar so any count looks composed.
const REST = [0.45, 0.8, 1, 0.6, 0.35, 0.7, 0.9];
const DURATIONS = [0.9, 1.1, 0.75, 1.25, 1];

const KEYFRAMES = `@media (prefers-reduced-motion: no-preference){
  .rr-eqbar[data-playing="true"]{animation-name:rr-eq;animation-iteration-count:infinite;animation-timing-function:ease-in-out;}
}
@keyframes rr-eq{0%,100%{transform:scaleY(0.28);}50%{transform:scaleY(1);}}`;

export function EqBars({
  playing = false,
  bars = 5,
  color = "var(--color-ink-hi)",
  height = 20,
  barWidth = 4,
  gap = 3,
}: EqBarsProps) {
  return (
    <div className={cn("flex items-end")} style={{ height, gap }} aria-hidden="true">
      <style>{KEYFRAMES}</style>
      {Array.from({ length: bars }, (_, i) => (
        <div
          key={i}
          className="rr-eqbar"
          data-playing={playing ? "true" : "false"}
          style={{
            width: barWidth,
            height,
            background: color,
            borderRadius: "var(--radius-pill)",
            transformOrigin: "bottom",
            transform: `scaleY(${REST[i % REST.length]})`,
            animationDuration: `${DURATIONS[i % DURATIONS.length]}s`,
            animationDelay: `${(i % DURATIONS.length) * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}
