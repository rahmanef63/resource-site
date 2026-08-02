"use client";
// glass-desktop — stopwatch (timers family, WP wide pill). A count-UP stopwatch
// reading deciseconds ("0:13.0"). State = { accumulatedMs, anchor }: elapsed
// derives from an epoch anchor (Date.now() at the start of the running segment)
// plus ms banked from earlier segments, so the readout is correct even after a
// hidden tab. A rAF loop drives the display ONLY while running; when paused the
// component is idle. Content only — the canvas supplies the glass pill shell.
import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { duration } from "@/features/glass-desktop/utils/format";
import { stopwatchSeed } from "@/features/glass-desktop/lib/seeds/timers-2.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

interface SwState {
  accumulatedMs: number;
  anchor: number | null; // Date.now() of the current segment; null = paused
}

function elapsed(s: SwState, now: number): number {
  return s.accumulatedMs + (s.anchor != null ? Math.max(0, now - s.anchor) : 0);
}

export function Stopwatch(_props: WidgetProps) {
  const seed = stopwatchSeed;
  const [state, setState] = useState<SwState>({ accumulatedMs: 0, anchor: null });
  const [, forceTick] = useState(0); // rAF-driven display refresh
  const running = state.anchor != null;

  // rAF loop — mounted only while a segment is running.
  useEffect(() => {
    if (state.anchor == null) return;
    let raf = 0;
    const loop = () => {
      forceTick((n) => n + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [state.anchor]);

  const toggle = useCallback(() => {
    setState((s) =>
      s.anchor != null
        ? { accumulatedMs: elapsed(s, Date.now()), anchor: null }
        : { accumulatedMs: s.accumulatedMs, anchor: Date.now() },
    );
  }, []);

  const reset = useCallback(() => {
    setState({ accumulatedMs: 0, anchor: null });
  }, []);

  const secs = elapsed(state, Date.now()) / 1000;

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
          {duration(secs, { deci: true })}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={running ? seed.pauseLabel : seed.startLabel}
          onClick={toggle}
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
