"use client";

import { ThemePicker } from "@/features/theme-presets";

/** Minimal interactive preview: 30+ theme preset swatches.
 *  Click any tile → applies CSS variable overrides live, persists to
 *  localStorage under nosion:theme-preset key. */
export default function Page() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl bg-background p-6">
      <header className="mb-6 space-y-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">tweakcn loader</p>
        <h1 className="text-2xl font-semibold">Theme presets</h1>
        <p className="text-sm text-muted-foreground">
          Click any preset. CSS vars apply live. Reload to see persistence.
        </p>
      </header>
      <ThemePicker />
    </main>
  );
}
