"use client";

import * as React from "react";

const MIN_RATIO = 0.15;
const MAX_RATIO = 0.85;

interface Options {
  /** localStorage key for persisting the ratio. Omit to disable persistence. */
  storageKey?: string;
  /** Initial ratio (0–1) when nothing is persisted. Default 0.5. */
  initial?: number;
}

interface Result {
  ratio: number;
  setRatio: (r: number) => void;
  resetRatio: () => void;
  /** Pointer-down handler — wire on the divider element. */
  onDragStart: (
    event: React.PointerEvent<HTMLElement>,
    container: HTMLElement | null,
    orientation: "horizontal" | "vertical",
  ) => void;
  /** Whether a drag gesture is currently active. */
  dragging: boolean;
}

/**
 * Manages the split ratio between two panes plus the drag interaction.
 * Persists to localStorage when `storageKey` is given so the divider
 * position survives reloads.
 */
export function useSplitRatio({ storageKey, initial = 0.5 }: Options = {}): Result {
  const [ratio, setRatioState] = React.useState<number>(() => clamp(initial));
  const [dragging, setDragging] = React.useState(false);

  React.useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    const stored = window.localStorage.getItem(storageKey);
    const parsed = stored ? Number.parseFloat(stored) : NaN;
    if (Number.isFinite(parsed)) setRatioState(clamp(parsed));
  }, [storageKey]);

  const setRatio = React.useCallback(
    (r: number) => {
      const next = clamp(r);
      setRatioState(next);
      if (storageKey && typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, next.toFixed(4));
      }
    },
    [storageKey],
  );

  const resetRatio = React.useCallback(() => setRatio(0.5), [setRatio]);

  const onDragStart = React.useCallback(
    (
      event: React.PointerEvent<HTMLElement>,
      container: HTMLElement | null,
      orientation: "horizontal" | "vertical",
    ) => {
      if (!container) return;
      event.preventDefault();
      setDragging(true);
      const rect = container.getBoundingClientRect();

      const move = (e: PointerEvent) => {
        const next =
          orientation === "horizontal"
            ? (e.clientX - rect.left) / rect.width
            : (e.clientY - rect.top) / rect.height;
        setRatio(next);
      };

      const stop = () => {
        setDragging(false);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", stop);
        window.removeEventListener("pointercancel", stop);
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", stop);
      window.addEventListener("pointercancel", stop);
    },
    [setRatio],
  );

  return { ratio, setRatio, resetRatio, onDragStart, dragging };
}

function clamp(r: number): number {
  if (!Number.isFinite(r)) return 0.5;
  return Math.max(MIN_RATIO, Math.min(MAX_RATIO, r));
}
