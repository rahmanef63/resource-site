"use client";

import * as React from "react";
import preview from "@/features/publisher-clean-html/preview";
import {
  PreviewSection,
  SlicePreviewLayout,
} from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PublisherPreview = preview.PublishPreview;
type CssEmission = "inline" | "external";

export default function Page() {
  const [cssEmission, setCssEmission] = React.useState<CssEmission>("inline");

  return (
    <SlicePreviewLayout
      title="Publisher — clean HTML"
      kind="ui"
      description="Clean HTML generation with schema-typed escaping, deduplicated CSS, CSP planning, and a script-disabled iframe preview."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/publisher-clean-html"
    >
      <PreviewSection
        title="Live publish preview"
        hint={`cssEmission="${cssEmission}" · the demo includes an inert <script> string`}
      >
        <div className="mb-4 inline-flex rounded-md border border-input p-0.5">
          {(["inline", "external"] as const).map((mode) => (
            <Button
              key={mode}
              type="button"
              variant="ghost"
              onClick={() => setCssEmission(mode)}
              className={cn(
                "h-auto rounded px-3 py-1 text-xs",
                cssEmission === mode
                  ? "bg-accent font-medium"
                  : "text-muted-foreground",
              )}
            >
              {mode}
            </Button>
          ))}
        </div>
        <PublisherPreview variant={{ cssEmission }} />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
