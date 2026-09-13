"use client";

import * as React from "react";
import preview from "@/features/library/preview";
import {
  PreviewSection,
  SlicePreviewLayout,
} from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LibraryPreview = preview.LibraryIndex;
type Scenario = "all-kinds" | "prompts-only" | "empty";

export default function Page() {
  const [scenario, setScenario] = React.useState<Scenario>("all-kinds");

  return (
    <SlicePreviewLayout
      title="Library"
      kind="full"
      description="Filterable prompt, snippet, visual, link, and download catalog over the canonical Library preview module."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/library"
    >
      <PreviewSection title="Catalog scenario" hint={`scenario="${scenario}"`}>
        <div className="mb-4 flex flex-wrap gap-2">
          {(["all-kinds", "prompts-only", "empty"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setScenario(value)}
              className={cn(scenario === value && "bg-accent font-medium")}
            >
              {value}
            </Button>
          ))}
        </div>
        <LibraryPreview variant={{ scenario }} />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
