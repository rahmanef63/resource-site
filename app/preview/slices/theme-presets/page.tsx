"use client";

import * as React from "react";
import preview from "@/features/theme-presets/preview";
import {
  PreviewSection,
  SlicePreviewLayout,
} from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SwitcherPreview = preview.ThemePresetSwitcher;
type Size = "sm" | "mobile";

export default function Page() {
  const [size, setSize] = React.useState<Size>("sm");

  return (
    <SlicePreviewLayout
      title="Theme Presets"
      kind="ui"
      description="Unified light/dark/system + bundled tweakcn color preset switcher hosted from the canonical slice preview module."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/theme-presets"
    >
      <PreviewSection title="Theme switcher" hint={`size="${size}"`}>
        <div className="mb-4 inline-flex rounded-md border border-input p-0.5">
          {(["sm", "mobile"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              variant="ghost"
              onClick={() => setSize(value)}
              className={cn(
                "h-auto rounded px-3 py-1 text-xs",
                size === value ? "bg-accent font-medium" : "text-muted-foreground",
              )}
            >
              {value}
            </Button>
          ))}
        </div>
        <SwitcherPreview variant={{ size }} />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
