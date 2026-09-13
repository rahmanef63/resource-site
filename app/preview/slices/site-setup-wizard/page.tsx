"use client";

import * as React from "react";
import preview from "@/features/site-setup-wizard/preview";
import {
  PreviewSection,
  SlicePreviewLayout,
} from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WizardPreview = preview.OnboardingWizard;
type PresetPicker = "on" | "off";

export default function Page() {
  const [presetPicker, setPresetPicker] = React.useState<PresetPicker>("on");

  return (
    <SlicePreviewLayout
      title="Site Setup Wizard"
      kind="ui"
      description="First-run identity, branding, seed-content, and completion flow hosted from the canonical slice preview module."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/site-setup-wizard"
    >
      <PreviewSection title="Onboarding flow" hint={`presetPicker="${presetPicker}"`}>
        <div className="mb-4 inline-flex rounded-md border border-input p-0.5">
          {(["on", "off"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              variant="ghost"
              onClick={() => setPresetPicker(value)}
              className={cn(
                "h-auto rounded px-3 py-1 text-xs",
                presetPicker === value ? "bg-accent font-medium" : "text-muted-foreground",
              )}
            >
              preset {value}
            </Button>
          ))}
        </div>
        <WizardPreview variant={{ presetPicker }} />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
