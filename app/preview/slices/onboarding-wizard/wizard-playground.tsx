"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  groupTweakcnPresets,
  tweakcnSwatches,
  useThemePreset,
} from "@/features/theme-presets";
import { OnboardingWizard, type PresetOption } from "@/features/onboarding-wizard";

/** Wires the wizard to a mock backend + the live theme-presets registry —
 *  same bridge a template host writes (see the slice's HOST-SETUP.md). */
export function WizardPlayground() {
  const { registry, preview } = useThemePreset();
  const [saved, setSaved] = React.useState<Record<string, unknown> | null>(null);

  const presetOptions = React.useMemo<PresetOption[]>(() => {
    if (!registry) return [];
    return groupTweakcnPresets(registry.items).flatMap((g) =>
      g.items.map((p) => ({
        name: p.name,
        group: g.label,
        swatches: tweakcnSwatches(p),
      })),
    );
  }, [registry]);

  if (saved) {
    return (
      <div className="mx-auto grid max-w-lg place-items-center gap-4 px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Tersimpan (mock) — <code className="text-xs">{JSON.stringify(saved)}</code>
        </p>
        <Button variant="outline" size="sm" onClick={() => { setSaved(null); preview(null); }}>
          Ulangi wizard
        </Button>
      </div>
    );
  }

  return (
    <OnboardingWizard
      onDone={() => {}}
      save={async (fields) => setSaved(fields)}
      seedSample={async () => new Promise((r) => setTimeout(r, 600))}
      seeded={false}
      presetOptions={presetOptions}
      defaultPresetLabel="Bawaan template"
      onPresetPreview={preview}
    />
  );
}
