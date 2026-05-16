"use client";

import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export type ParamSliderProps = {
  label: string;
  hint?: string;
  value: number;
  onValueChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Optional formatter for the value display. */
  format?: (v: number) => string;
  className?: string;
};

/** Labeled number slider for AI params (temperature, top-p, max-tokens).
 *  Composes shadcn Slider. Numeric readout right-aligned, optional
 *  hint paragraph below label. */
export function ParamSlider({
  label,
  hint,
  value,
  onValueChange,
  min = 0,
  max = 1,
  step = 0.01,
  format,
  className,
}: ParamSliderProps) {
  const display = format ? format(value) : value.toString();
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
        <span className="font-mono text-xs tabular-nums">{display}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onValueChange(v[0] ?? min)}
        min={min}
        max={max}
        step={step}
      />
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
