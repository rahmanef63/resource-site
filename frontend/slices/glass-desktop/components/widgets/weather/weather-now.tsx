// glass-desktop — weather-now (weather, S). Ported from Lucent v4 "weather now"
// square. Pure/presentational: location + condition icon, the big current temp,
// and the day's hi/lo. No hooks, no "now"-derived text → no client boundary.
import { CloudSun } from "lucide-react";
import { weatherNow } from "@/features/glass-desktop/lib/seeds/weather.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

const NUM = { fontFamily: "var(--font-numeric)" } as const;

export function WeatherNow(_props: WidgetProps) {
  const { location, condition, tempC, high, low } = weatherNow;
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-start justify-between">
        <span
          className="max-w-[7rem] truncate text-xs font-medium"
          style={{ color: "var(--color-ink-mid)" }}
        >
          {location}
        </span>
        <CloudSun aria-hidden size={20} style={{ color: "var(--color-accent-amber)" }} />
      </div>

      <div
        className="flex items-baseline text-[2.75rem] leading-none font-semibold"
        style={{ ...NUM, color: "var(--color-ink-hi)" }}
      >
        {tempC}
        <span className="text-2xl">°</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--color-ink-mid)" }}>
          {condition}
        </span>
        <span className="text-xs" style={{ ...NUM, color: "var(--color-ink-low)" }}>
          {high}° / {low}°
        </span>
      </div>
    </div>
  );
}
