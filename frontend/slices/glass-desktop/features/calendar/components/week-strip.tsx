"use client";
// glass-desktop — week-strip (calendar family, W square). Ported from Lucent v4.
// A "July" header over a Mon–Sun run of day chips: today (Tue 7) is ring-
// highlighted, some days carry event dots, and tapping a chip selects it
// (local visual state only, no persistence). Chips are shadcn Buttons.
// Content only — the canvas supplies the glass shell. Numerals use --font-numeric.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { weekStripSeed } from "@/features/glass-desktop/lib/seeds/calendar-2.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

export function WeekStrip(_props: WidgetProps) {
  const today = weekStripSeed.days.find((d) => d.highlight)?.id ?? weekStripSeed.days[0]?.id;
  const [selected, setSelected] = useState<string | undefined>(today);

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <span
        className="text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: "var(--color-ink-low)" }}
      >
        {weekStripSeed.month}
      </span>
      <div className="grid flex-1 grid-cols-7 items-stretch gap-1">
        {weekStripSeed.days.map((day) => {
          const isSelected = selected === day.id;
          return (
            <Button
              key={day.id}
              variant="ghost"
              onClick={() => setSelected(day.id)}
              aria-pressed={isSelected}
              aria-label={`${day.label} ${day.date}`}
              className={cn(
                "flex h-full min-w-0 flex-col items-center justify-center gap-1 rounded-[var(--radius-control)] px-0 py-1",
              )}
              style={{
                background: isSelected ? "var(--color-glass-hi)" : "transparent",
                boxShadow: day.highlight ? "inset 0 0 0 1.5px var(--color-accent-blue)" : "none",
              }}
            >
              <span
                className="text-[10px] font-medium uppercase leading-none"
                style={{ color: "var(--color-ink-low)" }}
              >
                {day.label}
              </span>
              <span
                className="text-sm leading-none tabular-nums"
                style={{
                  color: day.highlight ? "var(--color-accent-blue)" : "var(--color-ink-hi)",
                  fontFamily: "var(--font-numeric)",
                }}
              >
                {day.date}
              </span>
              <span aria-hidden className="flex h-1.5 items-center gap-0.5">
                {day.dots.map((dot, i) => (
                  <span
                    key={i}
                    className="size-1 rounded-full"
                    style={{ background: dot }}
                  />
                ))}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
