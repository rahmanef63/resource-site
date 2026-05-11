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
import { Button } from "@/components/ui/button";
import { useFullWidth, type WidthMode } from "../lib/use-full-width";

interface FullWidthToggleProps {
  variant?: "icon" | "button" | "segment";
  className?: string;
}

const ICONS: Record<WidthMode, React.ComponentType<{ className?: string }>> = {
  contained: Minimize2,
  wide: ArrowLeftRight,
  full: Maximize2,
};

const LABEL: Record<WidthMode, string> = {
  contained: "Contained",
  wide: "Wide",
  full: "Full width",
};

const TITLE: Record<WidthMode, string> = {
  contained: "Lebar nyaman (~1280px) — klik untuk Wide",
  wide: "Lebar besar (~1536px) — klik untuk Full",
  full: "Edge-to-edge — klik untuk Contained",
};

export function FullWidthToggle({ variant = "icon", className }: FullWidthToggleProps) {
  const [mode, setMode, cycle] = useFullWidth();

  if (variant === "segment") {
    const order: WidthMode[] = ["contained", "wide", "full"];
    return (
      <div className={"inline-flex rounded-md border border-input p-0.5 " + (className ?? "")}>
        {order.map((m) => {
          const Icon = ICONS[m];
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={
                "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition " +
                (mode === m ? "bg-accent font-medium" : "hover:bg-accent/50 text-muted-foreground")
              }
              title={TITLE[m]}
            >
              <Icon className="h-3.5 w-3.5" />
              {LABEL[m]}
            </button>
          );
        })}
      </div>
    );
  }

  const Icon = ICONS[mode];

  if (variant === "button") {
    return (
      <Button variant="ghost" size="sm" onClick={cycle} title={TITLE[mode]} className={className}>
        <Icon className="h-4 w-4" />
        <span className="ml-1.5">{LABEL[mode]}</span>
      </Button>
    );
  }

  return (
    <Button
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
