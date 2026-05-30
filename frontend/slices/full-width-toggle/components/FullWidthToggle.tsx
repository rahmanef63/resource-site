"use client";

/**
 * Toggle button. Cycles contained → wide → full → contained.
 * Drop in the topbar / app shell. Reads/writes the same localStorage
 * key as <WidthContainer> so layout responds instantly.
 *
 * Three variants:
 *   variant="icon"    — small icon button (default)
 *   variant="button"  — labeled button
 *   variant="segment" — 3-segment toggle (best for settings page)
 */

import * as React from "react";
import { Maximize2, Minimize2, ArrowLeftRight } from "lucide-react";
import { cva } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFullWidth, type WidthMode } from "../lib/use-full-width";

export interface FullWidthToggleCopy {
  /** Short button label per width mode. */
  label: Record<WidthMode, string>;
  /** Tooltip/title per width mode (describes the next state on click). */
  title: Record<WidthMode, string>;
}

/** Segment-item variants (active vs idle) — exported for consumer restyle. */
export const segmentItemVariants = cva(
  "h-auto gap-1.5 rounded px-2.5 py-1 text-xs",
  {
    variants: {
      active: {
        true: "bg-accent font-medium",
        false: "hover:bg-accent/50 text-muted-foreground",
      },
    },
    defaultVariants: { active: false },
  },
);

interface FullWidthToggleProps
  extends Omit<React.ComponentProps<typeof Button>, "variant"> {
  variant?: "icon" | "button" | "segment";
  /** Override any subset of the English default strings (i18n). */
  copy?: Partial<FullWidthToggleCopy>;
}

const ICONS: Record<WidthMode, React.ComponentType<{ className?: string }>> = {
  contained: Minimize2,
  wide: ArrowLeftRight,
  full: Maximize2,
};

const DEFAULT_COPY: FullWidthToggleCopy = {
  label: {
    contained: "Contained",
    wide: "Wide",
    full: "Full width",
  },
  title: {
    contained: "Comfortable width (~1280px) — click for Wide",
    wide: "Large width (~1536px) — click for Full",
    full: "Edge-to-edge — click for Contained",
  },
};

export function FullWidthToggle({
  variant = "icon",
  className,
  copy,
  ...props
}: FullWidthToggleProps) {
  const [mode, setMode, cycle] = useFullWidth();
  const LABEL = { ...DEFAULT_COPY.label, ...copy?.label };
  const TITLE = { ...DEFAULT_COPY.title, ...copy?.title };

  if (variant === "segment") {
    const order: WidthMode[] = ["contained", "wide", "full"];
    return (
      <div className={cn("inline-flex rounded-md border border-input p-0.5", className)}>
        {order.map((m) => {
          const Icon = ICONS[m];
          return (
            <Button
              key={m}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMode(m)}
              className={segmentItemVariants({ active: mode === m })}
              title={TITLE[m]}
            >
              <Icon className="h-3.5 w-3.5" />
              {LABEL[m]}
            </Button>
          );
        })}
      </div>
    );
  }

  const Icon = ICONS[mode];

  if (variant === "button") {
    return (
      <Button {...props} variant="ghost" size="sm" onClick={cycle} title={TITLE[mode]} className={className}>
        <Icon className="h-4 w-4" />
        <span className="ml-1.5">{LABEL[mode]}</span>
      </Button>
    );
  }

  return (
    <Button
      {...props}
      variant="ghost"
      size="icon"
      onClick={cycle}
      title={TITLE[mode]}
      aria-label={`Layout width: ${LABEL[mode]}`}
      className={className}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
