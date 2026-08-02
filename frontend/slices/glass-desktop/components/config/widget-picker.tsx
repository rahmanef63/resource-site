"use client";

// glass-desktop — the ADD-widget config surface (Build Plan §7 "widget gallery").
// A glass dialog listing every widget in the registry, grouped by family, as
// small schematic preview cards. Clicking a card calls add(widgetId, space)
// and closes. Read-only over the registry — one card per WidgetDef.
import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SIZE_CELLS } from "@/features/glass-desktop/config/constants";
import { widgetRegistry } from "@/features/glass-desktop/lib/widget-registry";
import type {
  WidgetDef,
  WidgetFamily,
  WidgetRegistry,
} from "@/features/glass-desktop/types";

const FAMILY_LABEL: Record<WidgetFamily, string> = {
  time: "Time",
  timers: "Timers",
  calendar: "Calendar",
  weather: "Weather",
  media: "Media",
  system: "System",
  utilities: "Utilities",
  social: "Social",
  people: "People",
  finance: "Finance",
  analytics: "Analytics",
};

const FAMILY_ORDER = Object.keys(FAMILY_LABEL) as WidgetFamily[];

// Schematic preview units — keep the 150:71 cell ratio so a wide pill reads wide.
const U_W = 22;
const U_H = 11;
const U_GAP = 2;

export interface WidgetPickerProps {
  /** Dialog visibility (controlled). */
  open: boolean;
  /** Visibility change handler — also fired on add() to close. */
  onOpenChange: (open: boolean) => void;
  /** Space the chosen widget is added to. */
  activeSpace: 0 | 1;
  /** use-layout add action (from int:canvas-drag). */
  add: (widgetId: string, space: 0 | 1) => void;
  /** Override the registry (defaults to the slice registry). */
  registry?: WidgetRegistry;
}

/**
 * Lucent widget gallery. Groups the registry by family, renders a schematic
 * card per widget, and adds the widget to `activeSpace` on click.
 */
export function WidgetPicker({
  open,
  onOpenChange,
  activeSpace,
  add,
  registry = widgetRegistry,
}: WidgetPickerProps) {
  const groups = useMemo(() => {
    const byFamily = new Map<WidgetFamily, WidgetDef[]>();
    for (const def of Object.values(registry)) {
      const list = byFamily.get(def.family) ?? [];
      list.push(def);
      byFamily.set(def.family, list);
    }
    return FAMILY_ORDER.filter((f) => byFamily.has(f)).map((family) => ({
      family,
      defs: byFamily.get(family)!.sort((a, b) => a.title.localeCompare(b.title)),
    }));
  }, [registry]);

  const empty = groups.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "max-w-3xl gap-4 border-solid p-0",
          "[border-color:var(--color-hairline)]",
          "[background:linear-gradient(var(--color-glass-hi),var(--color-glass-lo))]",
          "[backdrop-filter:blur(var(--blur-glass))_saturate(140%)]",
          "[border-radius:var(--radius-widget)] [box-shadow:var(--shadow-widget)]",
        )}
      >
        <DialogHeader className="px-5 pt-5">
          <DialogTitle style={{ color: "var(--color-ink-hi)" }}>Add a widget</DialogTitle>
          <DialogDescription style={{ color: "var(--color-ink-mid)" }}>
            Pick a widget to drop onto this space.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-5 pb-5">
          {empty ? (
            <p className="py-10 text-center text-sm" style={{ color: "var(--color-ink-low)" }}>
              No widgets registered yet.
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {groups.map(({ family, defs }) => (
                <section key={family} className="flex flex-col gap-2">
                  <h3
                    className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: "var(--color-ink-low)" }}
                  >
                    {FAMILY_LABEL[family]}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {defs.map((def) => {
                      const cells = SIZE_CELLS[def.size];
                      return (
                        <Button
                          key={def.id}
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            add(def.id, activeSpace);
                            onOpenChange(false);
                          }}
                          className={cn(
                            "h-auto flex-col items-start gap-2 border border-solid p-3 text-left",
                            "[border-color:var(--color-hairline)]",
                            "hover:[border-color:var(--color-hairline-hover)]",
                            "[border-radius:var(--radius-control)]",
                            "motion-safe:transition-colors motion-safe:[transition-duration:var(--duration-micro)]",
                          )}
                        >
                          <span
                            aria-hidden
                            className="inline-block"
                            style={{
                              width: cells.c * U_W + (cells.c - 1) * U_GAP,
                              height: cells.r * U_H + (cells.r - 1) * U_GAP,
                              borderRadius: "var(--radius-control)",
                              background: "linear-gradient(var(--color-glass-hi),var(--color-glass-lo))",
                              border: "1px solid var(--color-hairline)",
                            }}
                          />
                          <span className="w-full">
                            <span
                              className="block truncate text-sm font-medium"
                              style={{ color: "var(--color-ink-hi)" }}
                            >
                              {def.title}
                            </span>
                            <span
                              className="block text-xs [font-family:var(--font-numeric)]"
                              style={{ color: "var(--color-ink-low)" }}
                            >
                              {cells.c}×{cells.r}
                            </span>
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
