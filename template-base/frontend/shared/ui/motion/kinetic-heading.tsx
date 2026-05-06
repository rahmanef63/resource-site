"use client";

import * as React from "react";
import { cn } from "@/shared/lib/cn";

type Props = {
  text: string;
  className?: string;
  /** ms per letter stagger. Default 36. */
  stagger?: number;
  /** Tag — h1/h2/… */
  as?: keyof React.JSX.IntrinsicElements;
};

/**
 * Letter-by-letter stagger reveal. Pure CSS `animation-delay` — no lib.
 * Non-letter chars (spaces, punctuation) stay in flow but not animated.
 * Reduced-motion: no animation, static render.
 */
export function KineticHeading({
  text,
  className,
  stagger = 36,
  as = "h1",
}: Props) {
  const Tag = as as React.ElementType;
  const letters = Array.from(text);
  return (
    <Tag
      className={cn(
        "inline-block font-serif leading-[0.95] tracking-[-0.035em]",
        className,
      )}
      aria-label={text}
    >
      {letters.map((ch, i) => {
        if (ch === " ") return <span key={i}>&nbsp;</span>;
        return (
          <span
            key={i}
            aria-hidden
            className="inline-block motion-reduce:animate-none"
            style={{
              animation: `kinetic-rise 820ms cubic-bezier(0.22,1,0.36,1) ${i * stagger}ms both`,
            }}
          >
            {ch}
          </span>
        );
      })}
      <style>{`
        @keyframes kinetic-rise {
          from { transform: translate3d(0, 70%, 0) rotate(2deg); opacity: 0; }
          to   { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </Tag>
  );
}
