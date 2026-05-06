"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  to: number;
  from?: number;
  /** ms */
  duration?: number;
  /** Fixed decimals. */
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  /** rAF easing. Default easeOutCubic. */
  ease?: (t: number) => number;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Numeric counter that starts tweening when scrolled into view.
 * IntersectionObserver triggers once; rAF drives value.
 * Reduced-motion users see the final number immediately.
 */
export function StatCounter({
  to,
  from = 0,
  duration = 1400,
  decimals = 0,
  suffix = "",
  prefix = "",
  className,
  ease = easeOutCubic,
}: Props) {
  const spanRef = React.useRef<HTMLSpanElement>(null);
  const [value, setValue] = React.useState(from);

  React.useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(to);
      return;
    }

    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (started) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            started = true;
            const start = performance.now();
            const tick = (now: number) => {
              const elapsed = now - start;
              const t = Math.min(1, elapsed / duration);
              setValue(from + (to - from) * ease(t));
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [to, from, duration, ease]);

  return (
    <span ref={spanRef} className={cn("tabular-nums", className)}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
