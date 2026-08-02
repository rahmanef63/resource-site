// glass-desktop — date-card (time family, S square). A calm static date plate:
// the weekday caption over a large long-date title (Build Plan §7 marks this one
// "static", so it reads straight from the seed — no clock, no hooks, no client
// boundary). Content only — the canvas supplies the glass shell.
import { dateCardSeed } from "@/features/glass-desktop/lib/seeds/time-2.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

export function DateCard(_props: WidgetProps) {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-1">
      <span
        className="text-sm font-medium uppercase tracking-wide"
        style={{ color: "var(--color-accent-coral)" }}
      >
        {dateCardSeed.caption}
      </span>
      <span
        className="text-3xl font-semibold leading-tight"
        style={{ color: "var(--color-ink-hi)" }}
      >
        {dateCardSeed.title}
      </span>
    </div>
  );
}
