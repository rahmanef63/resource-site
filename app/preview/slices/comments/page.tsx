"use client";

import * as React from "react";
import preview from "@/features/comments/preview";
import {
  PreviewSection,
  SlicePreviewLayout,
} from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ThreadPreview = preview.CommentsThread;
type Density = "comfortable" | "compact";
type Resolved = "show" | "hide";

export default function Page() {
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [resolved, setResolved] = React.useState<Resolved>("show");

  return (
    <SlicePreviewLayout
      title="Comments — Threaded"
      kind="full"
      description="Polymorphic targets, reply nesting, forbidden-word guards, and renderless host adapters over one canonical preview module."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/comments"
    >
      <PreviewSection
        title="Thread"
        hint={`density="${density}" · resolved="${resolved}"`}
      >
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="inline-flex rounded-md border border-input p-0.5">
            {(["comfortable", "compact"] as const).map((value) => (
              <Button
                key={value}
                type="button"
                variant="ghost"
                onClick={() => setDensity(value)}
                className={cn(
                  "h-auto rounded px-3 py-1 text-xs",
                  density === value ? "bg-accent font-medium" : "text-muted-foreground",
                )}
              >
                {value}
              </Button>
            ))}
          </div>
          <Button
            type="button"
            size="sm"
            variant={resolved === "show" ? "secondary" : "outline"}
            onClick={() => setResolved((value) => (value === "show" ? "hide" : "show"))}
          >
            resolved: {resolved}
          </Button>
        </div>
        <ThreadPreview variant={{ density, resolved }} />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
