"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type MarqueeProps = {
  /** Array of text chunks. Bullet char inserted between. */
  items: string[];
  /** Seconds for one full loop. Default 40. */
  durationSec?: number;
  /** Reverse direction. */
  reverse?: boolean;
  className?: string;
};

/**
 * Infinite horizontal scroll strip — CSS-only, GPU-smooth via translate3d.
 * Duplicated twice so the scroll looks seamless. Pauses on hover.
 * Respects prefers-reduced-motion (disabled entirely for that cohort).
 */
export function Marquee({ items, durationSec = 40, reverse = false, className }: MarqueeProps) {
  const chunk = items.join("  ·  ");
  return (
    <div
      className={cn(
        "relative overflow-hidden border-y-2 border-foreground bg-foreground text-background py-6",
        className,
      )}
      aria-hidden
    >
      <div
        className="flex items-center whitespace-nowrap will-change-transform motion-reduce:animate-none"
        style={{
          animation: `marquee ${durationSec}s linear infinite ${reverse ? "reverse" : ""}`,
        }}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <span
            key={i}
            className="font-serif text-[6vw] sm:text-[4vw] lg:text-[3vw] leading-none px-6 shrink-0 uppercase tracking-[-0.02em]"
          >
            {chunk}  ·
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translate3d(0,0,0); }
          to   { transform: translate3d(-33.333%, 0, 0); }
        }
      `}</style>
    </div>
  );
}
