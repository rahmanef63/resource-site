"use client";

import { useState, type RefObject } from "react";

export type ZoomVars = Record<"--zoom-x" | "--zoom-y" | "--zoom-scale", string>;

const FALLBACK_MS = 500; // iosZoomOpen/Close run 0.4s — mirrors use-window-exit's slack-padded hard cap

function motionReduced(): boolean {
  if (typeof document === "undefined") return true;
  const root = document.documentElement;
  if (root.classList.contains("reduce-motion")) return true;
  if (root.classList.contains("force-motion")) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function rectToVars(icon: DOMRect, container: DOMRect): ZoomVars {
  const scale = Math.max(0.04, Math.min(1, icon.width / container.width));
  return {
    "--zoom-x": `${icon.left + icon.width / 2 - (container.left + container.width / 2)}px`,
    "--zoom-y": `${icon.top + icon.height / 2 - (container.top + container.height / 2)}px`,
    "--zoom-scale": String(scale),
  };
}

/**
 * iOS icon-zoom app open/close (P2 ios-app-open-zoom) for the mobile
 * fullscreen app layer. Mirrors use-window-exit.ts's idiom — capture rect →
 * CSS vars → play a keyframe → delay the store commit to animationend, hard
 * fallback timer, instant when motion is off — but simpler: a phone only
 * ever has ONE fullscreen app at a time, so this is local state instead of
 * that hook's per-window Map registry.
 *
 * `rootRef` must point at a node that's mounted BEFORE the fullscreen layer
 * (the shell's own root): open() needs its rect as the "screen" the icon
 * zooms into, and the fullscreen layer itself doesn't exist yet at that
 * point — mounting it is what open() triggers. `frameRef` is the fullscreen
 * layer's own node — both refs are created by (and stay owned by) the
 * caller, same calling convention as use-window-exit.ts's `useWindowExit(id,
 * ref, …)`, rather than this hook returning a ref of its own (react-hooks/
 * refs flags ref access read through a hook's return value as unsafe).
 */
export function useAppZoom(
  rootRef: RefObject<HTMLElement | null>,
  frameRef: RefObject<HTMLDivElement | null>,
) {
  const [vars, setVars] = useState<ZoomVars | null>(null);

  /** Call from the launch handler with the tapped icon's rect. `undefined` =
   *  no icon to zoom from (e.g. resuming from the switcher) — falls back to
   *  a plain mount with no zoom class (today's fade/slide appOpen). */
  const open = (iconRect?: DOMRect) => {
    if (!iconRect || motionReduced()) {
      setVars(null);
      return;
    }
    const cr = rootRef.current?.getBoundingClientRect();
    setVars(cr ? rectToVars(iconRect, cr) : null);
  };

  /** Plays the reverse zoom (reusing the vars captured at open — the icon
   *  hasn't moved) and commits `onDone` once it ends; instant when there's
   *  nothing to reverse into or motion is off. */
  const close = (onDone: () => void) => {
    const el = frameRef.current;
    if (!vars || !el || motionReduced()) {
      setVars(null);
      onDone();
      return;
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setVars(null);
      onDone();
    };
    const timer = setTimeout(finish, FALLBACK_MS);
    const onEnd = (e: AnimationEvent) => {
      if (e.target !== el) return;
      el.removeEventListener("animationend", onEnd);
      clearTimeout(timer);
      finish();
    };
    el.addEventListener("animationend", onEnd);
  };

  return { vars, open, close };
}
