"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import * as React from "react";
import { Button } from "@/components/ui/button";
import type { SlicePreviewModule } from "@/shared/preview/types";
import { OnboardingWizard } from "./components/OnboardingWizard";
import type { PresetOption } from "./lib/types";

const MOCK_PRESETS: PresetOption[] = [
  { name: "modern-minimal", group: "Profesional", swatches: ["#ffffff", "#18181b", "#2563eb", "#e0e7ff", "#dc2626"] },
  { name: "claude", group: "Profesional", swatches: ["#faf9f5", "#28261b", "#c96442", "#dad9d4", "#b91c1c"] },
  { name: "tangerine", group: "Bold", swatches: ["#fdfcfb", "#3c3a36", "#e05d38", "#fbe6df", "#dc2626"] },
  { name: "cosmic-night", group: "Gelap", swatches: ["#0f0c1d", "#e6e3f5", "#a48fff", "#2d2654", "#ff5470"] },
  { name: "ocean-breeze", group: "Gelap", swatches: ["#0c1b1e", "#d8f3f6", "#2dd4bf", "#134e4a", "#f87171"] },
];

const WizardPreview: SlicePreviewModule["OnboardingWizard"] = ({ variant }) => {
  const withPresets = (variant.presetPicker as string) !== "off";
  const [done, setDone] = React.useState(false);

  if (done) {
    return (
      <div className="grid h-64 place-items-center text-sm text-muted-foreground">
        <span>Wizard selesai — settings tersimpan (mock).</span>
        <Button variant="link" size="sm" onClick={() => setDone(false)}>Ulangi</Button>
      </div>
    );
  }
  return (
    <div className="[&>div]:min-h-0 [&>div]:py-6">
      <OnboardingWizard
        onDone={() => setDone(true)}
        save={async () => {}}
        seedSample={async () => {}}
        seeded={false}
        presetOptions={withPresets ? MOCK_PRESETS : undefined}
        defaultPresetLabel="Bawaan template (cosmic-night)"
        onPresetPreview={() => {}}
      />
    </div>
  );
};

const preview: SlicePreviewModule = { OnboardingWizard: WizardPreview };
export default preview;
