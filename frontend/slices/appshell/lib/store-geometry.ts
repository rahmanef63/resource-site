import type { Rect, SnapZone } from "./types";

// Window-manager geometry — PURE (no store access), so it lives apart from the
// stateful store. Window coords are relative to the desktop surface, which
// already starts below the menu bar at top:TOPBAR (we DON'T add TOPBAR again).

export const TOPBAR = 30;
export const DOCK_RESERVE = 92;
export const GAP = 8;

function viewport() {
  return { vw: window.innerWidth, vh: window.innerHeight };
}

// The usable desktop, in WINDOW coordinates. GAP inset on top/left/right;
// reserve the dock at the bottom. Snap + maximize share it so every layout
// tiles the SAME area and nothing slides under the menu bar or behind the dock.
export function workArea() {
  const { vw, vh } = viewport();
  return { vw, vh, top: GAP, bottom: vh - TOPBAR - DOCK_RESERVE, left: GAP, right: vw - GAP };
}

// Snap target rects — halves, quadrants, top=maximize. All bounded by workArea
// so they reserve the menu bar + dock and tile with a GAP gutter (no overlap,
// no gaps, no dock collision).
export function snapRect(zone: SnapZone): Rect {
  const { vw, top, bottom } = workArea();
  const availH = bottom - top;
  const halfW = (vw - GAP * 3) / 2; // GAP outer-left + gutter + outer-right
  const rightX = GAP * 2 + halfW;
  const halfH = (availH - GAP) / 2; // GAP gutter between the two rows
  const rowB = top + halfH + GAP;
  const map: Record<SnapZone, Rect> = {
    left: { x: GAP, y: top, w: halfW, h: availH },
    right: { x: rightX, y: top, w: halfW, h: availH },
    top: { x: GAP, y: top, w: vw - GAP * 2, h: availH },
    tl: { x: GAP, y: top, w: halfW, h: halfH },
    tr: { x: rightX, y: top, w: halfW, h: halfH },
    bl: { x: GAP, y: rowB, w: halfW, h: halfH },
    br: { x: rightX, y: rowB, w: halfW, h: halfH },
  };
  return map[zone];
}

// Zone from a pointer near the screen edges (drag-to-snap).
export function snapZoneAt(px: number, py: number): SnapZone | null {
  const { vw, vh } = viewport();
  const m = 26;
  const corner = 120;
  if (py < TOPBAR + 4) return "top";
  if (px < m) return py < corner ? "tl" : py > vh - corner ? "bl" : "left";
  if (px > vw - m) return py < corner ? "tr" : py > vh - corner ? "br" : "right";
  return null;
}
