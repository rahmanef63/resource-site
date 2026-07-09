// glass-desktop — precip-now (weather, S). Current precipitation: a rain-cloud
// glyph, the condition + temp, and when it's expected to end. Status uses the
// info tone (rain = informational). Pure/presentational — no hooks, no boundary.
import { CloudRain } from "lucide-react";
import { precipNow } from "@/features/glass-desktop/lib/seeds/weather-2.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";
import { cn } from "@/lib/utils";

const NUM = { fontFamily: "var(--font-numeric)" } as const;

export function PrecipNow(_props: WidgetProps) {
  const { condition, tempC, ends } = precipNow;

  return (
    <div className={cn("flex h-full flex-col justify-between")}>
      <CloudRain aria-hidden size={30} style={{ color: "var(--tone-info)" }} />

      <div className={cn("flex flex-col gap-0.5")}>
        <span
          className={cn("text-lg font-semibold")}
          style={{ ...NUM, color: "var(--color-ink-hi)" }}
        >
          {condition}, {tempC}°
        </span>
        <span className={cn("text-[11px]")} style={{ color: "var(--color-ink-mid)" }}>
          {ends}
        </span>
      </div>
    </div>
  );
}
