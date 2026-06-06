"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import { ThemeProvider } from "next-themes";
import type { SlicePreviewModule } from "@/shared/preview/types";
import { ThemePresetProvider } from "./components/ThemePresetProvider";
import { ThemePresetSwitcher } from "./components/ThemePresetSwitcher";

const ThemePreview: SlicePreviewModule["ThemePresetSwitcher"] = ({ variant }) => {
  const size = (variant.size as "sm" | "mobile") ?? "sm";

  return (
    <div className="p-4">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ThemePresetProvider>
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-4">
            <ThemePresetSwitcher size={size} />
            <span className="text-xs text-muted-foreground">
              Click the palette trigger — mode tabs + bundled tweakcn presets.
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="h-10 rounded-md bg-primary" />
            <div className="h-10 rounded-md bg-secondary" />
            <div className="h-10 rounded-md bg-accent" />
          </div>
        </ThemePresetProvider>
      </ThemeProvider>
    </div>
  );
};

const preview: SlicePreviewModule = { ThemePresetSwitcher: ThemePreview };
export default preview;
