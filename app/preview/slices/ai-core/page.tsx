"use client";

import * as React from "react";
import preview from "@/features/ai-core/preview";
import { PreviewSection, SlicePreviewLayout } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AiCorePreview = preview.AiCorePreview;
type Scenario = "confirm" | "error" | "format";

export default function Page() {
  const [scenario, setScenario] = React.useState<Scenario>("confirm");
  return (
    <SlicePreviewLayout
      title="AI Core Kit"
      kind="ui"
      description="Native dialog/confirm flow, provider-safe error presentation, and framework-neutral display formatters."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/ai-core"
    >
      <PreviewSection title="Core behavior" hint={`scenario="${scenario}"`}>
        <div className="mb-4 inline-flex rounded-md border border-input p-0.5">
          {(["confirm", "error", "format"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              variant="ghost"
              onClick={() => setScenario(value)}
              className={cn("h-auto rounded px-3 py-1 text-xs", scenario === value ? "bg-accent font-medium" : "text-muted-foreground")}
            >
              {value}
            </Button>
          ))}
        </div>
        <AiCorePreview variant={{ scenario }} />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
