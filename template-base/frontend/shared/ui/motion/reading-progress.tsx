"use client";

import * as React from "react";

/**
 * Sticky 2-px progress bar pinned to the top of the lesson reader.
 * Tracks scroll position relative to the document height. Pure CSS
 * for the animation; one rAF-throttled scroll listener for the value.
 *
 * Hidden when prefers-reduced-motion is active so it doesn't compete
 * with the user's accessibility preference.
 */
export function ReadingProgress() {
  const [pct, setPct] = React.useState(0);
  const rafRef = React.useRef<number | null>(null);
  const reduceMotion = React.useRef(false);

  React.useEffect(() => {
    reduceMotion.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion.current) return;

    const compute = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const next = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setPct(next);
    };

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        compute();
        rafRef.current = null;
      });
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (reduceMotion.current) return null;

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-foreground/10 pointer-events-none print:hidden"
    >
      <div
        className="h-full bg-foreground origin-left"
        style={{
          transform: `scaleX(${pct / 100})`,
          transition: "transform 80ms linear",
        }}
      />
    </div>
  );
}
