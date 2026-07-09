"use client";
// glass-desktop — time-combo (time family, WP wide pill). A single condensed line
// "Jul 7, Tuesday · 14:32 · 21°": short date + weekday + wall-clock (HH:MM) + the
// seed temperature, refreshed off the shared minute clock. Until the client
// mounts it shows the seed fallback line so server and first paint agree. Content
// only — the canvas supplies the glass shell. Numerals use var(--font-numeric).
import { useClock } from "@/features/glass-desktop/hooks/use-clock";
import { useMounted } from "@/features/glass-desktop/hooks/use-mounted";
import { clockFace, dayOfMonth, monthShort, weekdayLong } from "@/features/glass-desktop/utils/format";
import { timeComboSeed } from "@/features/glass-desktop/lib/seeds/time-2.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

export function TimeCombo(_props: WidgetProps) {
  const now = useClock("minute");
  const mounted = useMounted();

  const line = mounted
    ? `${monthShort(now)} ${dayOfMonth(now)}, ${weekdayLong(now)} · ${clockFace(now).slice(0, 5)} · ${timeComboSeed.tempC}°`
    : timeComboSeed.fallback;

  return (
    <div className="flex h-full w-full items-center justify-center">
      <span
        className="truncate text-sm font-medium tabular-nums"
        style={{ color: "var(--color-ink-hi)", fontFamily: "var(--font-numeric)" }}
        suppressHydrationWarning
      >
        {line}
      </span>
    </div>
  );
}
