"use client";
// glass-desktop — focus-session (timers family, W wide). A pomodoro-style
// running session over a coral RingGauge: "Focus 2/4 · 18:42 · every 30 min".
// State = { accumulatedSec, anchor, session } persisted per instance; elapsed
// derives from an epoch anchor + banked seconds, and the shared 1 Hz clock
// (useClock) drives the re-render — no widget-local interval. Pause banks time;
// skip advances the session and the dot row. Content only (canvas owns shell).
import { useCallback, useEffect } from "react";
import { Pause, Play, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RingGauge } from "@/features/glass-desktop/components/charts";
import { STORAGE } from "@/features/glass-desktop/config/constants";
import { useClock } from "@/features/glass-desktop/hooks/use-clock";
import { usePersistentState } from "@/features/glass-desktop/hooks/use-persistent-state";
import { duration } from "@/features/glass-desktop/utils/format";
import { focusSessionSeed } from "@/features/glass-desktop/lib/seeds/timers-2.seed";
import { cn } from "@/lib/utils";
import type { WidgetProps } from "@/features/glass-desktop/types";

interface FocusState {
  accumulatedSec: number;
  anchor: number | null; // epoch ms of the running segment; null = paused
  session: number; // 1-based
}

function elapsedSec(s: FocusState, now: number): number {
  return s.accumulatedSec + (s.anchor != null ? Math.max(0, Math.floor((now - s.anchor) / 1000)) : 0);
}

export function FocusSession({ instanceId }: WidgetProps) {
  const seed = focusSessionSeed;
  const [state, setState] = usePersistentState<FocusState>(`${STORAGE.timers}:focus:${instanceId}`, {
    accumulatedSec: seed.elapsedSec,
    anchor: seed.running ? Date.now() : null,
    session: seed.currentSession,
  });
  useClock("second"); // shared tick → re-render while running

  const now = Date.now();
  const elapsed = Math.min(elapsedSec(state, now), seed.durationSec);
  const remaining = seed.durationSec - elapsed;
  const pct = (elapsed / seed.durationSec) * 100;
  const running = state.anchor != null;

  const advance = useCallback(() => {
    setState((s) => ({
      accumulatedSec: 0,
      anchor: s.anchor != null ? Date.now() : null,
      session: (s.session % seed.totalSessions) + 1,
    }));
  }, [setState, seed.totalSessions]);

  // Roll to the next session the moment the current one completes.
  useEffect(() => {
    if (running && remaining <= 0) advance();
  }, [running, remaining, advance]);

  const toggle = useCallback(() => {
    setState((s) =>
      s.anchor != null
        ? { ...s, accumulatedSec: elapsedSec(s, Date.now()), anchor: null }
        : { ...s, anchor: Date.now() },
    );
  }, [setState]);

  return (
    <div className="flex h-full w-full items-center gap-3">
      <RingGauge
        value={pct}
        size={64}
        thickness={6}
        color={seed.ringColor}
        label={`${seed.label} ${state.session} of ${seed.totalSessions}`}
        showValue={false}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex min-w-0 items-baseline gap-1.5">
          <span className="text-sm font-semibold" style={{ color: "var(--color-ink-hi)" }}>
            {seed.label}
          </span>
          <span
            className="text-sm font-medium tabular-nums"
            style={{ color: "var(--color-ink-mid)", fontFamily: "var(--font-numeric)" }}
          >
            {state.session}/{seed.totalSessions}
          </span>
        </div>
        <span
          className="text-2xl font-medium leading-none tabular-nums"
          style={{ color: "var(--color-ink-hi)", fontFamily: "var(--font-numeric)" }}
        >
          {duration(remaining)}
        </span>
        <span className="text-[10px]" style={{ color: "var(--color-ink-low)" }}>
          {seed.everyLabel}
        </span>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {Array.from({ length: seed.totalSessions }, (_, i) => (
              <span
                key={i}
                className="rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  background: i < state.session ? seed.ringColor : "var(--color-hairline)",
                  opacity: i === state.session - 1 ? 1 : i < state.session ? 0.55 : 1,
                }}
              />
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={running ? seed.pauseLabel : seed.resumeLabel}
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
              aria-label={seed.skipLabel}
              onClick={advance}
              className="rounded-full [background:var(--color-glass-solid)]"
            >
              <SkipForward style={{ color: "var(--color-ink-mid)" }} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
