// glass-desktop — weather-days (weather, W). A 3-day forecast: today's big temp
// on top, then Wed/Thu/Fri columns each with a condition glyph + temp. Pure/
// presentational — no hooks, no "now"-derived text → no client boundary.
import { Cloud, CloudRain, CloudSun, Sun } from "lucide-react";
import { weatherDays } from "@/features/glass-desktop/lib/seeds/weather-2.seed";
import type { WeatherGlyph } from "@/features/glass-desktop/lib/seeds/weather-2.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";
import { cn } from "@/lib/utils";

const NUM = { fontFamily: "var(--font-numeric)" } as const;

const GLYPH: Record<WeatherGlyph, typeof Sun> = {
  sun: Sun,
  cloud: Cloud,
  partly: CloudSun,
  rain: CloudRain,
};

export function WeatherDays(_props: WidgetProps) {
  const { location, todayC, todayGlyph, days } = weatherDays;
  const Today = GLYPH[todayGlyph];

  return (
    <div className={cn("flex h-full flex-col justify-between")}>
      <div className={cn("flex items-start justify-between")}>
        <div className={cn("flex flex-col")}>
          <span
            className={cn("max-w-[7rem] truncate text-xs font-medium")}
            style={{ color: "var(--color-ink-mid)" }}
          >
            {location}
          </span>
          <span
            className={cn("text-[2.25rem] leading-none font-semibold")}
            style={{ ...NUM, color: "var(--color-ink-hi)" }}
          >
            {todayC}
            <span className={cn("text-xl")}>°</span>
          </span>
        </div>
        <Today aria-hidden size={22} style={{ color: "var(--color-accent-amber)" }} />
      </div>

      <div
        className={cn("mt-2 flex items-end justify-between border-t pt-2")}
        style={{ borderColor: "var(--color-hairline)" }}
      >
        {days.map((d) => {
          const Glyph = GLYPH[d.glyph];
          return (
            <div key={d.label} className={cn("flex flex-1 flex-col items-center gap-1")}>
              <span className={cn("text-[10px]")} style={{ color: "var(--color-ink-mid)" }}>
                {d.label}
              </span>
              <Glyph aria-hidden size={16} style={{ color: "var(--color-ink-low)" }} />
              <span
                className={cn("text-sm font-medium")}
                style={{ ...NUM, color: "var(--color-ink-hi)" }}
              >
                {d.tempC}°
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
