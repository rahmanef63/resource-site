import { renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  elapsedMs,
  remainingMs,
  isRunning,
  useTimer,
  type TimerState,
} from "./use-timer";

beforeEach(() => {
  localStorage.clear();
});

describe("epoch-anchored math", () => {
  it("computes remaining from the anchor while running", () => {
    const s: TimerState = { durationMs: 300_000, accumulatedMs: 0, anchor: 1_000_000 };
    expect(remainingMs(s, 1_000_000 + 100_000)).toBe(200_000);
    expect(isRunning(s, 1_000_000 + 100_000)).toBe(true);
  });

  it("survives a reload mid-run (JSON round-trip + fresh wall clock)", () => {
    const s: TimerState = { durationMs: 300_000, accumulatedMs: 0, anchor: 1_000_000 };
    // Persist, then rehydrate exactly as the hook does after a page reload.
    const restored = JSON.parse(JSON.stringify(s)) as TimerState;
    // 150s of real time elapsed since the anchor, across the "reload".
    expect(remainingMs(restored, 1_000_000 + 150_000)).toBe(150_000);
  });

  it("banks elapsed time on pause, then holds steady", () => {
    const running: TimerState = { durationMs: 300_000, accumulatedMs: 0, anchor: 1_000_000 };
    const paused: TimerState = {
      durationMs: 300_000,
      accumulatedMs: elapsedMs(running, 1_000_000 + 100_000),
      anchor: null,
    };
    expect(paused.accumulatedMs).toBe(100_000);
    // Time keeps passing but a paused timer does not drain.
    expect(remainingMs(paused, 9_999_999_999)).toBe(200_000);
    expect(isRunning(paused, 9_999_999_999)).toBe(false);
  });
});

describe("useTimer completion", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires onComplete exactly once when the countdown drains", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTimer(2, { id: "done-once", onComplete }));

    expect(result.current.running).toBe(false);
    act(() => {
      result.current.start();
    });
    expect(result.current.running).toBe(true);

    // Blow well past the 2s duration — the single setTimeout must fire once.
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(result.current.running).toBe(false);
    expect(result.current.left).toBe(0);
  });

  it("does not fire before the countdown reaches zero", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTimer(10, { id: "not-yet", onComplete }));
    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onComplete).not.toHaveBeenCalled();
    expect(result.current.running).toBe(true);
  });

  it("resumes a persisted running timer after a simulated remount", () => {
    const onComplete = vi.fn();
    const first = renderHook(() => useTimer(4, { id: "resume", onComplete }));
    act(() => {
      first.result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(1000); // 1s in, 3s left
    });
    first.unmount(); // "reload" — state is in localStorage under STORAGE.timers

    const second = renderHook(() => useTimer(4, { id: "resume", onComplete }));
    expect(second.result.current.running).toBe(true);
    // Remaining 3s of a 4s timer; finish it off.
    act(() => {
      vi.advanceTimersByTime(3500);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
