// glass-desktop — agenda-today (calendar family, S square). Ported from Lucent
// v4. A compact list of the day's events, each a colour-dotted time + title row.
// Stateless/presentational (no clock, no storage) so it needs no "use client".
// Content only — the canvas supplies the glass shell. Times use var(--font-numeric).
import { agendaTodaySeed, dateBadgeSeed } from "@/features/glass-desktop/lib/seeds/calendar.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

export function AgendaToday(_props: WidgetProps) {
  return (
    <div className="flex h-full w-full flex-col gap-1.5">
      <span
        className="text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: "var(--color-ink-low)" }}
      >
        {dateBadgeSeed.caption}
      </span>
      <ul className="flex flex-1 flex-col justify-center gap-2">
        {agendaTodaySeed.map((event) => (
          <li key={event.id} className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-1.5 shrink-0 rounded-full"
              style={{ background: event.accent }}
            />
            <span
              className="shrink-0 text-[11px] leading-none tabular-nums"
              style={{ color: "var(--color-ink-mid)", fontFamily: "var(--font-numeric)" }}
            >
              {event.time}
            </span>
            <span
              className="truncate text-xs leading-none"
              style={{ color: "var(--color-ink-hi)" }}
            >
              {event.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
