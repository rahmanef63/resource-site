"use client";

import * as React from "react";
import { IconPickerPopover, DynamicIcon } from "@/features/icon-picker";
import { Button } from "@/components/ui/button";

/** Minimal interactive preview: one icon button.
 *  Click → IconPickerPopover opens with full picker (emoji, lucide,
 *  colors, search, recents). Same component shipped to consumer
 *  projects via `npx rr add icon-picker`. */
export default function Page() {
  const [icon, setIcon] = React.useState<string | null>("🪺");
  return (
    <main className="grid min-h-screen place-items-center bg-background">
      <IconPickerPopover
        value={icon}
        onChange={(next) => setIcon(next)}
        onClear={() => setIcon(null)}
        align="center"
      >
        <Button
          variant="outline"
          type="button"
          aria-label="Open icon picker"
          className="group/icon grid h-auto size-24 place-items-center rounded-xl border-border bg-card transition hover:bg-accent hover:shadow-md"
        >
          <DynamicIcon
            value={icon}
            className="size-12 text-5xl leading-none transition group-hover/icon:scale-110"
            fallback="🪺"
          />
        </Button>
      </IconPickerPopover>
    </main>
  );
}
