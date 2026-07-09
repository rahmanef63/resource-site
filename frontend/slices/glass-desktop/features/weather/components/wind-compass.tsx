// glass-desktop — wind-compass (weather, S). A static compass ring with cardinal
// ticks and a needle pointing SW, plus the wind speed + gusts caption. Rendered
// as inline SVG (no raster asset). Pure/presentational — no hooks, no client boundary.
import { windCompass } from "@/features/glass-desktop/lib/seeds/weather-2.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";
import { cn } from "@/lib/utils";

const NUM = { fontFamily: "var(--font-numeric)" } as const;
const CARDINALS: Array<{ label: string; x: number; y: number }> = [
  { label: "N", x: 50, y: 14 },
  { label: "E", x: 86, y: 53 },
  { label: "S", x: 50, y: 92 },
  { label: "W", x: 14, y: 53 },
];

export function WindCompass(_props: WidgetProps) {
  const { direction, bearing, speedC, gustsC, unit } = windCompass;

  return (
    <div className={cn("flex h-full flex-col items-center justify-between")}>
      <svg viewBox="0 0 100 100" className={cn("h-[64%] w-auto")} role="img" aria-label={`Wind ${direction}`}>
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-hairline)" strokeWidth="2" />
        <circle cx="50" cy="50" r="34" fill="none" stroke="var(--color-hairline)" strokeWidth="1" />
        {CARDINALS.map((c) => (
          <text
            key={c.label}
            x={c.x}
            y={c.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fill="var(--color-ink-low)"
          >
            {c.label}
          </text>
        ))}
        <g transform={`rotate(${bearing} 50 50)`}>
          <polygon points="50,20 45,52 55,52" fill="var(--color-accent-blue)" />
          <polygon points="50,80 45,48 55,48" fill="var(--color-ink-low)" />
        </g>
        <circle cx="50" cy="50" r="4" fill="var(--color-glass-solid)" stroke="var(--color-hairline)" />
      </svg>

      <div className={cn("flex flex-col items-center gap-0.5")}>
        <span
          className={cn("text-sm font-semibold")}
          style={{ ...NUM, color: "var(--color-ink-hi)" }}
        >
          {direction}
        </span>
        <span
          className={cn("text-[11px]")}
          style={{ ...NUM, color: "var(--color-ink-mid)" }}
        >
          {speedC} {unit} · gusts {gustsC}
        </span>
      </div>
    </div>
  );
}
