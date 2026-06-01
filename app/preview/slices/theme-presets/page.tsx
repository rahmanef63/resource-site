"use client";

import { ThemePresetProvider, ThemePresetSwitcher } from "@/features/theme-presets";
import { Button } from "@/components/ui/button";

/** Minimal interactive preview: the unified ThemePresetSwitcher.
 *  Click Palette icon → Popover opens with mode tabs + grouped preset
 *  list. Hover any preset to preview live; click to commit. Persists to
 *  localStorage under `host:theme-preset`. */
export default function Page() {
  return (
    <ThemePresetProvider>
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 bg-background p-6">
        <header className="flex flex-col items-center gap-2 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            theme-presets · v0.2.0
          </p>
          <h1 className="text-2xl font-semibold">One unified switcher</h1>
          <p className="max-w-prose text-sm text-muted-foreground">
            Light/dark/system mode tabs + ~30 tweakcn color presets, all in
            one Popover. Hover any preset to preview live; click to commit.
            Registry ships inside the slice — no public/ setup required.
          </p>
          <ThemePresetSwitcher />
        </header>

        <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Background + foreground
            </p>
            <p className="mt-2 text-lg font-semibold">Sample heading</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tokens follow the active preset live.
            </p>
          </div>
          <div className="rounded-lg border bg-primary p-4 text-primary-foreground">
            <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
              Primary surface
            </p>
            <p className="mt-2 text-lg font-semibold">Primary action</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-3 h-auto rounded-md bg-primary-foreground/10 px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
            >
              Click me
            </Button>
          </div>
          <div className="rounded-lg border bg-accent p-4 text-accent-foreground">
            <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
              Accent surface
            </p>
            <p className="mt-2 text-lg font-semibold">Accent panel</p>
            <p className="mt-1 text-sm opacity-80">
              Uses --accent + --accent-foreground tokens.
            </p>
          </div>
        </div>
      </main>
    </ThemePresetProvider>
  );
}
