"use client";

/**
 * Page-container width preference, persisted per-device (localStorage).
 *
 * Use to drive a max-width vs full-bleed layout switch. Three modes:
 *
 *   "contained"   — max-w-7xl (≈1280px)  → default, comfortable reading
 *   "wide"        — max-w-screen-2xl     → for dense dashboards
 *   "full"        — w-full               → edge-to-edge, e.g. data tables
 *
 * Cross-tab sync via storage event so toggling in one tab updates the
 * other. SSR-safe: returns "contained" until hydrated.
 */

import { useEffect, useState } from "react";

export type WidthMode = "contained" | "wide" | "full";

const KEY = "layout:widthMode";
const DEFAULT: WidthMode = "contained";

function readMode(): WidthMode {
  if (typeof window === "undefined") return DEFAULT;
  const v = window.localStorage.getItem(KEY);
  return v === "contained" || v === "wide" || v === "full" ? v : DEFAULT;
}

export function useFullWidth(): [WidthMode, (next: WidthMode) => void, () => void] {
  const [mode, setMode] = useState<WidthMode>(DEFAULT);

  useEffect(() => {
    setMode(readMode());
  }, []);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === KEY) setMode(readMode());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = (next: WidthMode) => {
    setMode(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY, next);
      // Dispatch storage event manually so other listeners in the SAME tab
      // (e.g. AdminShell + sidebar) re-read without an actual storage event.
      window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue: next }));
    }
  };

  /** Cycle contained → wide → full → contained. */
  const cycle = () => {
    const order: WidthMode[] = ["contained", "wide", "full"];
    const next = order[(order.indexOf(mode) + 1) % order.length];
    update(next);
  };

  return [mode, update, cycle];
}

/** Tailwind class fragment for the current mode. Append to your container. */
export function widthClass(mode: WidthMode): string {
  switch (mode) {
    case "contained":
      return "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";
    case "wide":
      return "mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8";
    case "full":
      return "w-full px-4 sm:px-6 lg:px-8";
  }
}
