"use client";
// glass-desktop — clock-world (time family, W wide). Ported from Lucent v4. A
// column of city rows, each showing its local time rendered in that city's IANA
// time zone off the shared minute clock (world clocks don't need per-second
// churn). Content only — the canvas supplies the glass shell. Numerals use
// var(--font-numeric).
import { useClock } from "@/features/glass-desktop/hooks/use-clock";
import { useMounted } from "@/features/glass-desktop/hooks/use-mounted";
import { zoneTime } from "@/features/glass-desktop/utils/format";
import { clockWorldSeed } from "@/features/glass-desktop/lib/seeds/time.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

export function ClockWorld(_props: WidgetProps) {
  const now = useClock("minute");
  const mounted = useMounted();

  return (
    <div className="flex h-full w-full flex-col justify-center gap-1.5">
      {clockWorldSeed.map((zone) => (
        <div key={zone.tz} className="flex items-baseline justify-between gap-2">
          <div className="flex min-w-0 flex-col">
            <span
              className="truncate text-xs font-medium leading-tight"
              style={{ color: "var(--color-ink-hi)" }}
            >
              {zone.city}
            </span>
            <span
              className="text-[10px] leading-tight"
              style={{ color: "var(--color-ink-low)" }}
            >
              {zone.offsetLabel}
            </span>
          </div>
          <span
            className="text-lg font-medium leading-none tabular-nums"
            style={{ color: "var(--color-ink-hi)", fontFamily: "var(--font-numeric)" }}
            suppressHydrationWarning
          >
            {mounted ? zoneTime(now, zone.tz) : "--:--"}
          </span>
        </div>
      ))}
    </div>
  );
}
