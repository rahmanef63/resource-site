"use client";

import * as React from "react";
import { cn } from "@/shared/lib/cn";

type Props = {
  children?: React.ReactNode;
  className?: string;
  /** OKLCH var used as spotlight tint. */
  accent?: string;
  /** Blob radius as px. */
  size?: number;
  /** Tint opacity 0..1. */
  alpha?: number;
};

/**
 * Wrap a section: cursor movement updates --mx/--my CSS vars;
 * child ::before renders a radial spotlight via background-image.
 * Disabled on touch devices via @media (hover: none).
 */
export function CursorSpotlight({
  children,
  className,
  accent = "--chart-3",
  size = 480,
  alpha = 0.18,
}: Props) {
  const ref = React.useRef<HTMLDivElement>(null);

  const onMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={cn("group/spot relative overflow-hidden", className)}
      style={
        {
          "--spot-size": `${size}px`,
          "--spot-alpha": alpha.toString(),
          "--spot-accent": `oklch(var(${accent}))`,
        } as React.CSSProperties
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover/spot:opacity-100 transition-opacity duration-500 motion-reduce:hidden"
        style={{
          background: `radial-gradient(var(--spot-size) circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklch, var(--spot-accent) calc(var(--spot-alpha) * 100%), transparent), transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
}
