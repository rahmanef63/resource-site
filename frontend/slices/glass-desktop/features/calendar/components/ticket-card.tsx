// glass-desktop — ticket-card (calendar family, WP wide-short). Ported from
// Lucent v4. A single issue-tracker row: reference, title, and an "In progress —
// Today" status line led by an amber (warn-tone) status dot. Stateless/
// presentational so it needs no "use client". Content only — the canvas supplies
// the glass shell.
import { ticketCardSeed } from "@/features/glass-desktop/lib/seeds/calendar-2.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

export function TicketCard(_props: WidgetProps) {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-1.5">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="size-2 shrink-0 rounded-full"
          style={{ background: ticketCardSeed.tone }}
        />
        <span
          className="shrink-0 text-[11px] font-semibold uppercase tracking-wide tabular-nums"
          style={{ color: "var(--color-ink-mid)", fontFamily: "var(--font-numeric)" }}
        >
          {ticketCardSeed.ref}
        </span>
      </div>
      <span
        className="truncate text-sm leading-tight"
        style={{ color: "var(--color-ink-hi)" }}
      >
        {ticketCardSeed.title}
      </span>
      <span
        className="text-[11px] leading-none"
        style={{ color: "var(--color-ink-low)" }}
      >
        {`${ticketCardSeed.status} — ${ticketCardSeed.due}`}
      </span>
    </div>
  );
}
