"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StepIdentity, StepContent, StepDone } from "./steps";
import { StepBranding } from "./step-branding";
import type { ImageFieldComponent } from "../lib/types";
import {
  ONBOARDING_STEPS,
  buildOnboardingSavePayload,
  createOnboardingStore,
  normalizePresetOptions,
  type OnboardingFields,
  type PresetOption,
} from "../lib/core";

/**
 * Post-claim onboarding wizard. Portable step/field state lives in lib/core;
 * this component is the React/Next rendering adapter over that core.
 */
export function OnboardingWizard({
  onDone,
  save,
  seedSample,
  seeded,
  ImageField,
  presetOptions,
  defaultPresetLabel,
  onPresetPreview,
  defaultBrandColor = "#c4583a",
}: {
  onDone: () => void;
  save: (fields: Partial<OnboardingFields> & { markOnboarded: true }) => Promise<unknown>;
  seedSample?: () => Promise<unknown>;
  seeded?: boolean;
  ImageField?: ImageFieldComponent;
  presetOptions?: ReadonlyArray<string | PresetOption>;
  defaultPresetLabel?: string;
  onPresetPreview?: (name: string | null) => void;
  defaultBrandColor?: string;
}) {
  const store = React.useMemo(() => createOnboardingStore(defaultBrandColor), [defaultBrandColor]);
  const snapshot = React.useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const [busy, setBusy] = React.useState(false);
  const step = snapshot.step;
  const f = snapshot.fields;
  const set = store.setField;
  const alreadySeeded = snapshot.justSeeded || Boolean(seeded);
  const presets = React.useMemo(() => normalizePresetOptions(presetOptions), [presetOptions]);

  async function finish() {
    setBusy(true);
    try {
      await save(buildOnboardingSavePayload(f));
      onDone();
    } finally {
      setBusy(false);
    }
  }

  async function skip() {
    onPresetPreview?.(null);
    setBusy(true);
    try {
      await save({ markOnboarded: true });
      onDone();
    } finally {
      setBusy(false);
    }
  }

  async function doSeed() {
    if (!seedSample) return;
    setBusy(true);
    try {
      await seedSample();
      store.markSeeded();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 py-10">
      <Card className="w-full max-w-lg border-border/60">
        <CardContent className="p-7">
          <div className="mb-1 flex items-center gap-2 text-primary">
            <Sparkles className="size-4" />
            <span className="text-xs font-medium uppercase tracking-[0.2em]">
              Setup · {step + 1}/{ONBOARDING_STEPS.length}
            </span>
          </div>
          <Progress value={((step + 1) / ONBOARDING_STEPS.length) * 100} className="mb-5 mt-2 h-1.5" />

          {step === 0 && <StepIdentity f={f} set={set} />}
          {step === 1 && (
            <StepBranding
              f={f}
              set={set}
              ImageField={ImageField}
              presetOptions={presets}
              defaultPresetLabel={defaultPresetLabel}
              onPresetPreview={onPresetPreview}
            />
          )}
          {step === 2 && <StepContent alreadySeeded={alreadySeeded} busy={busy} onSeed={doSeed} />}
          {step === 3 && <StepDone siteName={f.siteName} />}

          <div className="mt-7 flex items-center justify-between gap-3">
            {step > 0 ? (
              <Button type="button" variant="ghost" size="sm" onClick={store.prev} disabled={busy}>
                <ArrowLeft className="size-4" /> Kembali
              </Button>
            ) : (
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={skip}
                disabled={busy}
                className="px-0 text-xs text-muted-foreground"
              >
                Lewati setup
              </Button>
            )}
            {step < ONBOARDING_STEPS.length - 1 ? (
              <Button type="button" onClick={store.next} disabled={busy}>
                Lanjut <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button type="button" onClick={finish} disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : "Selesai"} <Check className="size-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
