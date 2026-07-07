"use client";
/* Material ink ripple — pointerdown handler that injects a `.ripple-ink`
   span (appshell-materials.css: absolute + currentColor + the ripple-expand
   keyframe) at the pointer's own coordinates into whatever element the
   handler is attached to. That element must also carry `.ripple-host`
   (position:relative + overflow:hidden, same stylesheet) so the ink clips to
   its own shape. Self-removing on animationend, so nothing to clean up on
   unmount — no ref/state needed, just a stable callback. Generic (not
   Android-specific): any future press-feedback:"ripple" surface can reuse
   this one hook (gap: android-material-ripple). */
import { useCallback } from "react";

export function useRipple() {
  return useCallback((e: React.PointerEvent<HTMLElement>) => {
    const host = e.currentTarget;
    const rect = host.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ink = document.createElement("span");
    ink.className = "ripple-ink";
    ink.style.width = `${size}px`;
    ink.style.height = `${size}px`;
    ink.style.left = `${e.clientX - rect.left - size / 2}px`;
    ink.style.top = `${e.clientY - rect.top - size / 2}px`;
    ink.addEventListener("animationend", () => ink.remove(), { once: true });
    host.appendChild(ink);
  }, []);
}
