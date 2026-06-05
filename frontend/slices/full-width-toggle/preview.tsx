"use client";

/**
 * Variant preview (VP wave) — rr-internal, stripped on `rr add`.
 * Demos FullWidthToggle's three chrome variants; the toggle persists via the
 * slice's own localStorage key, so no demo store is needed here.
 */

import type { SlicePreviewModule } from "@/shared/preview/types";
import { cn } from "@/lib/utils";
import { FullWidthToggle } from "./components/FullWidthToggle";
import { useFullWidth, widthClass } from "./lib/use-full-width";

function SampleSurface() {
  const [mode] = useFullWidth();
  return (
    <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 p-1">
      <div
        className={cn(
          widthClass(mode),
          "mx-auto rounded-md border border-border bg-background px-4 py-6 text-center text-xs text-muted-foreground transition-all",
        )}
      >
        page container — <span className="font-medium text-foreground">{mode}</span>
      </div>
    </div>
  );
}

const preview: SlicePreviewModule = {
  FullWidthToggle: ({ variant }) => (
    <div className="p-4">
      <FullWidthToggle
        variant={(variant.variant as "icon" | "button" | "segment") ?? "icon"}
      />
      <SampleSurface />
    </div>
  ),
};

export default preview;
