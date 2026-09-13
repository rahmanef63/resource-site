"use client";

import * as React from "react";
import preview from "@/features/content-loops/preview";
import {
  PreviewSection,
  SlicePreviewLayout,
} from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ContentLoopsPreview = preview.ContentLoop;
type Pagination = "none" | "infinite";

export default function Page() {
  const [pagination, setPagination] = React.useState<Pagination>("none");

  return (
    <SlicePreviewLayout
      title="Content Loops"
      kind="ui"
      description="Source-driven repeater with namespaced source lookup, deterministic variant round-robin, and shared none/infinite pagination semantics."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/content-loops"
    >
      <PreviewSection
        title="Live repeater"
        hint={`pagination="${pagination}" · infinite mode loads 3 more items per click`}
      >
        <div className="mb-4 inline-flex rounded-md border border-input p-0.5">
          {(["none", "infinite"] as const).map((mode) => (
            <Button
              key={mode}
              type="button"
              variant="ghost"
              onClick={() => setPagination(mode)}
              className={cn(
                "h-auto rounded px-3 py-1 text-xs",
                pagination === mode
                  ? "bg-accent font-medium"
                  : "text-muted-foreground",
              )}
            >
              {mode}
            </Button>
          ))}
        </div>
        <ContentLoopsPreview variant={{ pagination }} />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
