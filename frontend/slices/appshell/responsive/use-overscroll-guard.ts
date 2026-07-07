"use client";

import { useEffect } from "react";

/**
 * While a mobile-surface shell is live, disable the BROWSER's own overscroll
 * actions on the root scroller (html + body):
 *
 * - Chrome's pull-to-refresh — swiping down on the home screen / status bar
 *   currently RELOADS the whole site instead of opening the notification
 *   shade / Cover Sheet the shells implement.
 * - Chrome's horizontal back/forward navigation glow, which eats the Android
 *   edge-back swipe.
 *
 * `overscroll-none` classes on the shells' inner scroll containers stop scroll
 * CHAINING between them, but gestures that start on non-scrollable chrome (the
 * status bar swipe-down path) hit the root scroller directly — only html/body
 * `overscroll-behavior` reaches those, and globals.css can't scope it to the
 * mobile surface, so it is applied imperatively for the surface's lifetime.
 */
export function useOverscrollGuard(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const els = [document.documentElement, document.body];
    const prev = els.map((el) => el.style.overscrollBehavior);
    els.forEach((el) => {
      el.style.overscrollBehavior = "none";
    });
    return () => {
      els.forEach((el, i) => {
        el.style.overscrollBehavior = prev[i];
      });
    };
  }, [active]);
}
