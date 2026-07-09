"use client";
// glass-desktop — voice-memo (timers family, WP wide pill). A SIMULATED voice
// recorder (no microphone API): the elapsed readout counts up while recording
// and a 24-bar EqBars waveform pulses in lock-step. State = { accumulatedSec,
// anchor } — elapsed derives from an epoch anchor + banked seconds, driven by
// the shared 1 Hz clock (no widget-local interval). Pause banks time; stop
// resets to zero. Content only — the canvas supplies the glass pill shell.
import { useCallback } from "react";
import { Mic, Pause, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EqBars } from "@/features/glass-desktop/components/charts";
import { STORAGE } from "@/features/glass-desktop/config/constants";
import { useClock } from "@/features/glass-desktop/hooks/use-clock";
import { usePersistentState } from "@/features/glass-desktop/hooks/use-persistent-state";
import { duration } from "@/features/glass-desktop/utils/format";
import { voiceMemoSeed } from "@/features/glass-desktop/lib/seeds/timers-2.seed";
import { cn } from "@/lib/utils";
import type { WidgetProps } from "@/features/glass-desktop/types";

interface MemoState {
  accumulatedSec: number;
  anchor: number | null; // epoch ms while recording; null = paused
}

function memoElapsed(s: MemoState, now: number): number {
  return s.accumulatedSec + (s.anchor != null ? Math.max(0, Math.floor((now - s.anchor) / 1000)) : 0);
}

export function VoiceMemo({ instanceId }: WidgetProps) {
  const seed = voiceMemoSeed;
  const [state, setState] = usePersistentState<MemoState>(`${STORAGE.timers}:memo:${instanceId}`, {
    accumulatedSec: seed.elapsedSec,
    anchor: seed.recording ? Date.now() : null,
  });
  useClock("second"); // shared tick → re-render while recording

  const recording = state.anchor != null;
  const secs = memoElapsed(state, Date.now());

  const toggle = useCallback(() => {
    setState((s) =>
      s.anchor != null
        ? { accumulatedSec: memoElapsed(s, Date.now()), anchor: null }
        : { accumulatedSec: s.accumulatedSec, anchor: Date.now() },
    );
  }, [setState]);

  const stop = useCallback(() => {
    setState({ accumulatedSec: 0, anchor: null });
  }, [setState]);

  return (
    <div className="flex h-full w-full items-center gap-2.5">
      <span
        className="text-2xl font-medium leading-none tabular-nums"
        style={{ color: "var(--color-ink-hi)", fontFamily: "var(--font-numeric)" }}
      >
        {duration(secs)}
      </span>
      <div className={cn("flex min-w-0 flex-1 items-center overflow-hidden")}>
        <EqBars playing={recording} bars={seed.bars} color={seed.color} height={26} barWidth={2} gap={1} />
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={recording ? seed.pauseLabel : seed.resumeLabel}
          onClick={toggle}
          className="rounded-full [background:var(--color-glass-solid)]"
        >
          {recording ? (
            <Pause style={{ color: "var(--color-ink-hi)" }} />
          ) : (
            <Mic style={{ color: "var(--color-accent-coral)" }} />
          )}
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={seed.stopLabel}
          onClick={stop}
          className="rounded-full [background:var(--color-glass-solid)]"
        >
          <Square style={{ color: "var(--color-ink-mid)" }} />
        </Button>
      </div>
    </div>
  );
}
