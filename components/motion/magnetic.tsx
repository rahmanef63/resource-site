"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  /** Px range inside which magnetism kicks in. Default 80. */
  radius?: number;
  /** Max translate strength 0..1. Default 0.35 = 35% of offset. */
  strength?: number;
  className?: string;
};

/**
 * Wrap a clickable — button/link. Tracks cursor within `radius`,
 * translates child toward pointer by `strength * offset`. Snaps back
 * smoothly on leave. Pure rAF — no lib.
 *
 * Accessibility: no-op for prefers-reduced-motion or touch devices.
 */
export function Magnetic({ children, radius = 80, strength = 0.35, className }: Props) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (matchMedia("(hover: none)").matches) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > radius) {
        tx = 0;
        ty = 0;
      } else {
        tx = dx * strength;
        ty = dy * strength;
      }
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      });
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
      el.style.transform = "translate3d(0,0,0)";
    };

    window.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [radius, strength]);

  return (
    <div
      ref={ref}
      className={cn("inline-block transition-transform duration-200 ease-out will-change-transform", className)}
    >
      {children}
    </div>
  );
}
