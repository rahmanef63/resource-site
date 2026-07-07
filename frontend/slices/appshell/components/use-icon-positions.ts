"use client";
// Per-icon desktop drag-reposition offsets (P5 critic: "desktop icons cannot
// be repositioned at all"). Each icon keeps its natural flex-flow slot as its
// base position; a drag stores a {dx,dy} CSS-transform delta from that slot,
// so no coarse grid/collision model is needed — a real reposition just means
// "stays where you dropped it". Persisted to localStorage (survives reload);
// not synced anywhere else — this is a cosmetic desktop-arrangement seam, not
// app/window state. Shared by both DesktopIcons consumers (macOS + Windows
// shells both render the same component).
import { useSyncExternalStore } from "react";

const KEY = "sv:desktop-icon-pos";
type Pos = { dx: number; dy: number };
type PosMap = Record<string, Pos>;
const ZERO: Pos = { dx: 0, dy: 0 };

function load(): PosMap {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return raw && typeof raw === "object" ? (raw as PosMap) : {};
  } catch {
    return {};
  }
}

let positions: PosMap = load();
const subs = new Set<() => void>();

export function setIconPosition(id: string, pos: Pos): void {
  positions = { ...positions, [id]: pos };
  try {
    localStorage.setItem(KEY, JSON.stringify(positions));
  } catch {
    /* private mode */
  }
  subs.forEach((f) => f());
}

// Synchronous read for the group-drag orchestrator in desktop-icons.tsx,
// which needs every selected icon's current {dx,dy} snapshot at drag-start
// without subscribing each one individually (only the tile that's actually
// dragged needs the reactive `useIconPosition` below).
export function getIconPosition(id: string): Pos {
  return positions[id] ?? ZERO;
}

export function useIconPosition(id: string): Pos {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => positions[id] ?? ZERO,
    () => ZERO,
  );
}
