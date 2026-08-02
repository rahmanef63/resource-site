"use client";
/* Compact theme-preset picker for a shell's own toolbar (menu bar / quick
   settings / control center / shade) — the same live preset switch Settings
   offers, without opening the Settings app. Reuses ThemePresetPicker's exact
   swatch grid inside a popover; the grid's own registry-load + setPreset
   wiring is unchanged, this is only a trigger + positioned panel around it.
   z-[960] — above the highest shell chrome z-index in use (menu-bar/
   notification-center/app-switcher all sit at z-[900]-z-[950]) so the panel
   never renders underneath them regardless of which shell hosts it. */
import { useState } from "react";
import { Palette } from "@phosphor-icons/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ThemePresetPicker } from "./theme-preset-picker";

export function ThemeQuickPicker({
  className,
  align = "end",
}: {
  className?: string;
  align?: "start" | "center" | "end";
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Theme"
          className={cn("grid size-6 place-items-center rounded-md hover:bg-[var(--hover-strong)]", className)}
        >
          <Palette className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} className="z-[960] max-h-80 w-64 overflow-y-auto">
        <ThemePresetPicker />
      </PopoverContent>
    </Popover>
  );
}
