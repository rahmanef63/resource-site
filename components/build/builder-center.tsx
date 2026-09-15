"use client";

import * as React from "react";
import { ThreeColumnLayoutAdvanced } from "@/components/previews/three-column/ThreeColumnLayout";
import type { BuildSelection } from "@/lib/build/types";
import type { CommandBlock } from "@/lib/build/command-builder";
import type { CompatWarning } from "@/lib/build/compat";
import type { TemplateOption } from "./template-picker";
import type { FeatureOption } from "./feature-picker";
import type { ParsedRr } from "./existing-rr-uploader";
import { InputsPanel } from "./inputs-panel";
import { LivePreview } from "./live-preview";
import { SlicePreviews } from "./variant-preview";
import { AiAssistant } from "./ai-assistant";
import { CommandOutput } from "./command-output";

export function BuilderCenter({
  sel, setSel, rr, setRr, templates, featureOptions,
  toggleFeature, toggleSlice, toggleSkill, commandBlocks, filename, warnings,
}: {
  sel: BuildSelection;
  setSel: React.Dispatch<React.SetStateAction<BuildSelection>>;
  rr: ParsedRr | null;
  setRr: (rr: ParsedRr | null) => void;
  templates: TemplateOption[];
  featureOptions: FeatureOption[];
  toggleFeature: (slug: string) => void;
  toggleSlice: (slug: string) => void;
  toggleSkill: (slug: string) => void;
  commandBlocks: CommandBlock[];
  filename: string;
  warnings: CompatWarning[];
}) {
  const tplMeta = templates.find((t) => t.slug === sel.template) ?? null;
  return (
    <div className="min-h-0 h-full flex-1">
      <ThreeColumnLayoutAdvanced
        left={
          <InputsPanel templates={templates} featureOptions={featureOptions} sel={sel} setSel={setSel}
            rr={rr} setRr={setRr} toggleFeature={toggleFeature} toggleSlice={toggleSlice} toggleSkill={toggleSkill} />
        }
        center={
          <div className="h-full overflow-auto p-3 sm:p-4">
            <LivePreview templateSlug={sel.template} publicPath={tplMeta?.previewPath} adminPath={tplMeta?.adminPreviewPath} defaultSurface={tplMeta?.defaultSurface} />
            <SlicePreviews selected={sel.slices} />
            <AiAssistant />
          </div>
        }
        right={<div className="h-full overflow-auto p-3"><CommandOutput blocks={commandBlocks} filename={filename} warnings={warnings} /></div>}
        leftLabel="Inputs"
        rightLabel="Commands"
        leftWidth={360}
        rightWidth={380}
        centerMinWidth={360}
        showCollapseButtons
        resizable
        persistState
        storageKey="builder-inner-v3"
        tone="feature"
        className="h-full"
      />
    </div>
  );
}
