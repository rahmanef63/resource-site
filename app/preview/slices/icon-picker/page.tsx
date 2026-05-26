"use client";

import * as React from "react";
import { IconPickerPopover, DynamicIcon } from "@/features/icon-picker";
import { Button } from "@/components/ui/button";

/** KISS preview.
 *
 *  Two design constraints:
 *
 *  1. Icon size has to be authoritative regardless of Tailwind JIT,
 *     CSS cascade, or SVG-attribute precedence quirks. Solution:
 *     `size={72}` on `<DynamicIcon>`. That triggers the size-explicit
 *     code path: lucide / phosphor get `<Cmp size={72}>` (renders
 *     width=72 height=72 SVG attributes), emoji gets a wrapper with
 *     inline-style `fontSize: 72`. No cascade, no class-name luck.
 *
 *  2. React minified error #418 (hydration mismatch) was firing because
 *     localStorage-backed state (icon style preference, recents) read
 *     during the very first client render diverges from the SSR-rendered
 *     HTML. Even with a `mounted` gate inside the hook, the popover /
 *     dialog primitive layer still touches `useId`, `useLayoutEffect`,
 *     and other render-phase APIs that can desync in production.
 *     Solution: render NOTHING dynamic on SSR. A `<div>` skeleton stands
 *     in until the first effect commits; only then does the interactive
 *     `<IconPickerPopover>` tree mount. SSR = skeleton, CSR initial =
 *     skeleton → identical HTML → hydration cannot mismatch. */
export default function Page() {
  const [icon, setIcon] = React.useState<string | null>("🪺");
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  // SSR + first CSR render. Static placeholder, same on both passes.
  if (!mounted) {
    return (
      <main className="grid min-h-screen place-items-center bg-background">
        <div
          className="rounded-md p-1 font-normal leading-none"
          style={{ width: 80, height: 80 }}
          aria-hidden
        />
      </main>
    );
  }

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
          className="h-auto rounded-md p-1 font-normal leading-none transition hover:bg-accent"
        >
          <DynamicIcon value={icon} size={72} fallback="🪺" />
        </Button>
      </IconPickerPopover>
    </main>
  );
}
