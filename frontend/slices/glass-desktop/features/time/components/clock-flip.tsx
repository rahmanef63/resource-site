"use client";
// glass-desktop — clock-flip (time family, W wide). A split-flap face: two cells
// (HH and MM), each halved by a hairline hinge, updated off the shared minute
// clock. When the value rolls over the cell flips via the Web Animations API;
// under prefers-reduced-motion the digits just swap with no rotation. Content
// only — the canvas supplies the glass shell. Numerals use var(--font-numeric).
import { useEffect, useRef } from "react";
import { useClock } from "@/features/glass-desktop/hooks/use-clock";
import { useMounted } from "@/features/glass-desktop/hooks/use-mounted";
import { clockFace } from "@/features/glass-desktop/utils/format";
import { clockFlipSeed } from "@/features/glass-desktop/lib/seeds/time-2.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

export function ClockFlip(_props: WidgetProps) {
  const now = useClock("minute");
  const mounted = useMounted();
  const face = clockFace(now); // "HH:MM:SS"
  const hh = mounted ? face.slice(0, 2) : clockFlipSeed.fallback;
  const mm = mounted ? face.slice(3, 5) : clockFlipSeed.fallback;
  const cells = [hh, mm];

  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const prev = useRef<string[]>([hh, mm]);

  useEffect(() => {
    if (!mounted) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cells.forEach((val, i) => {
      const el = refs.current[i];
      if (el && prev.current[i] !== val && !reduce) {
        el.animate(
          [{ transform: "rotateX(0deg)" }, { transform: "rotateX(-88deg)" }, { transform: "rotateX(0deg)" }],
          { duration: 440, easing: "cubic-bezier(0.2,0.7,0.2,1)" },
        );
      }
    });
    prev.current = [...cells];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hh, mm, mounted]);

  return (
    <div className="relative flex h-full w-full items-center justify-center gap-4" style={{ perspective: "600px" }}>
      <span
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 text-3xl font-medium leading-none"
        style={{
          color: "var(--color-ink-low)",
          fontFamily: "var(--font-numeric)",
          transform: "translate(-50%,-50%)",
        }}
      >
        {clockFlipSeed.separator}
      </span>
      {cells.map((val, i) => (
        <div
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="relative flex h-full flex-1 items-center justify-center overflow-hidden"
          style={{
            background: "var(--color-glass-lo)",
            borderRadius: "var(--radius-widget)",
            border: "1px solid var(--color-hairline)",
          }}
          suppressHydrationWarning
        >
          <span
            className="text-5xl font-medium leading-none tabular-nums"
            style={{ color: "var(--color-ink-hi)", fontFamily: "var(--font-numeric)" }}
            suppressHydrationWarning
          >
            {val}
          </span>
          <div
            className="absolute left-0 right-0 top-1/2"
            style={{ height: 1, background: "var(--color-hairline)", transform: "translateY(-50%)" }}
          />
        </div>
      ))}
    </div>
  );
}
