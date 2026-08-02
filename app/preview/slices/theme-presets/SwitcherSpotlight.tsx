"use client";

/** Preview-only spotlight around the ThemePresetSwitcher. The slice's default
 *  trigger is a compact header icon — easy to miss — so the preview wraps it
 *  in a labelled, ringed pill with a bouncing arrow so a first-time visitor
 *  sees exactly where to click to change the theme + color preset. */

import { ArrowDown } from "lucide-react";
import { ThemePresetSwitcher } from "@/features/theme-presets";

export function SwitcherSpotlight() {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
        Click to change theme &amp; color preset
      </span>
      <ArrowDown className="h-5 w-5 animate-bounce text-primary" aria-hidden />
      <div className="rounded-full ring-2 ring-primary ring-offset-2 ring-offset-background">
        <ThemePresetSwitcher triggerClassName="!h-11 !w-auto gap-1.5 rounded-full border-2 border-primary/60 bg-card px-5 text-foreground shadow-md hover:bg-accent hover:text-accent-foreground" />
      </div>
      <span className="text-[11px] text-muted-foreground">~30 tweakcn presets · light / dark / system</span>
    </div>
  );
}
