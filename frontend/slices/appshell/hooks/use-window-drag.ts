"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import {
  shellStore,
  moveWindow,
  resizeWindow,
  focusWindow,
  toggleMaximize,
  snapWindow,
  snapZoneAt,
} from "../lib/store";
import type { WinId, SnapZone } from "../lib/types";

type ResizeDir = "l" | "r" | "t" | "b" | "tl" | "tr" | "bl" | "br";

// Writes geometry straight to the element's style during the gesture (no React
// state per frame, no desktop re-render) and commits the final rect to the
// store on pointer-up. Mirrors os-rr's rAF drag for a 60fps feel.
export function useWindowDrag(id: WinId, ref: RefObject<HTMLDivElement | null>) {
  const [zone, setZone] = useState<SnapZone | null>(null);
  const raf = useRef(0);
  // Active-gesture teardown. A drag/resize attaches window-level pointer
  // listeners that are normally removed on pointer-up — but if the window
  // unmounts mid-gesture (agent closeWindow / Space switch / tab-merge),
  // pointer-up never fires and the listeners + RAF leak forever. We stash the
  // teardown here and run it on unmount.
  const teardown = useRef<(() => void) | null>(null);
  useEffect(() => () => teardown.current?.(), []);

  // Gesture writes must stay untransitioned: mark the node so useWindowFlip
  // skips store-driven glides while dragging, and strip any live inline
  // transition (a snap glide in flight) so per-frame writes don't smear.
  const gestureOn = useCallback(() => {
    const el = ref.current;
    if (el) { el.dataset.dragging = "1"; el.style.transition = "none"; }
  }, [ref]);
  const gestureOff = useCallback(() => {
    const el = ref.current;
    if (el) { delete el.dataset.dragging; el.style.transition = ""; }
  }, [ref]);

  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const win = shellStore.getWindow(id);
      if (!win) return;
      gestureOn();
      focusWindow(id);
      if (win.maximized) toggleMaximize(id);
      const sx = e.clientX, sy = e.clientY;
      const ox = win.x, oy = win.y;
      let cx = sx, cy = sy, z: SnapZone | null = null;
      const apply = () => {
        raf.current = 0;
        const nx = ox + (cx - sx);
        const ny = Math.max(32, oy + (cy - sy));
        if (ref.current) {
          ref.current.style.left = nx + "px";
          ref.current.style.top = ny + "px";
        }
        z = snapZoneAt(cx, cy);
        setZone(z);
      };
      const move = (ev: PointerEvent) => {
        cx = ev.clientX; cy = ev.clientY;
        if (!raf.current) raf.current = requestAnimationFrame(apply);
      };
      const detach = () => {
        cancelAnimationFrame(raf.current); raf.current = 0;
        gestureOff();
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        teardown.current = null;
      };
      const up = () => {
        detach();
        setZone(null);
        if (z) snapWindow(id, z);
        else if (ref.current) {
          // offsetLeft/Top are relative to the desktop surface (the offset
          // parent) — the same space win.x/win.y live in. getBoundingClientRect
          // is viewport-relative and would add the surface's top offset each drop.
          moveWindow(id, ref.current.offsetLeft, ref.current.offsetTop);
        }
      };
      teardown.current = detach;
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [id, ref, gestureOn, gestureOff],
  );

  const startResize = useCallback(
    (e: React.PointerEvent, dir: ResizeDir) => {
      e.stopPropagation();
      if (e.button !== 0) return;
      const win = shellStore.getWindow(id);
      if (!win) return;
      gestureOn();
      focusWindow(id);
      const sx = e.clientX, sy = e.clientY;
      const ow = win.w, oh = win.h, ox = win.x, oy = win.y;
      let cx = sx, cy = sy;
      const apply = () => {
        raf.current = 0;
        let w = ow, h = oh, x = ox, y = oy;
        if (dir.includes("r")) w = Math.max(300, ow + (cx - sx));
        if (dir.includes("b")) h = Math.max(200, oh + (cy - sy));
        if (dir.includes("l")) { w = Math.max(300, ow - (cx - sx)); x = ox + (ow - w); }
        if (dir.includes("t")) { h = Math.max(200, oh - (cy - sy)); y = oy + (oh - h); }
        const el = ref.current;
        if (el) { el.style.width = w + "px"; el.style.height = h + "px"; el.style.left = x + "px"; el.style.top = y + "px"; }
      };
      const move = (ev: PointerEvent) => {
        cx = ev.clientX; cy = ev.clientY;
        if (!raf.current) raf.current = requestAnimationFrame(apply);
      };
      const detach = () => {
        cancelAnimationFrame(raf.current); raf.current = 0;
        gestureOff();
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        teardown.current = null;
      };
      const up = () => {
        detach();
        const el = ref.current;
        if (el) {
          // offsetLeft/Top are surface-relative (same coordinate space as win.x/y),
          // exactly like the drag commit at the top of this hook. getBoundingClientRect
          // is VIEWPORT-relative, so on the macOS shell (desktop section is top-[30px])
          // it double-counts the 30px menu-bar offset and the window walks down on every
          // resize. offsetWidth/Height are the border-box size, == rect.w/h untransformed.
          moveWindow(id, el.offsetLeft, el.offsetTop);
          resizeWindow(id, el.offsetWidth, el.offsetHeight);
        }
      };
      teardown.current = detach;
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [id, ref, gestureOn, gestureOff],
  );

  return { startDrag, startResize, zone };
}
