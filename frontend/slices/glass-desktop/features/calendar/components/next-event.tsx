// glass-desktop — next-event (calendar family, L tall). Ported from Lucent v4. A
// hero "07 JUL" date over a stack of upcoming event cards, each with a left
// accent bar, closing on a "+N more" line. Cards lift 2px on hover (motion-safe
// only). Stateless/presentational so it needs no "use client". Content only —
// the canvas supplies the glass shell. Numerals use var(--font-numeric).
import { nextEventSeed } from "@/features/glass-desktop/lib/seeds/calendar-2.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

export function NextEvent(_props: WidgetProps) {
  return (
    <div className="flex h-full w-full flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <span
          className="text-5xl font-medium leading-none tabular-nums"
          style={{ color: "var(--color-ink-hi)", fontFamily: "var(--font-numeric)" }}
        >
          {nextEventSeed.bigDay}
        </span>
        <span
          className="text-lg font-semibold uppercase tracking-wide"
          style={{ color: "var(--color-ink-mid)" }}
        >
          {nextEventSeed.bigMonth}
        </span>
      </div>
      <ul className="flex flex-1 flex-col gap-2">
        {nextEventSeed.events.map((event) => (
          <li
            key={event.id}
            className="flex items-center gap-2.5 rounded-[var(--radius-control)] px-2.5 py-2 transition-transform duration-150 ease-out hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            style={{ background: "var(--color-glass-hi)" }}
          >
            <span
              aria-hidden
              className="h-8 w-1 shrink-0 rounded-full"
              style={{ background: event.accent }}
            />
            <span
              className="shrink-0 text-[11px] leading-none tabular-nums"
              style={{ color: "var(--color-ink-mid)", fontFamily: "var(--font-numeric)" }}
            >
              {event.time}
            </span>
            <span
              className="min-w-0 truncate text-xs leading-none"
              style={{ color: "var(--color-ink-hi)" }}
            >
              {event.title}
            </span>
          </li>
        ))}
      </ul>
      <span
        className="text-[11px] font-medium"
        style={{ color: "var(--color-ink-low)" }}
      >
        {`+${nextEventSeed.moreCount} more`}
      </span>
    </div>
  );
}
