"use client";

// glass-desktop — pointer-events widget drag (Build Plan §T7).
// Ported from ui_kits/desktop/v4.html SpaceCanvas.start (~line 402).
// Design: transform-only while dragging via direct DOM writes on the captured
// element = ZERO React re-renders per pointermove. State (which cell to land in)
// lives in per-drag closures, not useState. Only the drop commits — one render,
// driven by the layout hook. 4px slop, ghost snap-target preview, Esc cancels.
import { useCallback, type PointerEvent as RPointerEvent, type RefObject } from "react";
import { GRID, Z } from "@/features/glass-desktop/config/constants";
import { cellToPx } from "@/features/glass-desktop/utils/grid";

/** Never start a drag from a real control inside a widget. */
const INTERACTIVE =
  'button,input,textarea,select,a,[role="switch"],[role="checkbox"],[role="slider"],[role="menuitem"]';
/** Movement (px, taxicab) before a press becomes a drag. */
const SLOP = 4;

export interface UseDragWidgetOptions {
  /** Only wire drag in edit mode; otherwise onPointerDown is inert. */
  enabled: boolean;
  /** Cell span of an instance, so the ghost + clamp use the right footprint. */
  sizeOf: (instanceId: string) => { c: number; r: number };
  /** Commit a drop: snap→collision-resolve→persist happens in the layout hook. */
  onDrop: (instanceId: string, col: number, row: number) => void;
  /** The single canvas-owned ghost element the hook positions during a drag. */
  ghostRef: RefObject<HTMLDivElement | null>;
}

export interface UseDragWidget {
  onPointerDown: (instanceId: string, e: RPointerEvent<HTMLElement>) => void;
}

/** Pointer-drag controller for one canvas. All motion is imperative (refs). */
export function useDragWidget(opts: UseDragWidgetOptions): UseDragWidget {
  const { enabled, sizeOf, onDrop, ghostRef } = opts;

  const onPointerDown = useCallback(
    (instanceId: string, e: RPointerEvent<HTMLElement>) => {
      if (!enabled || e.button !== 0) return;
      if ((e.target as HTMLElement).closest(INTERACTIVE)) return;

      const el = e.currentTarget;
      const { c, r } = sizeOf(instanceId);
      const stepX = GRID.cellW + GRID.gap;
      const stepY = GRID.cellH + GRID.gap;
      const baseCol = Math.round(el.offsetLeft / stepX);
      const baseRow = Math.round(el.offsetTop / stepY);
      const startX = e.clientX;
      const startY = e.clientY;
      const pid = e.pointerId;
      const ghost = ghostRef.current;
      try {
        el.setPointerCapture(pid);
      } catch {
        /* capture unsupported — window listeners still track the pointer */
      }

      let moved = false;
      let cancelled = false;
      let col = baseCol;
      let row = baseRow;

      const move = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (!moved && Math.abs(dx) + Math.abs(dy) < SLOP) return;
        if (!moved) {
          moved = true;
          el.style.transition = "none";
          el.style.zIndex = String(Z.drag);
          el.style.cursor = "grabbing";
          el.style.boxShadow = "var(--shadow-drag)";
          if (ghost) ghost.style.display = "block";
        }
        el.style.transform = `translate(${dx}px, ${dy}px) scale(1.02)`;
        col = Math.max(0, Math.min(GRID.cols - c, Math.round((baseCol * stepX + dx) / stepX)));
        row = Math.max(0, Math.round((baseRow * stepY + dy) / stepY));
        if (ghost) {
          const g = cellToPx(col, row, c, r);
          ghost.style.left = `${g.left}px`;
          ghost.style.top = `${g.top}px`;
          ghost.style.width = `${g.width}px`;
          ghost.style.height = `${g.height}px`;
          ghost.style.borderRadius = r === 1 ? "var(--radius-pill)" : "var(--radius-widget)";
        }
      };

      const finish = (commit: boolean) => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
        el.removeEventListener("pointercancel", cancel);
        window.removeEventListener("keydown", key);
        try {
          el.releasePointerCapture(pid);
        } catch {
          /* already released */
        }
        // React can't reset styles it thinks are unchanged — clear them ourselves.
        el.style.transform = "";
        el.style.transition = "";
        el.style.zIndex = "";
        el.style.cursor = "";
        el.style.boxShadow = "";
        if (ghost) ghost.style.display = "none";
        if (commit && moved && !cancelled) onDrop(instanceId, col, row);
      };

      const up = () => finish(true);
      const cancel = () => {
        cancelled = true;
        finish(false);
      };
      const key = (ev: KeyboardEvent) => {
        if (ev.key !== "Escape") return;
        cancelled = true;
        finish(false);
      };

      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", cancel);
      window.addEventListener("keydown", key);
    },
    [enabled, sizeOf, onDrop, ghostRef],
  );

  return { onPointerDown };
}
