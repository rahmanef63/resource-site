"use client";
// glass-desktop — sun-arc (time family, W wide). A day arc from sunrise (05:58)
// to sunset (21:04) drawn as an SVG semicircle, with an amber marker sliding
// along it to mark "now", advanced off the shared minute clock. Before mount the
// marker rests at sunrise so server and first paint agree. Content only — the
// canvas supplies the glass shell. Numerals use var(--font-numeric).
import { useClock } from "@/features/glass-desktop/hooks/use-clock";
import { useMounted } from "@/features/glass-desktop/hooks/use-mounted";
import { sunArcSeed } from "@/features/glass-desktop/lib/seeds/time-2.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

const { sunrise, sunset, sunriseMin, sunsetMin, riseLabel, setLabel } = sunArcSeed;
const SPAN = sunsetMin - sunriseMin;

// Marker point on the upper semicircle for a 0..1 daylight fraction.
function point(frac: number): { x: number; y: number } {
  const theta = Math.PI * frac; // 0 → left end, PI → right end
  return { x: 50 - 44 * Math.cos(theta), y: 50 - 44 * Math.sin(theta) };
}

export function SunArc(_props: WidgetProps) {
  const now = useClock("minute");
  const mounted = useMounted();
  const mins = mounted ? now.getHours() * 60 + now.getMinutes() : sunriseMin;
  const frac = Math.min(1, Math.max(0, (mins - sunriseMin) / SPAN));
  const p = point(frac);

  return (
    <div className="flex h-full w-full flex-col justify-center gap-1">
      <svg viewBox="0 0 100 58" className="w-full" style={{ height: "auto" }} aria-hidden="true">
        <path
          d="M 6 50 A 44 44 0 0 1 94 50"
          fill="none"
          stroke="var(--color-hairline)"
          strokeWidth={1.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <line x1="6" y1="50" x2="94" y2="50" stroke="var(--color-hairline)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <circle cx={p.x} cy={p.y} r={4.5} fill="var(--color-accent-amber)" suppressHydrationWarning />
        <circle cx={p.x} cy={p.y} r={8} fill="var(--color-accent-amber)" fillOpacity={0.18} suppressHydrationWarning />
      </svg>
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--color-ink-low)" }}>
            {riseLabel}
          </span>
          <span
            className="text-xs font-medium tabular-nums"
            style={{ color: "var(--color-ink-mid)", fontFamily: "var(--font-numeric)" }}
          >
            {sunrise}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--color-ink-low)" }}>
            {setLabel}
          </span>
          <span
            className="text-xs font-medium tabular-nums"
            style={{ color: "var(--color-ink-mid)", fontFamily: "var(--font-numeric)" }}
          >
            {sunset}
          </span>
        </div>
      </div>
    </div>
  );
}
