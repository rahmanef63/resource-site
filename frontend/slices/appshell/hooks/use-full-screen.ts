"use client";

import { useSyncExternalStore } from "react";
import { shellStore, moveWindow, resizeWindow } from "../lib/store";
import { spaceOf, moveWindowToSpace, setActiveSpace } from "../lib/spaces";
import type { Rect, WinId } from "../lib/types";

// macOS Full Screen (green button, no Option held). Real macOS gives the
// window its OWN Space; we get that "for real" by reusing the Spaces
// machinery that already exists (moveWindowToSpace/setActiveSpace, both
// already exported by lib/spaces) instead of inventing a parallel windowing
// system — the fullscreen window just gets a space number no Spaces-switcher
// UI ever shows the user, derived from its own id so it never collides with
// another window's fullscreen excursion or the user-facing SPACE_IDS (1-4).
// Geometry rides the store's existing moveWindow/resizeWindow, so the FLIP
// glide already wired in window.tsx (use-window-exit.ts's useWindowFlip)
// animates the resize for free — no new animation code needed here.
//
// ponytail: invisible to Mission Control / the Spaces switcher (both iterate
// the fixed SPACE_IDS array, which isn't ours to extend) — the only way in or
// out is this module's toggle. A "Full Screen" tile in Mission Control is a
// stretch goal, skipped.

type FsEntry = { prevRect: Rect; prevSpace: number; fsSpace: number };

const fsState = new Map<WinId, FsEntry>();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
// Stable reference (mirrors shellStore.subscribe in store-state.ts) so
// useSyncExternalStore doesn't resubscribe every render.
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// Space numbers >= this are reserved for fullscreen excursions; SPACE_IDS
// (spaces.ts) only ever runs 1-4, so this range is permanently free.
const FS_SPACE_BASE = 1000;
function fsSpaceFor(id: WinId): number {
  return FS_SPACE_BASE + (Number(id.replace(/\D/g, "")) || 0);
}

export function isFullScreen(id: WinId): boolean {
  return fsState.has(id);
}

export function useIsFullScreen(id: WinId): boolean {
  return useSyncExternalStore(
    subscribe,
    () => fsState.has(id),
    () => false, // SSR/tests: fullscreen is a transient client-only UI mode
  );
}

export function enterFullScreen(id: WinId): void {
  if (typeof window === "undefined" || fsState.has(id)) return;
  const win = shellStore.getWindow(id);
  if (!win) return;
  const entry: FsEntry = {
    prevRect: { x: win.x, y: win.y, w: win.w, h: win.h },
    prevSpace: spaceOf(win),
    fsSpace: fsSpaceFor(id),
  };
  fsState.set(id, entry);
  // Window coords are relative to the desktop `section`, which itself starts
  // var(--menubar-h) below the viewport top (store-geometry.ts) — offsetting y
  // by that same amount and sizing to the full viewport lands the frame at
  // literal viewport (0,0)..(vw,vh), covering where the menu bar/dock used
  // to be.
  const menubarH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--menubar-h")) || 24;
  moveWindow(id, 0, -menubarH);
  resizeWindow(id, window.innerWidth, window.innerHeight);
  moveWindowToSpace(id, entry.fsSpace);
  setActiveSpace(entry.fsSpace);
  notify();
}

export function exitFullScreen(id: WinId): void {
  const entry = fsState.get(id);
  if (!entry) return;
  fsState.delete(id);
  moveWindow(id, entry.prevRect.x, entry.prevRect.y);
  resizeWindow(id, entry.prevRect.w, entry.prevRect.h);
  moveWindowToSpace(id, entry.prevSpace);
  setActiveSpace(entry.prevSpace);
  notify();
}

export function toggleFullScreen(id: WinId): void {
  (fsState.has(id) ? exitFullScreen : enterFullScreen)(id);
}
