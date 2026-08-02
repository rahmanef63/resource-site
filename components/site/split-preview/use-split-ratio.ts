"use client";

import * as React from "react";

const MIN_RATIO = 0.15;
const MAX_RATIO = 0.85;
const CSS_VAR = "--split-ratio";

interface Options {
  /** localStorage key for persisting the ratio. Omit to disable persistence. */
  storageKey?: string;
  /** Initial ratio (0–1) when nothing is persisted. Default 0.5. */
  initial?: number;
}

interface Result {
  /** Committed ratio. Updated only on pointerup — DO NOT use during drag. */
  ratio: number;
  /** Apply this as inline style on the split container — exposes --split-ratio. */
  containerStyle: React.CSSProperties;
  /** Apply this as inline style on the LEFT (or TOP) pane wrapper. */
  leftPaneStyle: React.CSSProperties;
  /** Pointer-down handler — wire on the divider. */
  onDragStart: (
    event: React.PointerEvent<HTMLElement>,
    container: HTMLElement | null,
    orientation: "horizontal" | "vertical",
  ) => void;
  /** True while the user is actively dragging. */
  dragging: boolean;
  /** Reset to 50/50 + persist. */
  resetRatio: () => void;
}

/**
 * Split-pane drag controller.
 *
 * Performance contract: during drag we mutate `--split-ratio` directly on
 * the container DOM node — no React re-render fires until pointerup. This
 * keeps 60fps smoothness regardless of how heavy the panes are (iframes,
 * code blocks, etc).
 *
 * On pointerup we commit the final ratio to React state + localStorage.
 * The divider receives setPointerCapture so the cursor moving over an
 * iframe doesn't drop the drag gesture.
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

  const resetRatio = React.useCallback(() => {
    setRatioState(0.5);
    if (storageKey && typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, "0.5");
    }
  }, [storageKey]);

  const onDragStart = React.useCallback(
    (
      event: React.PointerEvent<HTMLElement>,
      container: HTMLElement | null,
      orientation: "horizontal" | "vertical",
    ) => {
      if (!container) return;
      event.preventDefault();
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        /* setPointerCapture can throw if the element is detached */
      }
      setDragging(true);

      const rect = container.getBoundingClientRect();
      let last = clamp(
        orientation === "horizontal"
          ? (event.clientX - rect.left) / rect.width
          : (event.clientY - rect.top) / rect.height,
      );
      container.style.setProperty(CSS_VAR, String(last));

      const move = (e: PointerEvent) => {
        last = clamp(
          orientation === "horizontal"
            ? (e.clientX - rect.left) / rect.width
            : (e.clientY - rect.top) / rect.height,
        );
        container.style.setProperty(CSS_VAR, String(last));
      };

      const stop = () => {
        setDragging(false);
        setRatioState(last);
        if (storageKey && typeof window !== "undefined") {
          window.localStorage.setItem(storageKey, last.toFixed(4));
        }
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", stop);
        window.removeEventListener("pointercancel", stop);
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", stop);
      window.addEventListener("pointercancel", stop);
    },
    [storageKey],
  );

  const containerStyle = React.useMemo<React.CSSProperties>(
    () => ({ [CSS_VAR]: String(ratio) } as React.CSSProperties),
    [ratio],
  );

  const leftPaneStyle = React.useMemo<React.CSSProperties>(
    () => ({ flex: `0 0 calc(var(${CSS_VAR}) * 100%)` }),
    [],
  );

  return { ratio, containerStyle, leftPaneStyle, onDragStart, dragging, resetRatio };
}

function clamp(r: number): number {
  if (!Number.isFinite(r)) return 0.5;
  return Math.max(MIN_RATIO, Math.min(MAX_RATIO, r));
}
