"use client";

// Slice-local responsive helpers (appshell-compatible subset). Self-contained:
// no shell required. `useContainer` observes an element's OWN width and maps it
// to a pane bucket for JS branching (prefer Tailwind `@container` variants in
// markup; reach for this only when layout logic needs the bucket).

import { useEffect, useRef, useState, type RefObject } from "react";

export type Pane = "xs" | "sm" | "md" | "lg";

function bucket(w: number): Pane {
  if (w < 360) return "xs";
  if (w < 600) return "sm";
  if (w < 900) return "md";
  return "lg";
}

/**
 * Observe an element's width → size bucket. Usage:
 *   const [ref, pane] = useContainer<HTMLDivElement>();
 *   <div ref={ref}>{pane === "xs" ? … : …}</div>
 */
export function useContainer<T extends HTMLElement = HTMLElement>(): [
  RefObject<T | null>,
  Pane,
] {
  const ref = useRef<T>(null);
  const [pane, setPane] = useState<Pane>("lg");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? el.clientWidth;
      setPane(bucket(w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, pane];
}

/** True on coarse-pointer devices (touch) — drives ≥44px hit targets. */
export function usePointerCoarse(): boolean {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return coarse;
}
