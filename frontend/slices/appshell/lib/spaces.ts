"use client";

import { useState, useSyncExternalStore } from "react";
import { M, emit, patch, shellStore, topWindowBy } from "./store-state";
import { registerCommands } from "./commands";
import { toast } from "./toast";
import type { WinId } from "./types";

// Virtual desktops (Spaces) — windows carry a spaceId; only the active
// space's windows render (gate in window.tsx). Switching refocuses the top
// window of the target space so hotkeys never act on a hidden window.
// Self-contained module; palette commands are the switcher (consumers may
// re-register the "spaces" source for more/fewer).

export const SPACE_IDS = [1, 2, 3, 4];

/** spaceId of a window, defaulting legacy/persisted windows to space 1. */
export function spaceOf(win: { spaceId?: number } | undefined): number {
  return win?.spaceId ?? 1;
}

function topWindowIn(space: number): WinId | null {
  return topWindowBy(M.state.order, (w) => spaceOf(w) === space);
}

export function setActiveSpace(n: number): void {
  if (n === M.state.activeSpace) return;
  M.state = { ...M.state, activeSpace: n, focused: topWindowIn(n) };
  emit();
}

/** Move a window to another space (it disappears until you switch there). */
export function moveWindowToSpace(id: WinId, n: number): void {
  const win = M.state.windows[id];
  if (!win || spaceOf(win) === n) return;
  patch(id, { spaceId: n });
  if (M.state.focused === id) {
    M.state = { ...M.state, focused: topWindowIn(M.state.activeSpace) };
    emit();
  }
}

export function useActiveSpace(): number {
  return useSyncExternalStore(
    shellStore.subscribe,
    shellStore.getActiveSpace,
    shellStore.getActiveSpace,
  );
}

/** Which way the active Space just moved — drives DesktopChrome's directional
 *  slide-in (real macOS slides the whole desktop). "Adjusting state during
 *  render" (react.dev's sanctioned pattern for prev-vs-current diffing) rather
 *  than reading a ref in render, which the React Compiler rejects; null until
 *  the first switch. */
export function useSpaceSlideDirection(active: number): "left" | "right" | null {
  const [prev, setPrev] = useState(active);
  const [dir, setDir] = useState<"left" | "right" | null>(null);
  if (prev !== active) {
    setDir(active > prev ? "right" : "left");
    setPrev(active);
  }
  return dir;
}

registerCommands("spaces", [
  ...SPACE_IDS.map((n) => ({
    id: `space:switch:${n}`,
    label: `Switch to Space ${n}`,
    hint: "Space",
    keywords: "virtual desktop workspace",
    run: () => {
      setActiveSpace(n);
      toast(`Space ${n}`);
    },
  })),
  ...SPACE_IDS.map((n) => ({
    id: `space:move:${n}`,
    label: `Move window to Space ${n}`,
    hint: "Space",
    keywords: "send virtual desktop workspace",
    run: () => {
      const id = shellStore.getFocused();
      const win = id ? shellStore.getWindow(id) : undefined;
      if (!id || !win) {
        toast("No focused window");
        return;
      }
      moveWindowToSpace(id, n);
      toast(`Moved "${win.title}" to Space ${n}`);
    },
  })),
]);
