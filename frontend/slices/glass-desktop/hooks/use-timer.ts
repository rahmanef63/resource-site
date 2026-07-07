"use client";
// glass-desktop — epoch-anchored countdown (Build Plan §6.2 rr:...:timers, §7).
// State = { durationMs, accumulatedMs, anchor }. Elapsed derives from an epoch
// anchor (Date.now() at the start of the current running segment) plus the ms
// banked from earlier segments — so correctness survives a reload mid-run and a
// hidden tab (rAF pausing is harmless; math is recomputed from wall-clock).
// A single setTimeout guarantees completion fires EXACTLY once; rAF only drives
// the display while running. Persisted under STORAGE.timers keyed by id.
import { useCallback, useEffect, useRef, useState } from "react";
import { STORAGE } from "@/features/glass-desktop/config/constants";

export interface TimerState {
  durationMs: number;
  accumulatedMs: number; // banked ms from previous running segments
  anchor: number | null; // Date.now() when the current segment started; null = paused
}

// ---- pure math (unit-tested directly; no React, no clock) ------------------
export function elapsedMs(s: TimerState, now: number): number {
  return s.accumulatedMs + (s.anchor != null ? Math.max(0, now - s.anchor) : 0);
}
export function remainingMs(s: TimerState, now: number): number {
  return Math.max(0, s.durationMs - elapsedMs(s, now));
}
export function isRunning(s: TimerState, now: number): boolean {
  return s.anchor != null && remainingMs(s, now) > 0;
}

// ---- persistence (whole map under one key) ---------------------------------
function readAll(): Record<string, TimerState> {
  try {
    const raw = localStorage.getItem(STORAGE.timers);
    return raw ? (JSON.parse(raw) as Record<string, TimerState>) : {};
  } catch {
    return {};
  }
}
function writeOne(id: string, s: TimerState): void {
  try {
    const all = readAll();
    all[id] = s;
    localStorage.setItem(STORAGE.timers, JSON.stringify(all));
  } catch {
    /* storage unavailable — run in-memory */
  }
}

export interface UseTimerResult {
  left: number; // seconds remaining (fractional)
  running: boolean;
  start(): void;
  pause(): void;
  reset(): void;
}

export function useTimer(
  durationSec: number,
  opts?: { id?: string; onComplete?: () => void },
): UseTimerResult {
  const id = opts?.id ?? "default";
  const durationMs = Math.round(durationSec * 1000);
  const onCompleteRef = useRef(opts?.onComplete);
  onCompleteRef.current = opts?.onComplete;

  const [state, setState] = useState<TimerState>(() => {
    const saved = readAll()[id];
    if (saved && saved.durationMs === durationMs) return saved;
    return { durationMs, accumulatedMs: 0, anchor: null };
  });
  const [, forceTick] = useState(0); // rAF-driven display refresh
  const completedRef = useRef(false);

  useEffect(() => {
    writeOne(id, state);
  }, [id, state]);

  const fireComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setState((s) => ({ durationMs: s.durationMs, accumulatedMs: s.durationMs, anchor: null }));
    onCompleteRef.current?.();
  }, []);

  // Tick + completion — active only while a segment is running.
  useEffect(() => {
    if (state.anchor == null) return;
    const remaining = remainingMs(state, Date.now());
    if (remaining <= 0) {
      fireComplete();
      return;
    }
    const done = setTimeout(fireComplete, remaining); // fires once, tab-hidden safe
    let raf = 0;
    const loop = () => {
      forceTick((n) => n + 1);
      if (remainingMs(state, Date.now()) > 0) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onVisible = () => {
      if (document.visibilityState === "visible") forceTick((n) => n + 1);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(done);
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [state, fireComplete]);

  const start = useCallback(() => {
    setState((s) => {
      if (s.anchor != null) return s; // already running
      if (remainingMs(s, Date.now()) <= 0) return s; // nothing left
      completedRef.current = false;
      return { ...s, anchor: Date.now() };
    });
  }, []);

  const pause = useCallback(() => {
    setState((s) => {
      if (s.anchor == null) return s;
      return { durationMs: s.durationMs, accumulatedMs: elapsedMs(s, Date.now()), anchor: null };
    });
  }, []);

  const reset = useCallback(() => {
    completedRef.current = false;
    setState({ durationMs, accumulatedMs: 0, anchor: null });
  }, [durationMs]);

  const now = Date.now();
  return {
    left: remainingMs(state, now) / 1000,
    running: isRunning(state, now),
    start,
    pause,
    reset,
  };
}
