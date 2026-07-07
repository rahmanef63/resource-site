// glass-desktop — weather-full (weather, WP). Wide summary: location · wind ·
// precip on the left, the big current temp + condition glyph on the right. Pure/
// presentational — no hooks, no "now"-derived text → no client boundary.
import { Cloud, CloudRain, CloudSun, Sun } from "lucide-react";
import { weatherFull } from "@/features/glass-desktop/lib/seeds/weather-2.seed";
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

export function WeatherFull(_props: WidgetProps) {
  const { location, wind, precip, tempC, glyph } = weatherFull;
  const Glyph = GLYPH[glyph];

  return (
    <div className={cn("flex h-full items-center justify-between gap-3")}>
      <div className={cn("flex min-w-0 flex-col gap-1")}>
        <span
          className={cn("truncate text-sm font-medium")}
          style={{ color: "var(--color-ink-hi)" }}
        >
          {location}
        </span>
        <span
          className={cn("truncate text-xs")}
          style={{ ...NUM, color: "var(--color-ink-mid)" }}
        >
          {wind} · {precip}
        </span>
      </div>

      <div className={cn("flex shrink-0 items-center gap-2")}>
        <Glyph aria-hidden size={26} style={{ color: "var(--color-accent-amber)" }} />
        <span
          className={cn("text-[2.5rem] leading-none font-semibold")}
          style={{ ...NUM, color: "var(--color-ink-hi)" }}
        >
          {tempC}
          <span className={cn("text-xl")}>°</span>
        </span>
      </div>
    </div>
  );
}
