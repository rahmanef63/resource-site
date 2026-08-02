"use client";
// glass-desktop — timer-countdown (timers family, WP wide pill). Ported from
// Lucent v4. An epoch-anchored countdown via useTimer (survives reload / hidden
// tab, persisted under STORAGE.timers keyed by instanceId). Play/Pause + Reset
// are shadcn Buttons. Content only — the canvas supplies the
// glass pill shell. Readout uses var(--font-numeric).
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimer } from "@/features/glass-desktop/hooks/use-timer";
import { duration } from "@/features/glass-desktop/utils/format";
import { timerCountdownSeed } from "@/features/glass-desktop/lib/seeds/timers.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

export function TimerCountdown({ instanceId }: WidgetProps) {
  const seed = timerCountdownSeed;
  const { left, running, start, pause, reset } = useTimer(seed.durationSec, { id: instanceId });

  return (
    <div className="flex h-full w-full items-center justify-between gap-2">
      <div className="flex min-w-0 flex-col">
        <span
          className="text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: "var(--color-ink-low)" }}
        >
          {seed.label}
        </span>
        <span
          className="text-2xl font-medium leading-none tabular-nums"
          style={{ color: "var(--color-ink-hi)", fontFamily: "var(--font-numeric)" }}
        >
          {duration(Math.ceil(left))}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={running ? seed.pauseLabel : seed.startLabel}
          onClick={running ? pause : start}
          className="rounded-full [background:var(--color-glass-solid)]"
        >
          {running ? (
            <Pause style={{ color: "var(--color-ink-hi)" }} />
          ) : (
            <Play style={{ color: "var(--color-accent-green)" }} />
          )}
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={seed.resetLabel}
          onClick={reset}
          className="rounded-full [background:var(--color-glass-solid)]"
        >
          <RotateCcw style={{ color: "var(--color-ink-mid)" }} />
        </Button>
      </div>
    </div>
  );
}
