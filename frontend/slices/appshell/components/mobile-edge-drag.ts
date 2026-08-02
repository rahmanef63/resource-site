"use client";

// iOS NC/CC top-edge pull gesture (P2 ios-nc-cc-drag-follow, the mobile-home
// half). Real iOS tracks the finger 1:1 from the first pixel instead of
// firing at a fixed threshold, and decides open-vs-closed on release by
// distance + velocity.
//
// PROP CONTRACT with the receiving overlays (owned by other agents this
// round): `onDrag(side, progress)` fires continuously while the finger moves
// (progress 0→1); `onEnd(side, open)` fires once on release. mobile-shell.tsx
// (the nearest shared ancestor of this gesture and both overlays) is the
// wiring point — it already threads a live `progress` into MobileNotifications'
// `dragProgress` prop and Control Center's `dragProgress` prop (via the Slot's
// new `slotProps`), so those sheets genuinely track the finger. If a future
// caller doesn't wire onDrag/onEnd through to a drag-aware overlay, the
// fallback is graceful: nothing tracks visually, and the only observable
// effect is the release decision — equivalent to today's instant open/close.
import type { PointerEvent as ReactPointerEvent } from "react";

export type EdgeSide = "nc" | "cc";

const OPEN_DISTANCE = 160; // px of pull that reads as "fully open" (progress 1)
const OPEN_DY = 40; // px — matches the old fixed threshold, kept as the distance half of the release decision
const OPEN_VELOCITY = 0.6; // px/ms — a fast short flick also opens

export function useEdgeDrag(
  hasNotifications: boolean,
  onDrag: (side: EdgeSide, progress: number) => void,
  onEnd: (side: EdgeSide, open: boolean) => void,
) {
  return (e: ReactPointerEvent) => {
    const sy = e.clientY;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    // Real iPhone: LEFT half of the top edge → Notification Center, RIGHT →
    // Control Center. No NC wired (hasNotifications=false) → always CC,
    // matching the pre-drag-follow fallback.
    const side: EdgeSide = e.clientX - rect.left < rect.width / 2 && hasNotifications ? "nc" : "cc";
    let dy = 0;
    let v = 0;
    let lastT = performance.now();
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    const move = (ev: PointerEvent) => {
      dy = Math.max(0, ev.clientY - sy);
      const t = performance.now();
      const dt = t - lastT || 1;
      v = dy / dt;
      lastT = t;
      onDrag(side, Math.min(1, dy / OPEN_DISTANCE));
    };
    const up = () => {
      const open = dy > OPEN_DY || v > OPEN_VELOCITY;
      cleanup();
      onEnd(side, open);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
}
