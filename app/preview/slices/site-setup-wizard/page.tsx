"use client";

import * as React from "react";
import { ThemePresetProvider } from "@/features/theme-presets";
import { WizardPlayground } from "./wizard-playground";

/** site-setup-wizard preview: the real wizard wired to a mock backend +
 *  the REAL theme-presets bridge — browsing presets in the Branding step
 *  re-skins this whole page live, exactly like a fresh template clone. */
export default function Page() {
  return (
    <ThemePresetProvider>
      <main className="min-h-screen bg-background">
        <header className="mx-auto max-w-lg px-6 pt-8 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            site-setup-wizard · v0.1.0
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Wizard first-run untuk template clone-to-own. Step Branding →
            pilih preset warna — halaman ini ikut berganti kulit live.
          </p>
        </header>
        <WizardPlayground />
      </main>
    </ThemePresetProvider>
  );
}
