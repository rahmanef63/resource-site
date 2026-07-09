"use client";
// glass-desktop — date-badge (calendar family, S square). Ported from Lucent v4.
// A calendar-icon style badge: accent weekday strip, big day-of-month numeral,
// month caption. Driven by the shared minute clock (the date only rolls at
// midnight, so per-second ticks are wasted). Content only — the canvas supplies
// the glass shell. Numerals use var(--font-numeric).
import { useClock } from "@/features/glass-desktop/hooks/use-clock";
import { useMounted } from "@/features/glass-desktop/hooks/use-mounted";
import { dayOfMonth, monthShort, weekdayLong } from "@/features/glass-desktop/utils/format";
import { dateBadgeSeed } from "@/features/glass-desktop/lib/seeds/calendar.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

export function DateBadge(_props: WidgetProps) {
  const now = useClock("minute");
  const mounted = useMounted();

  return (
    <div className="flex h-full w-full flex-col">
      <span
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: mounted ? dateBadgeSeed.accent : "var(--color-ink-low)" }}
        suppressHydrationWarning
      >
        {mounted ? weekdayLong(now) : dateBadgeSeed.caption}
      </span>
      <div className="flex flex-1 items-center justify-center">
        <span
          className="text-6xl font-medium leading-none tabular-nums"
          style={{ color: "var(--color-ink-hi)", fontFamily: "var(--font-numeric)" }}
          suppressHydrationWarning
        >
          {mounted ? dayOfMonth(now) : "--"}
        </span>
      </div>
      <span
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: "var(--color-ink-mid)" }}
        suppressHydrationWarning
      >
        {mounted ? monthShort(now) : dateBadgeSeed.caption}
      </span>
    </div>
  );
}
