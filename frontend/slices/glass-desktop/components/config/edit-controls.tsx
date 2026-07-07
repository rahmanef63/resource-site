"use client";

// glass-desktop — per-widget edit affordances (Build Plan §7 "edit mode").
// Mounts over a widget while the desktop is in edit mode: a remove (×) button
// and a resize control that re-sizes the instance. Both wire to use-layout
// actions (from int:canvas-drag). Rendered by the canvas, absolutely over the card.
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SIZE_CELLS, Z } from "@/features/glass-desktop/config/constants";
import type { WidgetSize } from "@/features/glass-desktop/types";

const SIZE_ORDER: WidgetSize[] = ["SP", "S", "WP", "W", "L"];
const SIZE_LABEL: Record<WidgetSize, string> = {
  SP: "Small pill",
  S: "Square",
  WP: "Wide pill",
  W: "Wide",
  L: "Large",
};

export interface EditControlsProps {
  /** Instance being edited. */
  instanceId: string;
  /** Current size — drives the resize control's checked state. */
  size: WidgetSize;
  /** use-layout remove action (from int:canvas-drag). */
  remove: (instanceId: string) => void;
  /** use-layout resize action (from int:canvas-drag). */
  resize: (instanceId: string, size: WidgetSize) => void;
  className?: string;
}

/**
 * The floating edit toolbar for one widget. Sits top-right over the card at the
 * overlay z-layer, above the glass but below chrome. Motion is hover-only and
 * motion-safe, so reduced-motion users get an instant, static toolbar.
 */
export function EditControls({ instanceId, size, remove, resize, className }: EditControlsProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute right-1.5 top-1.5 flex items-center gap-1",
        className,
      )}
      style={{ zIndex: Z.overlay }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            size="icon-xs"
            aria-label="Resize widget"
            title="Resize widget"
            className={cn(
              "pointer-events-auto border border-solid",
              "[border-color:var(--color-hairline)] hover:[border-color:var(--color-hairline-hover)]",
              "motion-safe:transition-colors motion-safe:[transition-duration:var(--duration-micro)]",
            )}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M11 5v6H5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" style={{ zIndex: Z.overlay }}>
          <DropdownMenuLabel>Size</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={size}
            onValueChange={(next) => resize(instanceId, next as WidgetSize)}
          >
            {SIZE_ORDER.map((s) => {
              const cells = SIZE_CELLS[s];
              return (
                <DropdownMenuRadioItem key={s} value={s}>
                  <span className="flex w-full items-center justify-between gap-3">
                    <span>{SIZE_LABEL[s]}</span>
                    <span className="text-xs [font-family:var(--font-numeric)] opacity-60">
                      {cells.c}×{cells.r}
                    </span>
                  </span>
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        type="button"
        variant="destructive"
        size="icon-xs"
        aria-label="Remove widget"
        title="Remove widget"
        onClick={() => remove(instanceId)}
        className={cn(
          "pointer-events-auto",
          "motion-safe:transition-colors motion-safe:[transition-duration:var(--duration-micro)]",
        )}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M4 4l8 8M12 4l-8 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </Button>
    </div>
  );
}
