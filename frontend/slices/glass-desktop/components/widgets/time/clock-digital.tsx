"use client";
// glass-desktop — clock-digital (time family, WP wide pill). Ported from Lucent
// v4. Renders the current wall-clock face, ticking once per second off the shared
// ClockProvider (never its own interval). Content only — the canvas supplies the
// glass pill shell around it. Numerals use var(--font-numeric).
import { useClock } from "@/features/glass-desktop/hooks/use-clock";
import { useMounted } from "@/features/glass-desktop/hooks/use-mounted";
import { clockFace } from "@/features/glass-desktop/utils/format";
import { clockDigitalSeed } from "@/features/glass-desktop/lib/seeds/time.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

export function ClockDigital(_props: WidgetProps) {
  const now = useClock("second");
  const mounted = useMounted();
  const face = clockFace(now); // "HH:MM:SS"
  const [hm, ss] = [face.slice(0, 5), face.slice(6)];

  return (
    <div className="flex h-full w-full items-center justify-between gap-2">
      <div className="flex items-baseline gap-1 tabular-nums">
        <span
          className="text-3xl font-medium leading-none"
          style={{ color: "var(--color-ink-hi)", fontFamily: "var(--font-numeric)" }}
          suppressHydrationWarning
        >
          {mounted ? hm : "--:--"}
        </span>
        <span
          className="text-base leading-none"
          style={{ color: "var(--color-ink-mid)", fontFamily: "var(--font-numeric)" }}
          suppressHydrationWarning
        >
          {mounted ? ss : "--"}
        </span>
      </div>
      <span
        className="text-[11px] font-medium uppercase tracking-wide"
        style={{ color: "var(--color-ink-low)" }}
      >
        {clockDigitalSeed.zoneLabel}
      </span>
    </div>
  );
}
