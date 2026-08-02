// glass-desktop — calendar-month (calendar family, W square). Ported from Lucent
// v4. A mini July grid: single-letter weekday heads over a Mon-first run of day
// numbers, today (7) filled accent-blue. Stateless/presentational (no clock, no
// storage) so it needs no "use client". Content only — the canvas supplies the
// glass shell. Numerals use var(--font-numeric).
import { cn } from "@/lib/utils";
import { calendarMonthSeed } from "@/features/glass-desktop/lib/seeds/calendar-2.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

const cells = (() => {
  const { leadingBlanks, daysInMonth } = calendarMonthSeed;
  const out: Array<number | null> = [];
  for (let i = 0; i < leadingBlanks; i += 1) out.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) out.push(d);
  return out;
})();

export function CalendarMonth(_props: WidgetProps) {
  return (
    <div className="flex h-full w-full flex-col gap-1.5">
      <span
        className="text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: "var(--color-ink-low)" }}
      >
        {calendarMonthSeed.month}
      </span>
      <div className="grid grid-cols-7 gap-0.5">
        {calendarMonthSeed.weekdays.map((wd, i) => (
          <span
            key={`h-${i}`}
            aria-hidden
            className="text-center text-[9px] font-medium uppercase leading-none"
            style={{ color: "var(--color-ink-low)" }}
          >
            {wd}
          </span>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          const isToday = day === calendarMonthSeed.today;
          return (
            <span
              key={`d-${i}`}
              className={cn(
                "flex items-center justify-center rounded-full text-[10px] leading-none tabular-nums",
              )}
              style={{
                fontFamily: "var(--font-numeric)",
                color: isToday ? "var(--color-canvas)" : "var(--color-ink-mid)",
                background: isToday ? "var(--color-accent-blue)" : "transparent",
              }}
            >
              {day ?? ""}
            </span>
          );
        })}
      </div>
    </div>
  );
}
