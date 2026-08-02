"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import type { WinId } from "../lib/types";

// Exit + geometry choreography for desktop window frames.
//
// Exit: window.tsx registers an animator per window; the store's
// closeWindow/minimizeWindow route through requestExit() so EVERY caller
// (titlebar buttons, dock/taskbar clicks, menus, hotkeys) animates before the
// state commit unmounts the frame. Close scales down + fades in place;
// minimize flies toward the window's OWN dock icon (falling back to
// bottom-center when the app isn't pinned or the dock is hidden — the old P0
// approximation, now a fallback rather than the only behavior). Keyframes
// live in app/globals.css; duration/easing come from the shell's motion
// tokens. Reduce-motion commits instantly, and a 400ms hard fallback
// guarantees the store never wedges mid-exit. Shells that never mount a frame
// (mobile) have no animator, so they keep today's instant behavior.

export type ExitKind = "close" | "minimize";
type ExitAnimator = (kind: ExitKind, done: () => void) => void;

const EXIT_FALLBACK_MS = 400;
const animators = new Map<WinId, ExitAnimator>();
const exiting = new Set<WinId>();

// Same contract as the globals.css kill-switches: `.reduce-motion` = manual
// off, `.force-motion` = manual on, else the OS prefers-reduced-motion pref.
function motionReduced(): boolean {
  if (typeof document === "undefined") return true; // SSR / tests: no motion
  const root = document.documentElement;
  if (root.classList.contains("reduce-motion")) return true;
  if (root.classList.contains("force-motion")) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Store seam: try to hand the exit for `id` to its registered animator.
 *  Returns true when the commit was deferred (animator will run it on
 *  animationend / the fallback timer); false = caller commits instantly. */
export function requestExit(id: WinId, kind: ExitKind, commit: () => void): boolean {
  const animate = animators.get(id);
  if (!animate || exiting.has(id) || motionReduced()) return false;
  exiting.add(id);
  let done = false;
  const finish = () => {
    if (done) return; // animationend + fallback both land here — commit once
    done = true;
    exiting.delete(id);
    commit();
  };
  setTimeout(finish, EXIT_FALLBACK_MS); // hard cap — state never wedges
  animate(kind, finish);
  return true;
}

export function registerExitAnimator(id: WinId, fn: ExitAnimator): () => void {
  animators.set(id, fn);
  return () => {
    animators.delete(id);
  };
}

// The dock renders each pinned app's icon as `aria-label={app.title}` inside
// `role="toolbar" aria-label="Dock"` (dock.tsx/dock-parts.tsx — read-only
// reference, verified against the live markup, not duplicated here). Windows
// pass their app's title down so minimize can target that exact element's
// center instead of a fixed point; `null` when not found (app unpinned, dock
// hidden, or a shell with no dock at all) falls back to bottom-center.
function dockIconRect(dockLabel?: string): DOMRect | null {
  if (!dockLabel) return null;
  const dock = document.querySelector('[role="toolbar"][aria-label="Dock"]');
  if (!dock) return null;
  for (const el of dock.querySelectorAll<HTMLElement>("[aria-label]")) {
    if (el.getAttribute("aria-label") === dockLabel) return el.getBoundingClientRect();
  }
  return null;
}

/** Frame hook: plays the exit on the DOM node, commits on animationend.
 *  Inline `style.animation` (not a class) so a mid-exit React re-render
 *  (focus change rewriting className) can't cancel the animation. `dockLabel`
 *  is the app's display title (matches its dock aria-label exactly) — pass it
 *  when known so minimize flies to the real icon instead of the fallback. */
export function useWindowExit(id: WinId, ref: RefObject<HTMLElement | null>, dockLabel?: string) {
  useEffect(
    () =>
      registerExitAnimator(id, (kind, finish) => {
        const el = ref.current;
        if (!el) return finish(); // frame not on screen (other Space) — instant
        if (kind === "minimize") {
          const r = el.getBoundingClientRect();
          const dock = dockIconRect(dockLabel);
          const targetX = dock ? dock.left + dock.width / 2 : window.innerWidth / 2;
          const targetY = dock ? dock.top + dock.height / 2 : window.innerHeight;
          el.style.setProperty("--exit-x", `${targetX - (r.left + r.width / 2)}px`);
          el.style.setProperty("--exit-y", `${targetY - (r.top + r.height / 2)}px`);
        }
        el.style.transition = ""; // a live snap glide must not fight the exit
        el.style.animation = `${kind === "close" ? "windowClose" : "windowMinimize"} var(--motion-close-dur, 0.2s) var(--motion-close-ease, ease-in) forwards`;
        el.addEventListener("animationend", (e) => {
          if (e.target === el) finish();
        });
      }),
    [id, ref, dockLabel],
  );
}

const FLIP_TIMING = "var(--motion-snap-dur, 0.22s) var(--ease-decel, ease-out)";
const FLIP_TRANSITION = ["left", "top", "width", "height"].map((p) => `${p} ${FLIP_TIMING}`).join(", ");

/** FLIP-ish glide for store-driven geometry changes (maximize / snap /
 *  restore / retile): a transient inline transition on left/top/width/height,
 *  dropped on transitionend (400ms fallback). The pointer drag/resize path
 *  bypasses it — use-window-drag marks the node with data-dragging and writes
 *  styles directly, so gestures stay untransitioned at 60fps. */
export function useWindowFlip(ref: RefObject<HTMLElement | null>, x?: number, y?: number, w?: number, h?: number) {
  const prev = useRef<string | null>(null);
  useLayoutEffect(() => {
    const key = x === undefined ? null : `${x},${y},${w},${h}`;
    const last = prev.current;
    prev.current = key;
    const el = ref.current;
    if (!el || !key || !last || last === key) return; // mount / no move
    if (el.dataset.dragging || motionReduced()) return;
    // Added in the same frame as React's style write — the browser sees the
    // old computed rect + a transition property, so the change glides.
    el.style.transition = FLIP_TRANSITION;
    const clear = () => {
      el.style.transition = "";
      el.removeEventListener("transitionend", onEnd);
      clearTimeout(timer);
    };
    const onEnd = (e: TransitionEvent) => {
      if (e.target === el) clear();
    };
    el.addEventListener("transitionend", onEnd);
    const timer = setTimeout(clear, EXIT_FALLBACK_MS);
    return clear;
  }, [x, y, w, h, ref]);
}
