"use client";

import { ThemePresetProvider } from "@/features/theme-presets";
import { SwitcherSpotlight } from "./SwitcherSpotlight";
import { ThemeWidgets } from "./theme-widgets";

/** theme-presets preview: a live "theme playground". The spotlighted switcher
 *  (labelled pill + bouncing arrow) makes the trigger obvious; the shadcn
 *  widget board below re-skins instantly when a preset is picked. Hover any
 *  preset to preview live; click to commit. */
export default function Page() {
  return (
    <ThemePresetProvider>
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center gap-8 bg-background px-6 py-10">
        <header className="flex flex-col items-center gap-3 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            theme-presets · v0.2.0
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Theme playground</h1>
          <p className="max-w-prose text-sm text-muted-foreground">
            Light / dark / system + ~30 tweakcn color presets in one Popover.
            The registry ships inside the slice — no <code>globals.css</code>{" "}
            setup. Pick one and watch every widget below re-skin.
          </p>
          <SwitcherSpotlight />
        </header>

        <ThemeWidgets />
      </main>
    </ThemePresetProvider>
  );
}
