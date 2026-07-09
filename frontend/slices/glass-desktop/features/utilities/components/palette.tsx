"use client";
// glass-desktop — palette (utilities, S square). Four accent swatches, each
// captioned with its oklch value; clicking a swatch copies that value to the
// clipboard and fires a sonner toast. Content only — the canvas supplies the
// glass shell. Swatches are shadcn Buttons (no bare interactive element).
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { paletteSeed, type SwatchSeed } from "@/features/glass-desktop/lib/seeds/utilities-2.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";
import { cn } from "@/lib/utils";

export function Palette(_props: WidgetProps) {
  const copy = async (s: SwatchSeed) => {
    try {
      await navigator.clipboard?.writeText(s.value);
      toast(`${paletteSeed.copiedLabel} ${s.value}`);
    } catch {
      toast(s.value);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <span
        className="text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: "var(--color-ink-low)" }}
      >
        {paletteSeed.title}
      </span>
      <div className="grid flex-1 grid-cols-2 gap-2">
        {paletteSeed.swatches.map((s) => (
          <Button
            key={s.id}
            variant="ghost"
            onClick={() => copy(s)}
            aria-label={`${s.label} ${s.value}`}
            className={cn(
              "flex h-full min-h-0 w-full flex-col items-start justify-between gap-1 p-2",
              "rounded-[var(--radius-control)] [background:var(--color-glass-lo)]",
              "hover:[background:var(--color-glass-hi)]",
            )}
          >
            <span
              aria-hidden
              className="h-5 w-full rounded-[var(--radius-control)]"
              style={{ background: s.token }}
            />
            <span
              className="max-w-full truncate text-[9px] leading-none"
              style={{ color: "var(--color-ink-mid)", fontFamily: "var(--font-numeric)" }}
            >
              {s.value}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
