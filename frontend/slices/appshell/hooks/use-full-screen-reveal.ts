"use client";

import { useEffect, useRef, useState } from "react";

// Edge-hover reveal for a fullscreen macOS window: hovering the very top of
// the screen slides the auto-hidden menu bar back down; the bottom edge does
// the same for the Dock. Mirrors hot-corners.tsx's dwell-then-fire idea (a
// short hover delay kills accidental edge clips) but tracks a continuous
// "revealed" state instead of firing a one-shot action, and — once revealed —
// watches the whole page for the cursor leaving the band, since the revealed
// bar itself now covers the thin hit strip that triggered it (its own
// pointerleave would never fire).
//
// ponytail: menu-bar.tsx/dock.tsx live outside this window-frame slice, so
// this reaches them by DOM query (the menu bar's own `--glass-bar` inline
// background + the dock's `role=toolbar`/`aria-label=Dock`) instead of a
// shared prop or store — same "query a documented selector" contract
// use-window-exit.ts's per-icon minimize targeting uses. No-ops if a selector
// ever changes shape, so this can never crash the shell it doesn't own.

const DWELL_MS = 120;
const HIDE_BAND_PX = 140; // menu bar (24) + slim titlebar (28) + margin

function menuBarEl(): HTMLElement | null {
  return document.querySelector('header[style*="glass-bar"]');
}
function dockEl(): HTMLElement | null {
  return document.querySelector('[role="toolbar"][aria-label="Dock"]');
}

function setRevealed(el: HTMLElement | null, revealed: boolean, hideY: string) {
  if (!el) return;
  el.style.transition = "transform 0.2s var(--ease-standard, ease), opacity 0.2s var(--ease-standard, ease)";
  el.style.transform = revealed ? "translateY(0)" : hideY;
  el.style.opacity = revealed ? "1" : "0";
  el.style.pointerEvents = revealed ? "auto" : "none";
}
const setMenuBar = (revealed: boolean) => setRevealed(menuBarEl(), revealed, "translateY(-100%)");
const setDock = (revealed: boolean) => setRevealed(dockEl(), revealed, "translateY(100%)");
function resetBars() {
  for (const el of [menuBarEl(), dockEl()]) {
    if (!el) continue;
    el.style.transition = el.style.transform = el.style.opacity = el.style.pointerEvents = "";
  }
}

export function useFullScreenReveal(active: boolean) {
  const [topRevealed, setTopRevealed] = useState(false);
  const [bottomRevealed, setBottomRevealed] = useState(false);
  const dwell = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset on an active→inactive edge, adjusted DURING render (react.dev's
  // sanctioned prev-vs-current pattern — spaces.ts's useSpaceSlideDirection
  // uses the same idiom) rather than as a setState-in-effect, so a stale
  // "revealed" flag can never leak into the next Full Screen entry.
  const [prevActive, setPrevActive] = useState(active);
  if (prevActive !== active) {
    setPrevActive(active);
    if (!active) {
      setTopRevealed(false);
      setBottomRevealed(false);
    }
  }

  // Hide both bars the instant fullscreen engages; restore them (undo the
  // inline overrides, resuming their normal per-shell CSS) the instant it
  // ends, however that happens — toggle-off, close, or unmount mid-session.
  useEffect(() => {
    if (!active) return resetBars();
    setMenuBar(false);
    setDock(false);
    return () => resetBars();
  }, [active]);

  useEffect(() => {
    if (!active || !(topRevealed || bottomRevealed)) return;
    const onMove = (e: PointerEvent) => {
      if (topRevealed && e.clientY > HIDE_BAND_PX) { setTopRevealed(false); setMenuBar(false); }
      if (bottomRevealed && e.clientY < window.innerHeight - HIDE_BAND_PX) { setBottomRevealed(false); setDock(false); }
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [active, topRevealed, bottomRevealed]);

  useEffect(() => () => { if (dwell.current) clearTimeout(dwell.current); }, []);

  const arm = (run: () => void) => {
    if (dwell.current) clearTimeout(dwell.current);
    dwell.current = setTimeout(run, DWELL_MS);
  };
  const cancelArm = () => { if (dwell.current) clearTimeout(dwell.current); };

  return {
    topRevealed,
    bottomRevealed,
    topZoneProps: { onPointerEnter: () => arm(() => { setTopRevealed(true); setMenuBar(true); }), onPointerLeave: cancelArm },
    bottomZoneProps: { onPointerEnter: () => arm(() => { setBottomRevealed(true); setDock(true); }), onPointerLeave: cancelArm },
  };
}
