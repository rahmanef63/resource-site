// glass-desktop — weather-hourly (weather, WP). Ported from Lucent v4 "hourly
// strip" pill. A Sparkline trend of the temps sits behind a row of hour cells
// (label + temp°). Pure/presentational — no hooks, no client boundary.
import { Sparkline } from "@/features/glass-desktop/components/charts";
import { weatherHourly } from "@/features/glass-desktop/lib/seeds/weather.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

const NUM = { fontFamily: "var(--font-numeric)" } as const;

export function WeatherHourly(_props: WidgetProps) {
  const { hours } = weatherHourly;
  const temps = hours.map((h) => h.tempC);

  return (
    <div className="relative flex h-full flex-col justify-center">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 opacity-70">
        <Sparkline points={temps} color="var(--color-accent-amber)" height={22} fill />
      </div>
      <div className="relative flex items-center justify-between">
        {hours.map((h) => (
          <div key={h.label} className="flex flex-1 flex-col items-center gap-0.5">
            <span className="text-[10px]" style={{ color: "var(--color-ink-mid)" }}>
              {h.label}
            </span>
            <span
              className="text-sm font-medium"
              style={{ ...NUM, color: "var(--color-ink-hi)" }}
            >
              {h.tempC}°
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
