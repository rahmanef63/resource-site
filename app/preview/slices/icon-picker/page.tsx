"use client";

import * as React from "react";
import { IconPickerPopover, DynamicIcon } from "@/features/icon-picker";
import { Button } from "@/components/ui/button";

/** Minimal interactive preview: one hero icon button.
 *  Mirrors silong's `PageTitle` 1:1 — the canonical "Notion page hero
 *  icon" recipe. Two CSS knobs do all the work:
 *    - `text-[78px]` cascades font-size to DynamicIcon's wrapper, so
 *      emoji glyphs (which render at font-size) hit 78px.
 *    - `[&_svg]:size-[78px]` is the safety net: any SVG descendant
 *      (lucide outline, phosphor fill) gets explicit width=78 height=78
 *      via Tailwind's arbitrary descendant selector. Overrides lucide's
 *      hardcoded `width=24` SVG attribute regardless of browser
 *      cascade quirks.
 *  DynamicIcon is called with NO `size` prop so the wrapper inherits
 *  font-size from the button (same code path silong uses). */
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
          variant="ghost"
          type="button"
          aria-label="Open icon picker"
          className="h-auto rounded-md p-1 text-[78px] font-normal leading-none transition [&_svg]:size-[78px]"
        >
          <DynamicIcon value={icon} fallback="🪺" />
        </Button>
      </IconPickerPopover>
    </main>
  );
}
