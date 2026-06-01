"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KonvaEventObject } from "konva/lib/Node";
import { useEditor } from "../lib/store";

const MIN = 0.05;
const MAX = 8;
const clampZoom = (z: number) => Math.min(MAX, Math.max(MIN, z));

// Canvas navigation: wheel zoom-to-cursor, hand/space drag-pan, 2-finger pinch
// (mobile), and fit-to-screen. The doc group is positioned purely by `pan` and
// scaled by `zoom` (no separate centering term) so the zoom math stays simple:
//   pointInDoc = (pointer - pan) / zoom ;  pan' = pointer - pointInDoc * zoom'.
export function useStageView(size: { w: number; h: number }) {
  const { doc, zoom, pan, tool, setZoom, setPan } = useEditor();
  const [space, setSpace] = useState(false);
  const fitted = useRef(false);
  const pinch = useRef<{ dist: number; cx: number; cy: number } | null>(null);

  const panMode = tool === "hand" || space;

  const fit = useCallback(() => {
    if (!size.w || !size.h) return;
    const z = clampZoom(Math.min(size.w / doc.width, size.h / doc.height) * 0.9);
    setZoom(z);
    setPan({ x: (size.w - doc.width * z) / 2, y: (size.h - doc.height * z) / 2 });
  }, [size.w, size.h, doc.width, doc.height, setZoom, setPan]);

  // Fit once on first real measure.
  useEffect(() => {
    if (!fitted.current && size.w > 0 && size.h > 0) {
      fitted.current = true;
      fit();
    }
  }, [size.w, size.h, fit]);

  // Space = temporary pan (ignored while typing in a field).
  useEffect(() => {
    const tag = () => (document.activeElement?.tagName ?? "").toLowerCase();
    const down = (e: KeyboardEvent) => { if (e.code === "Space" && tag() !== "input" && tag() !== "textarea") { e.preventDefault(); setSpace(true); } };
    const up = (e: KeyboardEvent) => { if (e.code === "Space") setSpace(false); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  const zoomTo = useCallback((nextZoom: number, px: number, py: number) => {
    const z2 = clampZoom(nextZoom);
    const inDocX = (px - pan.x) / zoom;
    const inDocY = (py - pan.y) / zoom;
    setZoom(z2);
    setPan({ x: px - inDocX * z2, y: py - inDocY * z2 });
  }, [zoom, pan.x, pan.y, setZoom, setPan]);

  const onWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const p = stage?.getPointerPosition();
    if (!p) return;
    const factor = e.evt.deltaY > 0 ? 0.92 : 1.08;
    zoomTo(zoom * factor, p.x, p.y);
  }, [zoom, zoomTo]);

  const onTouchMove = useCallback((e: KonvaEventObject<TouchEvent>) => {
    const t = e.evt.touches;
    if (t.length !== 2) return;
    e.evt.preventDefault();
    const rect = (e.target.getStage()?.container())?.getBoundingClientRect();
    const ox = rect?.left ?? 0, oy = rect?.top ?? 0;
    const dx = t[0].clientX - t[1].clientX, dy = t[0].clientY - t[1].clientY;
    const dist = Math.hypot(dx, dy);
    const cx = (t[0].clientX + t[1].clientX) / 2 - ox;
    const cy = (t[0].clientY + t[1].clientY) / 2 - oy;
    if (pinch.current) zoomTo(zoom * (dist / pinch.current.dist), cx, cy);
    pinch.current = { dist, cx, cy };
  }, [zoom, zoomTo]);

  const onTouchEnd = useCallback(() => { pinch.current = null; }, []);

  return { panMode, fit, onWheel, onTouchMove, onTouchEnd, zoomTo };
}
